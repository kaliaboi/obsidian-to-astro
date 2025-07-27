# Obsidian to Astro Converter

A CLI tool that converts Obsidian notes to Astro-compatible markdown files, preserving internal links and converting them to proper markdown format.

## Features

- Converts Obsidian wikilinks (`[[note]]`) to markdown links (`[note](note)`)
- Supports link aliases (`[[note|alias]]` → `[alias](note)`)
- Handles heading links (`[[note#heading]]`)
- Converts embedded notes (`![[note]]`) to reference links
- Preserves existing frontmatter and optionally adds Astro-specific metadata
- Supports both flat and hierarchical output structures

## Installation

```bash
npm install
npm run build
```

## Usage

### Basic Conversion

```bash
npm run start convert ./my-vault ./astro-content
```

### With Options

```bash
# Preserve directory structure
npm run start convert ./my-vault ./astro-content --preserve-structure

# Add Astro frontmatter
npm run start convert ./my-vault ./astro-content --frontmatter

# Add base URL prefix for internal links
npm run start convert ./my-vault ./astro-content --base-url /blog

# Dry run (preview changes without modifying files)
npm run start convert ./my-vault ./astro-content --dry-run

# Combine multiple options
npm run start convert ./my-vault ./astro-content --base-url /blog --frontmatter
```

## Link Conversion Examples

| Obsidian Format | Default Output | With `--base-url /blog` |
|----------------|----------------|------------------------|
| `[[Note Name]]` | `[Note Name](/note-name)` | `[Note Name](/blog/note-name)` |
| `[[Note Name\|Alias]]` | `[Alias](/note-name)` | `[Alias](/blog/note-name)` |
| `[[Note#Heading]]` | `[Note](/note#heading)` | `[Note](/blog/note#heading)` |
| `[[Note#Heading\|Alias]]` | `[Alias](/note#heading)` | `[Alias](/blog/note#heading)` |
| `![[Embedded Note]]` | `> [See: Embedded Note](/embedded-note)` | `> [See: Embedded Note](/blog/embedded-note)` |

## Supported Obsidian Features

- ✅ Basic wikilinks
- ✅ Link aliases
- ✅ Heading links
- ✅ Embedded notes (converted to reference links)
- ✅ Existing frontmatter preservation
- ❌ Block references (planned for future release)
- ❌ Image embeds (use standard markdown syntax)

## Development

```bash
# Run in development mode
npm run dev convert ./test-vault ./output

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
src/
├── index.ts          # CLI entry point
├── converter.ts      # Main conversion logic
└── link-parser.ts    # Obsidian link parsing
tests/
├── link-parser.test.ts  # Unit tests
test-vault/           # Sample Obsidian notes for testing
```

## Testing

The project includes a test vault with sample Obsidian notes demonstrating various link types and structures.

## Limitations & Known Issues

### Frontmatter Template Compatibility

The tool currently outputs a **basic frontmatter format**:
```yaml
---
title: string
description: string  
pubDate: date
---
```

**Different Astro templates may require different schemas:**

- **Blog templates**: May need `author`, `tags`, `heroImage`, `featured`
- **Documentation**: May need `sidebar.order`, `editUrl`, `draft`
- **Portfolio**: May need `excerpt`, `seo.title`, `isFeatured`

### Current Workarounds:

1. **Check your target Astro template's `content.config.ts`** to see required fields
2. **Run the converter** with basic conversion
3. **Post-process** the output files to match your schema

### Planned Features (v1.0+):

- 🔄 **Template profiles**: `--template astro-blog`, `--template astro-docs`
- ⚙️ **Configuration file**: `.obsidian-to-astro.json` for custom schemas
- 🔍 **Schema auto-detection**: Analyze existing content structure
- 📝 **Custom field mapping**: Map Obsidian properties to Astro fields

### Other Limitations:

- ❌ Block references (`[[note^block]]`) not yet supported
- ❌ Image embeds use standard markdown syntax only
- ❌ No batch processing of multiple vaults
- ❌ No backup functionality (always run with `--dry-run` first!)

## Contributing

See limitations above for areas where contributions would be most valuable!