import type { App } from "obsidian";
import { MarkdownView, Notice } from "obsidian";
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

export async function toggleTask(app: App, task: Task) {
	const editor = await openTaskFile(app, task);
	if (!editor) {
		return;
	}
	(app as any).commands.executeCommandById(
		"obsidian-tasks-plugin:toggle-done",
	);
}
