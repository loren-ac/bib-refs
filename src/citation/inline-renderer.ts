import { TFile, sanitizeHTMLToDom } from "obsidian";
import type LatexRefsPlugin from "../main";
import { scanCitations } from "./scanner";

import { Cite } from "@citation-js/core";
import "@citation-js/plugin-csl";

const CITATION_PATTERN = /\[@([^\]]+)\]/g;

let tooltip: HTMLElement | null = null;

function getTooltip(): HTMLElement {
	if (!tooltip) {
		tooltip = document.createElement("div");
		tooltip.className = "bib-refs-tooltip";
		document.body.appendChild(tooltip);
	}
	return tooltip;
}

function hideTooltip(): void {
	if (tooltip) {
		tooltip.style.display = "none";
	}
}

export function registerInlineCitationProcessor(plugin: LatexRefsPlugin): void {
	plugin.registerMarkdownPostProcessor(async (element, ctx) => {
		// Build the citation number map from the full note
		const file = plugin.app.vault.getAbstractFileByPath(ctx.sourcePath);
		if (!(file instanceof TFile)) return;

		const content = await plugin.app.vault.read(file);
		const orderedKeys = scanCitations(content);
		if (orderedKeys.length === 0) return;

		const keyToNumber = new Map<string, number>();
		orderedKeys.forEach((key, i) => keyToNumber.set(key, i + 1));

		// Walk all text nodes and replace [@key] with clickable [n]
		const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
		const nodesToReplace: { node: Text; fragments: (string | HTMLElement)[] }[] = [];

		let textNode: Text | null;
		while ((textNode = walker.nextNode() as Text | null)) {
			const text = textNode.textContent ?? "";
			if (!text.includes("[@")) continue;

			const fragments: (string | HTMLElement)[] = [];
			let lastIndex = 0;
			let match;

			CITATION_PATTERN.lastIndex = 0;
			while ((match = CITATION_PATTERN.exec(text)) !== null) {
				const key = match[1].trim();
				const num = keyToNumber.get(key);
				if (num === undefined) continue;

				// Add text before the match
				if (match.index > lastIndex) {
					fragments.push(text.slice(lastIndex, match.index));
				}

				// Create clickable citation link
				const link = document.createElement("a");
				link.className = "bib-refs-cite";
				link.textContent = `[${num}]`;
				link.setAttribute("data-citation-key", key);
				link.href = `#bib-refs-bib-${key}`;

				// Click: scroll to bibliography entry
				link.addEventListener("click", (e) => {
					e.preventDefault();
					hideTooltip();
					const targetId = `bib-refs-bib-${key}`;
					const previewEl = link.closest(".markdown-preview-view") as HTMLElement | null;
					if (!previewEl) return;

					// Search only within the current preview container to avoid stale duplicates
					const findTarget = () =>
						previewEl.querySelector(`#${CSS.escape(targetId)}`) as HTMLElement | null;

					const scrollToTarget = (t: HTMLElement) => {
						t.scrollIntoView({ behavior: "smooth", block: "center" });
						t.classList.add("bib-refs-bib-highlight");
						setTimeout(() => t.classList.remove("bib-refs-bib-highlight"), 1500);
					};

					// Try direct scroll first (works when bibliography is already in the DOM)
					const target = findTarget();
					if (target) {
						scrollToTarget(target);
						return;
					}

					// Bibliography not in DOM — scroll to bottom repeatedly to force
					// Obsidian's virtualized renderer to materialize it
					let attempts = 0;
					const scrollAndRetry = () => {
						const t = findTarget();
						if (t) {
							scrollToTarget(t);
							return;
						}
						if (attempts++ >= 20) return;
						previewEl.scrollTop = previewEl.scrollHeight;
						setTimeout(scrollAndRetry, 50);
					};
					scrollAndRetry();
				});

				// Hover: show tooltip with formatted reference
				link.addEventListener("mouseenter", (e) => {
					const entry = plugin.bibParser.getEntry(key);
					if (!entry) return;

					const tip = getTooltip();
					try {
						const cite = new Cite([entry.raw]);
						const html = cite.format("bibliography", {
							format: "html",
							template: plugin.settings.citationStyle,
							lang: "en-US",
						}) as string;
						tip.empty();
					tip.appendChild(sanitizeHTMLToDom(html));
					} catch {
						tip.textContent = `${entry.author} (${entry.year}). ${entry.title}`;
					}

					const rect = link.getBoundingClientRect();
					tip.style.display = "block";
					tip.style.left = `${rect.left}px`;
					tip.style.top = `${rect.bottom + 4}px`;
				});

				link.addEventListener("mouseleave", hideTooltip);

				fragments.push(link);
				lastIndex = match.index + match[0].length;
			}

			if (fragments.length > 0) {
				// Add remaining text after last match
				if (lastIndex < text.length) {
					fragments.push(text.slice(lastIndex));
				}
				nodesToReplace.push({ node: textNode, fragments });
			}
		}

		// Apply replacements
		for (const { node, fragments } of nodesToReplace) {
			const parent = node.parentNode;
			if (!parent) continue;

			for (const frag of fragments) {
				if (typeof frag === "string") {
					parent.insertBefore(document.createTextNode(frag), node);
				} else {
					parent.insertBefore(frag, node);
				}
			}
			parent.removeChild(node);
		}
	});
}
