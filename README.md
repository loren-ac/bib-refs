# Bib Refs

BibTeX-powered reference management for [Obsidian](https://obsidian.md). Cite references with `[@key]` syntax, get autocomplete suggestions, and render numbered bibliographies in reading view.

## Features

- **BibTeX support** — Load a `.bib` file and reference entries by citation key
- **Autocomplete** — Type `[@` to get suggestions filtered by key, author, or title
- **Numbered citations** — `[@smith2023]` renders as `[1]` in reading view, numbered by order of appearance
- **Clickable citations** — Click a citation number to scroll to the bibliography entry
- **Hover preview** — Hover over a citation to see the formatted reference
- **Bibliography block** — Add a ` ```bibliography ``` ` code block to render a formatted, numbered reference list
- **Auto-refresh** — Bibliography updates when you switch between edit and reading view
- **Multiple styles** — APA and Vancouver citation styles supported

## Usage

### 1. Add a `.bib` file to your vault

Place a BibTeX file (e.g. `references.bib`) anywhere in your vault.

### 2. Configure the plugin

Go to **Settings > Bib Refs** and set the path to your `.bib` file.

### 3. Cite references

In any note, use `[@key]` to cite a reference:

```
The method was first described by [@smith2023] and later extended by [@jones2021].
```

### 4. Add a bibliography

Add a fenced code block with the language `bibliography` where you want the reference list:

````
## References

```bibliography
```
````

In reading view, citations render as `[1]`, `[2]`, etc., and the bibliography block shows a numbered list of references matching the citations in your note.

## Installation

### From Obsidian

1. Open **Settings > Community plugins**
2. Search for "Bib Refs"
3. Click **Install**, then **Enable**

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/loren-ac/bib-refs/releases)
2. Create a folder `bib-refs` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into it
4. Enable the plugin in Obsidian settings
