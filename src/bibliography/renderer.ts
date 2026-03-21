import { MarkdownPostProcessorContext, TFile, sanitizeHTMLToDom } from "obsidian";
import type LatexRefsPlugin from "../main";
import { scanCitations } from "../citation/scanner";

import { Cite } from "@citation-js/core";
import "@citation-js/plugin-csl";

export function registerBibliographyProcessor(plugin: LatexRefsPlugin): void {
	plugin.registerMarkdownCodeBlockProcessor("bibliography", async (source, el, ctx) => {
		await renderBibliography(plugin, source, el, ctx);
	});
}

export async function renderBibliography(
	plugin: LatexRefsPlugin,
	source: string,
	el: HTMLElement,
	ctx: MarkdownPostProcessorContext
): Promise<void> {
	// Read the full note content to scan for citations
	const file = plugin.app.vault.getAbstractFileByPath(ctx.sourcePath);
	if (!(file instanceof TFile)) {
		el.createEl("p", { text: "Error: could not read note content." });
		return;
	}

	const content = await plugin.app.vault.read(file);
	const citationKeys = scanCitations(content);

	if (citationKeys.length === 0) {
		el.createEl("p", { text: "No citations found in this note.", cls: "bib-refs-bibliography" });
		return;
	}

	// Parse style override from code block content, or use settings default
	const styleOverride = source.trim();
	const style = styleOverride || plugin.settings.citationStyle;

	const container = el.createDiv({ cls: "bib-refs-bibliography" });

	try {
		let hasAny = false;
		for (let i = 0; i < citationKeys.length; i++) {
			const entry = plugin.bibParser.getEntry(citationKeys[i]);
			if (!entry) continue;
			hasAny = true;

			const cite = new Cite([entry.raw]);
			const html = cite.format("bibliography", {
				format: "html",
				template: style,
				lang: "en-US",
			}) as string;

			const row = container.createDiv({ cls: "bib-refs-bib-entry" });
			row.id = `bib-refs-bib-${citationKeys[i]}`;
			const numSpan = row.createSpan({ cls: "bib-refs-bib-number", text: `[${i + 1}]` });
			const contentSpan = row.createSpan({ cls: "bib-refs-bib-content" });
			contentSpan.appendChild(sanitizeHTMLToDom(html));
		}

		if (!hasAny) {
			const missing = citationKeys.join(", ");
			container.createEl("p", { text: `No matching entries found for: ${missing}` });
		}
	} catch (err) {
		el.createEl("p", { text: `Error rendering bibliography: ${err}` });
	}
}
