# bib-refs

Obsidian plugin for BibTeX-powered reference management.

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
- `src/citation/inline-renderer.ts` — Post-processor: replaces `[@key]` with clickable `[n]` in reading view
- `src/bibliography/renderer.ts` — Code block processor for ```bibliography blocks
- `src/sync-fetch-shim.js` — No-op shim replacing sync-fetch (incompatible with Obsidian)
- `src/types.d.ts` — Type declarations for Citation.js (no shipped types)

## Key design decisions

- Citation syntax: `[@key]` (Pandoc-style, not LaTeX `\cite{}`)
- Uses Citation.js (`@citation-js/core` + plugins) for both BibTeX parsing and CSL-formatted output
- Bibliography rendered via `registerMarkdownCodeBlockProcessor("bibliography", ...)`
- Autocomplete via Obsidian's `EditorSuggest` API, triggered by `[@`
- Inline citations are numbered `[1]`, `[2]` in order of appearance, clickable with hover tooltips
- sync-fetch shimmed out in esbuild.config.mjs (Citation.js dependency that uses XMLHttpRequest)
- `layout-change` event listener forces bibliography re-render on view switch

## Releasing

```bash
npm version patch  # bumps version in package.json, triggers version-bump.mjs
git push && git push --tags  # GitHub Actions builds and creates release
```
