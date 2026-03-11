export interface BibEntry {
	key: string;
	type: string;
	title: string;
	author: string;
	year: string;
	raw: Record<string, unknown>; // Full CSL-JSON object from Citation.js
}
