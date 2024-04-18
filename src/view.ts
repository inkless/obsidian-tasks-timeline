import { ItemView, Notice, WorkspaceLeaf, type EventRef } from "obsidian";
import moment from "moment";

import TasksTimelineComponent from "./ui/TasksTimeline.svelte";
import { tasksList } from "./store";
import { StatusType, type Task, type TasksPlugin } from "./typings";
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
		if (this.handleRef) {
			this.tasksPlugin.cache.events.off(this.handleRef);
		}
	}

	onUpdateSettings(settings: TaskTimelinePluginSettings) {
		this.settings = settings;

		tasksList.set(this.getTasks());
	}

	private getTasks() {
		const today = moment().startOf("day");
		const tasks = this.tasksPlugin.getTasks().filter((t) => {
			if (
				t.status.type === StatusType.EMPTY ||
				t.status.type === StatusType.NON_TASK
			) {
				return false;
			}
			if (
				t.status.type === StatusType.DONE &&
				compareByDate(t.doneDate, today) === -1
			) {
				return false;
			}
			if (
				t.status.type === StatusType.CANCELLED &&
				compareByDate(t.cancelledDate, today) === -1
			) {
				return false;
			}
			return true;
		});
		tasks.sort((a, b) => compareByDate(a.happens.moment, b.happens.moment));
		tasks.sort((a, b) => Number(a.priority) - Number(b.priority));
		tasks.sort((a, b) => (a.status.type > b.status.type ? -1 : 1));
		return tasks;
	}

	private handleCacheUpdate() {
		tasksList.set(this.getTasks());
	}
}
