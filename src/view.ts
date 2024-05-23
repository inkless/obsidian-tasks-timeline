import { ItemView, Notice, WorkspaceLeaf, type EventRef } from "obsidian";
import moment from "moment";

import TasksTimelineComponent from "./ui/TasksTimeline.svelte";
import { tasksList } from "./store";
import { StatusType, type TasksPlugin } from "./typings";
import { DEFAULT_SETTINGS, type TaskTimelinePluginSettings } from "./settings";
import { compareByDate } from "./utils";

export const TIMELINE_VIEW = "tasks-timeline-view";

export class TasksTimelineView extends ItemView {
	component!: TasksTimelineComponent;
	tasksPlugin: TasksPlugin;
	handleRef?: EventRef;
	reloadTimeout?: NodeJS.Timeout;
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
			this.refreshTasks.bind(this),
		);

		this.component = new TasksTimelineComponent({
			target: this.contentEl,
			props: {
				plugin: this,
			},
		});

		this.reloadAtMidnight();
	}

	async onClose() {
		this.component.$destroy();
		if (this.handleRef) {
			this.tasksPlugin.cache.events.off(this.handleRef);
		}

		if (this.reloadTimeout) {
			clearTimeout(this.reloadTimeout);
		}
	}

	onUpdateSettings(settings: TaskTimelinePluginSettings) {
		this.settings = settings;

		tasksList.set(this.getTasks());
	}

	refreshTasks() {
		console.log("Refresh tasks");
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
				(compareByDate(t.cancelledDate, today) === -1 ||
					!t.cancelledDate)
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

	private reloadAtMidnight() {
		const midnight = moment().endOf("day");
		const diff = midnight.diff(moment()) + 2000; // add some buffers

		this.reloadTimeout = setTimeout(() => {
			this.refreshTasks();
			this.reloadAtMidnight();
		}, diff);
	}
}
