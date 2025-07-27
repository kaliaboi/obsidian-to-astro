#!/usr/bin/env node

import { Command } from 'commander';
import { convertObsidianToAstro } from './converter';
import * as path from 'path';

const program = new Command();

program
  .name('obsidian-to-astro')
  .description('Convert Obsidian notes to Astro-compatible markdown files')
  .version('1.0.0');

const convertCommand = new Command('convert')
  .description('Convert Obsidian vault to Astro content')
  .argument('<input>', 'Path to Obsidian vault directory')
  .argument('<output>', 'Path to Astro content directory')
  .option('-p, --preserve-structure', 'Preserve original directory structure')
  .option('-f, --frontmatter', 'Add Astro frontmatter to converted files')
  .option('-b, --base-url <url>', 'Base URL prefix for internal links (e.g., /blog)')
  .option('--dry-run', 'Show what would be converted without making changes')
  .action(async (input: string, output: string, options) => {
    try {
      // Validate input arguments
      if (!input || !output) {
        console.error('Error: Both input and output paths are required');
        process.exit(1);
      }

      const inputPath = path.resolve(input);
      const outputPath = path.resolve(output);
      
      // Validate paths don't overlap
      if (inputPath === outputPath) {
        console.error('Error: Input and output paths cannot be the same');
        process.exit(1);
      }

      if (outputPath.startsWith(inputPath)) {
        console.error('Error: Output path cannot be inside input path');
        process.exit(1);
      }

      // Validate baseUrl format if provided
      if (options.baseUrl && !options.baseUrl.startsWith('/')) {
        console.error('Error: Base URL must start with "/" (e.g., /blog)');
        process.exit(1);
      }

      console.log(`Converting: ${inputPath} → ${outputPath}`);
      if (options.baseUrl) {
        console.log(`Using base URL: ${options.baseUrl}`);
      }
      
      const result = await convertObsidianToAstro(inputPath, outputPath, options);
      
      // Report results
      if (result.errors.length > 0) {
        console.error(`\nConversion completed with ${result.errors.length} errors:`);
        result.errors.forEach(error => console.error(`  ❌ ${error}`));
      }

      if (options.dryRun) {
        console.log('\n✅ Dry run completed. No files were modified.');
      } else {
        console.log(`\n✅ Successfully converted ${result.processedFiles} files with ${result.convertedLinks} links`);
        console.log(`   Source: ${inputPath}`);
        console.log(`   Target: ${outputPath}`);
      }

      // Exit with error code if there were errors
      if (result.errors.length > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error('\n❌ Conversion failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.addCommand(convertCommand);
program.parse();