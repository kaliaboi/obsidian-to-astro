import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { ObsidianLinkParser, ParsedLink } from './link-parser';

export interface ConversionOptions {
  preserveStructure?: boolean;
  frontmatter?: boolean;
  dryRun?: boolean;
  baseUrl?: string;
}

export interface ConversionResult {
  processedFiles: number;
  convertedLinks: number;
  errors: string[];
}

export class ObsidianToAstroConverter {
  private inputPath: string;
  private outputPath: string;
  private options: ConversionOptions;
  private fileMap: Map<string, string> = new Map();

  constructor(inputPath: string, outputPath: string, options: ConversionOptions = {}) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.options = options;
  }

  async convert(): Promise<ConversionResult> {
    const result: ConversionResult = {
      processedFiles: 0,
      convertedLinks: 0,
      errors: []
    };

    try {
      // Validate input directory exists
      if (!await fs.pathExists(this.inputPath)) {
        throw new Error(`Input directory does not exist: ${this.inputPath}`);
      }

      // Validate input is a directory
      const inputStat = await fs.stat(this.inputPath);
      if (!inputStat.isDirectory()) {
        throw new Error(`Input path is not a directory: ${this.inputPath}`);
      }

      // Create output directory if it doesn't exist
      await fs.ensureDir(this.outputPath);

      // Find all markdown files in the input directory
      const markdownFiles = await this.findMarkdownFiles();
      
      if (markdownFiles.length === 0) {
        console.warn(`No markdown files found in ${this.inputPath}`);
        return result;
      }

      console.log(`Found ${markdownFiles.length} markdown files to process`);
      
      // Build file mapping for link resolution
      await this.buildFileMap(markdownFiles);

      // Process each file
      for (const filePath of markdownFiles) {
        try {
          await this.processFile(filePath, result);
          result.processedFiles++;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          result.errors.push(`Error processing ${filePath}: ${errorMsg}`);
          console.error(`Error processing ${filePath}:`, error);
        }
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      result.errors.push(`Conversion failed: ${errorMsg}`);
      return result;
    }
  }

  private async findMarkdownFiles(): Promise<string[]> {
    const pattern = path.join(this.inputPath, '**/*.md');
    return await glob(pattern);
  }

  private async buildFileMap(files: string[]): Promise<void> {
    for (const file of files) {
      const relativePath = path.relative(this.inputPath, file);
      const baseName = path.basename(file, '.md');
      this.fileMap.set(baseName, relativePath);
    }
  }

  private async processFile(inputFile: string, result: ConversionResult): Promise<void> {
    // Read the file
    const content = await fs.readFile(inputFile, 'utf-8');
    const parsed = matter(content);

    // Convert links in the content
    const { convertedContent, linkCount } = this.convertLinks(parsed.content);
    result.convertedLinks += linkCount;

    // Prepare frontmatter
    const frontmatter = this.prepareFrontmatter(parsed.data, inputFile);

    // Combine frontmatter and content
    const finalContent = matter.stringify(convertedContent, frontmatter);

    // Determine output path
    const outputFile = this.getOutputPath(inputFile);

    if (!this.options.dryRun) {
      // Ensure output directory exists
      await fs.ensureDir(path.dirname(outputFile));
      
      // Write the converted file
      await fs.writeFile(outputFile, finalContent, 'utf-8');
    }

    console.log(`${this.options.dryRun ? '[DRY RUN] ' : ''}Processed: ${path.relative(this.inputPath, inputFile)} -> ${path.relative(this.outputPath, outputFile)}`);
  }

  private convertLinks(content: string): { convertedContent: string; linkCount: number } {
    const links = ObsidianLinkParser.parseLinks(content);
    let convertedContent = content;
    let linkCount = 0;

    for (const link of links) {
      const markdownLink = this.convertLinkToMarkdown(link);
      convertedContent = convertedContent.replace(link.original, markdownLink);
      linkCount++;
    }

    return { convertedContent, linkCount };
  }

  private convertLinkToMarkdown(link: ParsedLink): string {
    // Check if the linked file exists in our file map
    const targetFile = this.fileMap.get(link.noteName);
    
    let url: string;
    const baseUrl = this.options.baseUrl || '';
    
    if (targetFile) {
      // Convert file path to URL-friendly format
      const urlPath = targetFile.replace(/\.md$/, '').replace(/\\/g, '/');
      url = this.options.preserveStructure ? `${baseUrl}/${urlPath}` : `${baseUrl}/${this.sanitizeFileName(link.noteName)}`;
    } else {
      // File doesn't exist, create a placeholder link
      url = `${baseUrl}/${this.sanitizeFileName(link.noteName)}`;
    }

    if (link.heading) {
      const headingAnchor = this.createHeadingAnchor(link.heading);
      url += `#${headingAnchor}`;
    }

    const displayText = link.alias || link.noteName;

    if (link.isEmbed) {
      // For embeds, we'll create a callout or simple reference
      return `> [See: ${displayText}](${url})`;
    }

    return `[${displayText}](${url})`;
  }

  private prepareFrontmatter(existingData: any, filePath: string): any {
    const frontmatter = { ...existingData };

    if (this.options.frontmatter) {
      // Add Astro-specific frontmatter if requested
      if (!frontmatter.title) {
        frontmatter.title = path.basename(filePath, '.md');
      }
      
      if (!frontmatter.publishDate) {
        const stats = fs.statSync(filePath);
        frontmatter.publishDate = stats.mtime.toISOString().split('T')[0];
      }
    }

    return frontmatter;
  }

  private getOutputPath(inputFile: string): string {
    const relativePath = path.relative(this.inputPath, inputFile);
    
    if (this.options.preserveStructure) {
      return path.join(this.outputPath, relativePath);
    } else {
      // Flatten structure
      const fileName = path.basename(inputFile);
      return path.join(this.outputPath, fileName);
    }
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private createHeadingAnchor(heading: string): string {
    return heading
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export async function convertObsidianToAstro(
  inputPath: string,
  outputPath: string,
  options: ConversionOptions = {}
): Promise<ConversionResult> {
  const converter = new ObsidianToAstroConverter(inputPath, outputPath, options);
  return await converter.convert();
}