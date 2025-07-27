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