import { MarkdownView, Notice, Plugin, TFile } from "obsidian";
import { LatexRefsSettings, DEFAULT_SETTINGS, LatexRefsSettingTab } from "./settings";
import { BibParser } from "./bib/parser";
import { CitationSuggest } from "./citation/suggest";
import { registerBibliographyProcessor, renderBibliography } from "./bibliography/renderer";
import { registerInlineCitationProcessor } from "./citation/inline-renderer";

export default class LatexRefsPlugin extends Plugin {
	settings: LatexRefsSettings = DEFAULT_SETTINGS;
	bibParser: BibParser = new BibParser();

	async onload() {
		await this.loadSettings();

		// Register the settings tab
		this.addSettingTab(new LatexRefsSettingTab(this.app, this));

		// Load the bib file once vault index is ready
		this.app.workspace.onLayoutReady(() => {
			if (this.settings.bibFilePath) {
				this.refreshBibDatabase();
			}
		});

		// Watch for changes to the .bib file
		this.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (file instanceof TFile && file.path === this.settings.bibFilePath) {
					this.refreshBibDatabase();
				}
			})
		);

		// Register citation autocomplete
		this.registerEditorSuggest(new CitationSuggest(this));

		// Register bibliography code block processor
		registerBibliographyProcessor(this);

		// Register inline citation renderer ([@key] -> [n] in reading view)
		registerInlineCitationProcessor(this);

		// Re-render bibliography when switching to reading view
		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				this.rerenderBibliographies();
			})
		);

		// Command: refresh bibliography database
		this.addCommand({
			id: "refresh-bib-database",
			name: "Refresh bibliography database",
			callback: () => this.refreshBibDatabase(),
		});
	}

	async refreshBibDatabase(): Promise<void> {
		if (!this.settings.bibFilePath) {
			new Notice("LaTeX Refs: No BibTeX file path configured.");
			return;
		}

		try {
			const entries = await this.bibParser.loadFromVault(this.app.vault, this.settings.bibFilePath);
			new Notice(`LaTeX Refs: Loaded ${entries.length} entries from ${this.settings.bibFilePath}`);
			this.rerenderBibliographies();
		} catch (err) {
			new Notice(`LaTeX Refs: Error loading BibTeX file — ${err}`);
			console.error("LaTeX Refs: BibTeX load error", err);
		}
	}

	rerenderBibliographies(): void {
		this.app.workspace.iterateAllLeaves((leaf) => {
			const view = leaf.view;
			if (!(view instanceof MarkdownView)) return;

			const previewEl = view.previewMode?.containerEl;
			if (!previewEl) return;

			const bibContainers = previewEl.querySelectorAll(".bib-refs-bibliography");
			if (bibContainers.length === 0) return;

			const file = view.file;
			if (!file) return;

			bibContainers.forEach((container) => {
				const parent = container.parentElement;
				if (!parent) return;
				parent.empty();
				renderBibliography(this, "", parent, {
					sourcePath: file.path,
					getSectionInfo: () => null,
					addChild: () => {},
					docId: "",
					el: parent,
					frontmatter: null,
					remainingNestLevel: 0,
				} as any);
			});
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
