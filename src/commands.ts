import type { App, TFile } from "obsidian";
import { MarkdownView, Notice } from "obsidian";
import type { Moment } from "moment";
import type { Task } from "./typings";

export async function openTaskFile(app: App, task: Task) {
	const line = task.lineNumber;
	await app.workspace.openLinkText("", task.file.path);
	const view = app.workspace.getActiveViewOfType(MarkdownView);
	if (!view) {
		new Notice("No active workspace detected");
		return;
	}

	const state = view.getState();
	state.mode = "source"; // force source mode
	await view.setState(state, { history: true });

	const { editor } = view;
	editor.setCursor({ line, ch: 6 });
	return editor;
}

export async function editTask(app: App, task: Task) {
	const editor = await openTaskFile(app, task);
	if (!editor) {
		return;
	}
	(app as any).commands.executeCommandById("obsidian-tasks-plugin:edit-task");
}

type TaskInstance = Task & {
	toggle?: () => TaskInstance[];
	toggleWithRecurrenceInUsersOrder?: () => TaskInstance[];
	toFileLineString?: () => string;
};

export async function toggleTask(app: App, task: Task) {
	const file = app.vault.getAbstractFileByPath(task.file.path) as
		| TFile
		| null;
	const t = task as TaskInstance;
	const toggleFn = t.toggleWithRecurrenceInUsersOrder ?? t.toggle;

	if (!file || typeof toggleFn !== "function" || !t.toFileLineString) {
		new Notice(
			"Tasks Timeline: cannot toggle — Tasks plugin internals changed",
		);
		console.error(
			"[tasks-timeline] task instance methods unavailable",
			task,
		);
		return;
	}

	const newLines = toggleFn
		.call(t)
		.map((nt) => nt.toFileLineString?.())
		.filter((line): line is string => typeof line === "string");
	if (newLines.length === 0) return;

	await app.vault.process(file, (data) => {
		const lines = data.split("\n");
		if (task.lineNumber >= lines.length) return data;
		lines.splice(task.lineNumber, 1, ...newLines);
		return lines.join("\n");
	});
}

const EMOJI_DUE_RE = /📅\s*\d{4}-\d{2}-\d{2}/;
const FIELD_DUE_RE = /\[due::\s*\d{4}-\d{2}-\d{2}\s*\]/;

function setDueDateInLine(line: string, isoDate: string): string {
	if (EMOJI_DUE_RE.test(line)) {
		return line.replace(EMOJI_DUE_RE, `📅 ${isoDate}`);
	}
	if (FIELD_DUE_RE.test(line)) {
		return line.replace(FIELD_DUE_RE, `[due:: ${isoDate}]`);
	}
	return `${line.replace(/\s+$/, "")} 📅 ${isoDate}`;
}

export async function postponeTask(app: App, task: Task, newDate: Moment) {
	const file = app.vault.getAbstractFileByPath(task.file.path) as
		| TFile
		| null;
	if (!file) return;
	const isoDate = newDate.format("YYYY-MM-DD");
	await app.vault.process(file, (data) => {
		const lines = data.split("\n");
		if (task.lineNumber >= lines.length) return data;
		lines[task.lineNumber] = setDueDateInLine(
			lines[task.lineNumber],
			isoDate,
		);
		return lines.join("\n");
	});
}
