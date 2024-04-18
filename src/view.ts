import { ItemView, Notice, WorkspaceLeaf, type EventRef } from "obsidian";

import TasksTimelineComponent from "./ui/TasksTimeline.svelte";
import { tasksList } from "./store";
import type { Task, TasksPlugin } from "./typings";
import { DEFAULT_SETTINGS, type TaskTimelinePluginSettings } from "./settings";
import { compareByDate } from "./utils";

export const TIMELINE_VIEW = "tasks-timeline-view";

export class TasksTimelineView extends ItemView {
	component!: TasksTimelineComponent;
	tasksPlugin: TasksPlugin;
	handleRef?: EventRef;
	settings = DEFAULT_SETTINGS;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);

		console.log("constructor");

		this.tasksPlugin = (this.app as any).plugins.plugins[
			"obsidian-tasks-plugin"
		];
	}

	getViewType() {
		return TIMELINE_VIEW;
	}

	getDisplayText() {
		return "Tasks Timeline";
	}

	getIcon(): string {
		return "calendar-clock";
	}

	async onOpen() {
		console.log("open tasks-timeline-view");

		if (!this.tasksPlugin) {
			new Notice("Please install Obsidian Tasks Plugin");
			return;
		}

		tasksList.set(this.getTasks());

		this.handleRef = this.tasksPlugin.cache.events.onCacheUpdate(
			this.handleCacheUpdate.bind(this),
		);

		this.component = new TasksTimelineComponent({
			target: this.contentEl,
			props: {
				variable: 1,
			},
		});
	}

	async onClose() {
		this.component.$destroy();
		console.log("close");
		if (this.handleRef) {
			this.tasksPlugin.cache.events.off(this.handleRef);
		}
	}

	onUpdateSettings(settings: TaskTimelinePluginSettings) {
		this.settings = settings;

		tasksList.set(this.getTasks());
	}

	private getTasks() {
		const tasks = [...this.tasksPlugin.getTasks()];
		console.log("view tasks", tasks[0].description);
		tasks.sort((a, b) => compareByDate(a.happens.moment, b.happens.moment));
		tasks.sort((a, b) => Number(a.priority) - Number(b.priority));
		tasks.sort((a, b) => (a.status.type > b.status.type ? -1 : 1));
		return tasks;
	}

	private handleCacheUpdate() {
		tasksList.set(this.getTasks());
	}
}
