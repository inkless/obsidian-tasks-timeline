import { App, PluginSettingTab, Setting } from "obsidian";
import type TaskTimelinePlugin from "./main";

export interface TaskTimelinePluginSettings {
	dateFormat: string;
	dailyNotesFolder: string;
	dailyNotesFormat: string;
}

export const DEFAULT_SETTINGS: TaskTimelinePluginSettings = {
	dateFormat: "ddd, MMM D",
	dailyNotesFolder: "",
	dailyNotesFormat: "",
};

export class TaskTimelineSettingTab extends PluginSettingTab {
	plugin: TaskTimelinePlugin;

	constructor(app: App, plugin: TaskTimelinePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private static createFragmentWithHTML = (html: string) =>
		createFragment(
			(documentFragment) =>
				(documentFragment.createDiv().innerHTML = html),
		);

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h3", { text: "Tasks Timeline Settings" });

		new Setting(containerEl)
			.setName("Date Format")
			.setDesc(
				"The date format used in the timeline. Default is dddd, MMM d",
			)
			.addText((text) =>
				text
					.setPlaceholder("ddd, MMM D")
					.setValue(this.plugin.settings.dateFormat)
					.onChange(async (value) => {
						this.plugin.settings.dateFormat = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Daily notes folder")
			.setDesc("Folder for daily notes")
			.addText((text) =>
				text
					.setPlaceholder("Example: journal/daily")
					.setValue(this.plugin.settings.dailyNotesFolder)
					.onChange(async (value) => {
						this.plugin.settings.dailyNotesFolder = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Daily notes date format")
			.setDesc(
				TaskTimelineSettingTab.createFragmentWithHTML(
					[
						"<p>The format that daily notes used to create a note</p>",
						'<p>For more syntax, refer to <a href="https://momentjs.com/docs/#/displaying/format/">format reference</a>.</p>',
					].join(""),
				),
			)
			.addMomentFormat((component) =>
				component
					.setPlaceholder("YYYY-MM-DD")
					.setValue(this.plugin.settings.dailyNotesFormat)
					.onChange(async (value) => {
						this.plugin.settings.dailyNotesFormat = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
