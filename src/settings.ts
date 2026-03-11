import { App, PluginSettingTab, Setting } from "obsidian";
import type LatexRefsPlugin from "./main";

export interface LatexRefsSettings {
	bibFilePath: string;
	citationStyle: string;
}

export const DEFAULT_SETTINGS: LatexRefsSettings = {
	bibFilePath: "",
	citationStyle: "apa",
};

export class LatexRefsSettingTab extends PluginSettingTab {
	plugin: LatexRefsPlugin;

	constructor(app: App, plugin: LatexRefsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("BibTeX file path")
			.setDesc("Path to your .bib file relative to the vault root (e.g. references.bib)")
			.addText(text =>
				text
					.setPlaceholder("references.bib")
					.setValue(this.plugin.settings.bibFilePath)
					.onChange(async (value) => {
						this.plugin.settings.bibFilePath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Citation style")
			.setDesc("Format for rendered bibliographies")
			.addDropdown(dropdown =>
				dropdown
					.addOption("apa", "APA")
					.addOption("vancouver-author-date", "Vancouver")
					.setValue(this.plugin.settings.citationStyle)
					.onChange(async (value) => {
						this.plugin.settings.citationStyle = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
