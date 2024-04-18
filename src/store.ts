import type { App } from "obsidian";
import type { TaskTimelinePluginSettings } from "./settings";
import type { Task } from "./typings";

import { writable } from "svelte/store";
import { DEFAULT_SETTINGS } from "./settings";

export const tasksList = writable<Task[]>([]);
export const obsidianApp = writable<App>();
export const settings = writable<TaskTimelinePluginSettings>({
	...DEFAULT_SETTINGS,
});
