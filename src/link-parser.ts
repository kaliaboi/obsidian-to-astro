export interface ParsedLink {
  original: string;
  noteName: string;
  alias?: string;
  heading?: string;
  blockRef?: string;
  isEmbed: boolean;
}

export class ObsidianLinkParser {
  private static readonly WIKILINK_REGEX = /(!?)\[\[([^\]]+)\]\]/g;
  private static readonly HEADING_SEPARATOR = '#';
  private static readonly BLOCK_SEPARATOR = '^';
  private static readonly ALIAS_SEPARATOR = '|';

  static parseLinks(content: string): ParsedLink[] {
    const links: ParsedLink[] = [];
    let match;

    while ((match = this.WIKILINK_REGEX.exec(content)) !== null) {
      const [fullMatch, embedPrefix, linkContent] = match;
      const isEmbed = embedPrefix === '!';
      
      links.push(this.parseLinkContent(fullMatch, linkContent, isEmbed));
    }

    return links;
  }

  private static parseLinkContent(original: string, linkContent: string, isEmbed: boolean): ParsedLink {
    let noteName = linkContent;
    let alias: string | undefined;
    let heading: string | undefined;
    let blockRef: string | undefined;

    // Parse alias (comes after |)
    const aliasIndex = linkContent.indexOf(this.ALIAS_SEPARATOR);
    if (aliasIndex !== -1) {
      alias = linkContent.substring(aliasIndex + 1).trim();
      noteName = linkContent.substring(0, aliasIndex);
    }

    // Parse block reference (comes after ^)
    const blockIndex = noteName.indexOf(this.BLOCK_SEPARATOR);
    if (blockIndex !== -1) {
      blockRef = noteName.substring(blockIndex + 1).trim();
      noteName = noteName.substring(0, blockIndex);
    }

    // Parse heading (comes after #)
    const headingIndex = noteName.indexOf(this.HEADING_SEPARATOR);
    if (headingIndex !== -1) {
      heading = noteName.substring(headingIndex + 1).trim();
      noteName = noteName.substring(0, headingIndex);
    }

    return {
      original,
      noteName: noteName.trim(),
      alias,
      heading,
      blockRef,
      isEmbed
    };
  }

  static convertToMarkdownLink(link: ParsedLink, baseUrl: string = ''): string {
    const fileName = this.sanitizeFileName(link.noteName);
    let url = baseUrl ? `${baseUrl}/${fileName}` : `/${fileName}`;
    
    if (link.heading) {
      const headingAnchor = this.createHeadingAnchor(link.heading);
      url += `#${headingAnchor}`;
    }

    const displayText = link.alias || link.noteName;

    if (link.isEmbed) {
      // For embeds, we'll create a simple markdown link since Astro doesn't have direct embed support
      return `[${displayText}](${url})`;
    }

    return `[${displayText}](${url})`;
  }

  private static sanitizeFileName(fileName: string): string {
    // Convert to lowercase and replace spaces with hyphens for URL-friendly names
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private static createHeadingAnchor(heading: string): string {
    // Convert heading to URL fragment following markdown conventions
    return heading
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}