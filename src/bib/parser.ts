import { Vault, TFile } from "obsidian";
import { BibEntry } from "./types";

// Import Citation.js core and plugins
import { Cite } from "@citation-js/core";
import "@citation-js/plugin-bibtex";

export class BibParser {
	private entries: BibEntry[] = [];
	private entriesByKey: Map<string, BibEntry> = new Map();

	get allEntries(): BibEntry[] {
		return this.entries;
	}

	getEntry(key: string): BibEntry | undefined {
		return this.entriesByKey.get(key);
	}

	async loadFromVault(vault: Vault, bibPath: string): Promise<BibEntry[]> {
		const file = vault.getAbstractFileByPath(bibPath);
		if (!(file instanceof TFile)) {
			throw new Error(`BibTeX file not found: ${bibPath}`);
		}

		const content = await vault.cachedRead(file);
		return this.parse(content);
	}

	parse(bibContent: string): BibEntry[] {
		const cite = new Cite(bibContent);
		const cslData = cite.data as Record<string, unknown>[];

		this.entries = cslData.map((item): BibEntry => {
			const authors = item.author as Array<{ family?: string; given?: string }> | undefined;
			const authorStr = authors
				? authors.map(a => [a.family, a.given].filter(Boolean).join(", ")).join("; ")
				: "";

			const issued = item.issued as { "date-parts"?: number[][] } | undefined;
			const year = issued?.["date-parts"]?.[0]?.[0]?.toString() ?? "";

			return {
				key: (item["citation-key"] as string) ?? (item.id as string) ?? "",
				type: (item.type as string) ?? "",
				title: (item.title as string) ?? "",
				author: authorStr,
				year,
				raw: item,
			};
		});

		this.entriesByKey = new Map(this.entries.map(e => [e.key, e]));
		return this.entries;
	}
}
