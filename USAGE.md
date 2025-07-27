# Usage Examples

## Basic Conversion

Convert Obsidian vault to Astro content directory:

```bash
npm run start convert ./my-vault ./astro-content
```

## Available Options

- `--preserve-structure`: Preserve original directory structure
- `--frontmatter`: Add Astro frontmatter to converted files  
- `--dry-run`: Preview changes without modifying files

## Example Output

### Before (Obsidian):
```markdown
# My Note

Check out [[Other Note]] for more info.

See the [[Advanced Guide#Configuration]] section.

Also read [[Project Ideas|Ideas]] for inspiration.

![[Quick Reference]] 
```

### After (Astro):
```markdown
# My Note

Check out [Other Note](/other-note) for more info.

See the [Advanced Guide](/advanced-guide#configuration) section.

Also read [Ideas](/project-ideas) for inspiration.

> [See: Quick Reference](/quick-reference)
```

## Installation

1. Clone the repository
2. Run `npm install`
3. Run `npm run build`
4. Use `npm run start convert <input> <output>`

The tool successfully converts:
- Basic wikilinks: `[[Note]]` → `[Note](/note)`
- Aliases: `[[Note|Alias]]` → `[Alias](/note)`
- Heading links: `[[Note#Section]]` → `[Note](/note#section)`
- Embeds: `![[Note]]` → `> [See: Note](/note)`