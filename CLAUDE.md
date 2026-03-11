# obsidian-latex-refs

Obsidian plugin for LaTeX-style reference management.

## Build

```bash
npm run dev    # esbuild watch mode
npm run build  # typecheck + production build
```

## Architecture

- `src/main.ts` — Plugin entry point, lifecycle, registers all features
- `src/settings.ts` — Settings interface (bibFilePath, citationStyle) and settings tab
- `src/bib/parser.ts` — Loads and parses .bib files via Citation.js, caches entries
- `src/bib/types.ts` — BibEntry interface
- `src/citation/suggest.ts` — EditorSuggest for `[@key]` autocomplete
- `src/citation/scanner.ts` — Regex scanner to find all `[@key]` references in a note
- `src/bibliography/renderer.ts` — Code block processor for ```bibliography blocks
- `src/types.d.ts` — Type declarations for Citation.js (no shipped types)

## Key design decisions

- Citation syntax: `[@key]` (Pandoc-style, not LaTeX `\cite{}`)
- Uses Citation.js (`@citation-js/core` + plugins) for both BibTeX parsing and CSL-formatted output
- Bibliography rendered via `registerMarkdownCodeBlockProcessor("bibliography", ...)`
- Autocomplete via Obsidian's `EditorSuggest` API, triggered by `[@`

## Testing

Symlink into an Obsidian test vault:
```bash
ln -s /Users/loren/obsidian-plugins/obsidian-latex-refs ~/YOUR-VAULT/.obsidian/plugins/obsidian-latex-refs
```
Then enable the plugin in Obsidian settings, place a .bib file in the vault, and configure the path in plugin settings.
