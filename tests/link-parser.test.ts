import { ObsidianLinkParser, ParsedLink } from '../src/link-parser';

describe('ObsidianLinkParser', () => {
  describe('parseLinks', () => {
    it('should parse basic wikilinks', () => {
      const content = 'This is a [[simple link]] in text.';
      const links = ObsidianLinkParser.parseLinks(content);
      
      expect(links).toHaveLength(1);
      expect(links[0]).toEqual({
        original: '[[simple link]]',
        noteName: 'simple link',
        alias: undefined,
        heading: undefined,
        blockRef: undefined,
        isEmbed: false
      });
    });

    it('should parse wikilinks with aliases', () => {
      const content = 'Check out [[Long Note Name|Short Alias]].';
      const links = ObsidianLinkParser.parseLinks(content);
      
      expect(links).toHaveLength(1);
      expect(links[0]).toEqual({
        original: '[[Long Note Name|Short Alias]]',
        noteName: 'Long Note Name',
        alias: 'Short Alias',
        heading: undefined,
        blockRef: undefined,
        isEmbed: false
      });
    });

    it('should parse wikilinks with headings', () => {
      const content = 'See [[Note#Section Heading]] for details.';
      const links = ObsidianLinkParser.parseLinks(content);
      
      expect(links).toHaveLength(1);
      expect(links[0]).toEqual({
        original: '[[Note#Section Heading]]',
        noteName: 'Note',
        alias: undefined,
        heading: 'Section Heading',
        blockRef: undefined,
        isEmbed: false
      });
    });

    it('should parse embedded notes', () => {
      const content = 'Here is an embedded note: ![[Embedded Note]]';
      const links = ObsidianLinkParser.parseLinks(content);
      
      expect(links).toHaveLength(1);
      expect(links[0]).toEqual({
        original: '![[Embedded Note]]',
        noteName: 'Embedded Note',
        alias: undefined,
        heading: undefined,
        blockRef: undefined,
        isEmbed: true
      });
    });

    it('should parse multiple links in content', () => {
      const content = 'Link to [[Note 1]] and [[Note 2|Alias]] and ![[Embedded]].';
      const links = ObsidianLinkParser.parseLinks(content);
      
      expect(links).toHaveLength(3);
      expect(links[0].noteName).toBe('Note 1');
      expect(links[1].noteName).toBe('Note 2');
      expect(links[1].alias).toBe('Alias');
      expect(links[2].isEmbed).toBe(true);
    });
  });

  describe('convertToMarkdownLink', () => {
    it('should convert basic wikilink to markdown', () => {
      const link: ParsedLink = {
        original: '[[Test Note]]',
        noteName: 'Test Note',
        isEmbed: false
      };
      
      const markdown = ObsidianLinkParser.convertToMarkdownLink(link);
      expect(markdown).toBe('[Test Note](/test-note)');
    });

    it('should convert wikilink with alias', () => {
      const link: ParsedLink = {
        original: '[[Test Note|Alias]]',
        noteName: 'Test Note',
        alias: 'Alias',
        isEmbed: false
      };
      
      const markdown = ObsidianLinkParser.convertToMarkdownLink(link);
      expect(markdown).toBe('[Alias](/test-note)');
    });

    it('should handle base URL', () => {
      const link: ParsedLink = {
        original: '[[Test Note]]',
        noteName: 'Test Note',
        isEmbed: false
      };
      
      const markdown = ObsidianLinkParser.convertToMarkdownLink(link, '/blog');
      expect(markdown).toBe('[Test Note](/blog/test-note)');
    });

    it('should convert embed to reference link', () => {
      const link: ParsedLink = {
        original: '![[Embedded Note]]',
        noteName: 'Embedded Note',
        isEmbed: true
      };
      
      const markdown = ObsidianLinkParser.convertToMarkdownLink(link);
      expect(markdown).toBe('[Embedded Note](/embedded-note)');
    });
  });
});