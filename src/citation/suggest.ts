import {
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from "obsidian";
import type LatexRefsPlugin from "../main";
import { BibEntry } from "../bib/types";

export class CitationSuggest extends EditorSuggest<BibEntry> {
	plugin: LatexRefsPlugin;

	constructor(plugin: LatexRefsPlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	onTrigger(cursor: EditorPosition, editor: Editor, _file: TFile | null): EditorSuggestTriggerInfo | null {
		const line = editor.getLine(cursor.line);
		const textBefore = line.substring(0, cursor.ch);

		// Match `[@` followed by partial key text
		const match = textBefore.match(/\[@([^\]]*)$/);
		if (!match) return null;

		return {
			start: { line: cursor.line, ch: match.index! },
			end: cursor,
			query: match[1],
		};
	}

	getSuggestions(context: EditorSuggestContext): BibEntry[] {
		const query = context.query.toLowerCase();
		const entries = this.plugin.bibParser.allEntries;

		if (!query) return entries.slice(0, 20);

		return entries
			.filter(e =>
				e.key.toLowerCase().includes(query) ||
				e.title.toLowerCase().includes(query) ||
				e.author.toLowerCase().includes(query)
			)
			.slice(0, 20);
	}

	renderSuggestion(entry: BibEntry, el: HTMLElement): void {
		const container = el.createDiv({ cls: "latex-refs-suggestion" });
		container.createDiv({ cls: "latex-refs-suggestion-key", text: entry.key });
		const detail = [entry.author, entry.year, entry.title].filter(Boolean).join(" — ");
		if (detail) {
			container.createDiv({ cls: "latex-refs-suggestion-detail", text: detail });
		}
	}

	selectSuggestion(entry: BibEntry, _evt: MouseEvent | KeyboardEvent): void {
		if (!this.context) return;

		const { editor, start, end } = this.context;
		editor.replaceRange(`[@${entry.key}]`, start, end);
	}
}
