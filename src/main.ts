import { type App, Plugin, type PluginManifest, debounce } from "obsidian";
import { TIMELINE_VIEW, TasksTimelineView } from "./view";
import { obsidianApp, settings as settingsStore } from "./store";
import { DEFAULT_SETTINGS, TaskTimelineSettingTab } from "./settings";

export default class TaskTimelinePlugin extends Plugin {
	settings = { ...DEFAULT_SETTINGS };
	debouncedUpdateViewSettings: () => void;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);

		this.debouncedUpdateViewSettings = debounce(
			this.updateViewSettings.bind(this),
			2000,
		);
	}

	async onload() {
		await this.loadSettings();

		obsidianApp.set(this.app);
		this.registerView(TIMELINE_VIEW, (leaf) => {
			const view = new TasksTimelineView(leaf);
			view.onUpdateSettings(this.settings);
			settingsStore.set(this.settings);
			return view;
		});

		this.addRibbonIcon(
			"calendar-clock",
			"Tasks Timeline",
			(_evt: MouseEvent) => {
				this.activateView();
			},
		);

		this.addCommand({
			id: "open-tasks-timeline-view",
			name: "Open Tasks Timeline View",
			callback: () => {
				this.activateView();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TaskTimelineSettingTab(this.app, this));
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(TIMELINE_VIEW);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);

		this.debouncedUpdateViewSettings();
	}

	async activateView() {
		const timelineLeaf = this.app.workspace
			.getLeavesOfType(TIMELINE_VIEW)
			.first();
		if (timelineLeaf) {
			this.app.workspace.revealLeaf(timelineLeaf);
			return;
		}

		const rightLeaf = this.app.workspace.getRightLeaf(false);
		if (rightLeaf) {
			await rightLeaf.setViewState({
				type: TIMELINE_VIEW,
				active: true,
			});
			this.app.workspace.revealLeaf(rightLeaf);
		}
	}

	private updateViewSettings() {
		const leaf = this.app.workspace.getLeavesOfType(TIMELINE_VIEW).first();
		if (leaf) {
			(leaf.view as TasksTimelineView).onUpdateSettings(this.settings);
			settingsStore.set(this.settings);
		}
	}
}
