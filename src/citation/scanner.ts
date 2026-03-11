const CITATION_REGEX = /\[@([^\]]+)\]/g;

export function scanCitations(content: string): string[] {
	const keys: string[] = [];
	const seen = new Set<string>();
	let match;

	while ((match = CITATION_REGEX.exec(content)) !== null) {
		const key = match[1].trim();
		if (!seen.has(key)) {
			seen.add(key);
			keys.push(key);
		}
	}

	return keys;
}
