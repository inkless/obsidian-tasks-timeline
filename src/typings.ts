import type { Moment } from "moment";
import type { EventRef } from "obsidian";

export enum StatusType {
	TODO = "TODO",
	DONE = "DONE",
	IN_PROGRESS = "IN_PROGRESS",
	CANCELLED = "CANCELLED",
	NON_TASK = "NON_TASK",
	EMPTY = "EMPTY",
}

export type Status = {
	name: string;
	type: StatusType;
	typeGroupText: string;
};

export enum Priority {
	Highest = "0",
	High = "1",
	Medium = "2",
	None = "3",
	Low = "4",
	Lowest = "5",
}

export type PropertyCategory = {
	readonly name: string;
	readonly sortOrder: number;
	readonly groupText: string;
};

export type TaskDate = {
	moment: Moment | null;
	category: PropertyCategory;
	fromNow: PropertyCategory;
	formatAsDate(fallback?: string): string;
	formatAsDateAndTime(fallback?: string): string;
	toISOString(keepOffset?: boolean): string | null;
};

export type TasksFile = {
	path: string;
	pathWithoutExtension: string;
	root: string;
	folder: string;
	filename: string;
	filenameWithoutExtension: string;
};

export type Task = {
	readonly description: string;
	readonly tags: string[];
	readonly status: Status;

	readonly priority: Priority;

	readonly createdDate: Moment | null;
	readonly startDate: Moment | null;
	readonly scheduledDate: Moment | null;
	readonly dueDate: Moment | null;
	readonly doneDate: Moment | null;
	readonly cancelledDate: Moment | null;

	readonly recurrence: any | null;

	readonly id: string;

	readonly created: TaskDate;
	readonly happens: TaskDate;
	readonly due: TaskDate;
	readonly done: TaskDate;
	readonly scheduled: TaskDate;
	readonly start: TaskDate;

	readonly file: TasksFile;
	readonly filename: string;

	readonly lineNumber: number;
	readonly sectionStart: number;
	readonly sectionIndex: number;

	readonly isRecurring: boolean;
	readonly recurrenceRule: string;

	readonly precedingHeader: string | null;
};

type HandleCacheUpdate = (arg: { tasks: Task[] }) => void;

type TaskEvents = {
	onCacheUpdate(fn: HandleCacheUpdate): EventRef;
	off(ref: EventRef): void;
};

type TasksCache = {
	events: TaskEvents;
};

export type TasksPlugin = {
	getTasks(): Task[];
	cache: TasksCache;
};
