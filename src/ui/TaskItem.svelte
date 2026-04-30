<script lang="ts">
  import { Menu } from 'obsidian';
  import moment, { type Moment } from 'moment';
  import { StatusType, type Task } from "src/typings";
  import WarningCircle from 'src/assets/WarningCircle.svelte';
  import Circle from 'src/assets/Circle.svelte';
  import HalfCircle from 'src/assets/HalfCircle.svelte';
  import Complete from 'src/assets/Complete.svelte';
  import Cancel from 'src/assets/Cancel.svelte';
  import Calendar from 'src/assets/Calendar.svelte';
  import File from 'src/assets/File.svelte';
  import Forward from 'src/assets/Forward.svelte';
	import { PRIORITY_SYMBOLS } from "src/constants";
	import { toggleTask, editTask, openTaskFile, postponeTask } from "src/commands";
	import { obsidianApp } from 'src/store';

  export let task: Task;

  function showPostponeMenu(evt: MouseEvent) {
    evt.preventDefault();
    evt.stopPropagation();

    const today = moment().startOf('day');
    const due = task.dueDate ? moment(task.dueDate).startOf('day') : null;
    const base = due && due.isAfter(today) ? due.clone() : today.clone();
    const fmt = (d: Moment) => d.format('ddd Do MMM');

    const menu = new Menu();

    const tomorrow = today.clone().add(1, 'day');
    menu.addItem((i) => i
      .setTitle(`Due today, on ${fmt(today)}`)
      .onClick(() => postponeTask($obsidianApp, task, today.clone())));
    menu.addItem((i) => i
      .setTitle(`Due tomorrow, on ${fmt(tomorrow)}`)
      .onClick(() => postponeTask($obsidianApp, task, tomorrow)));

    menu.addSeparator();
    for (const n of [2, 3, 4, 5, 6]) {
      const d = base.clone().add(n, 'days');
      menu.addItem((i) => i
        .setTitle(`Postpone due date by ${n} days, to ${fmt(d)}`)
        .onClick(() => postponeTask($obsidianApp, task, d)));
    }

    menu.addSeparator();
    for (const n of [1, 2, 3, 4]) {
      const d = base.clone().add(n, 'weeks');
      const label = n === 1 ? 'a week' : `${n} weeks`;
      menu.addItem((i) => i
        .setTitle(`Postpone due date by ${label}, to ${fmt(d)}`)
        .onClick(() => postponeTask($obsidianApp, task, d)));
    }

    menu.addSeparator();
    const inMonth = base.clone().add(1, 'month');
    menu.addItem((i) => i
      .setTitle(`Postpone due date by a month, to ${fmt(inMonth)}`)
      .onClick(() => postponeTask($obsidianApp, task, inMonth)));

    menu.showAtMouseEvent(evt);
  }

  $: overdue = task.due.category.name === 'Overdue';

  type TaskType = 'cancelled' | 'done' | 'in_progress' | 'todo';

  function getTaskType(task: Task): TaskType {
    if (task.status.type === StatusType.DONE) {
      return 'done';
    }

    if (task.status.type === StatusType.CANCELLED) {
      return 'cancelled';
    }

    if (task.status.type === StatusType.IN_PROGRESS) {
      return 'in_progress';
    }

    return 'todo';
  }

  function getTaskIcon(type: TaskType) {
    switch(type) {
      case 'done':
        return Complete;
      case 'cancelled':
        return Cancel;
      case 'in_progress':
        return HalfCircle;
      default:
        {
          if (overdue) {
            return WarningCircle;
          }
          return Circle;
        }
    }
  }

  $: taskType = getTaskType(task);
  $: taskIcon = getTaskIcon(taskType);
  $: priority = PRIORITY_SYMBOLS[task.priority] || '';

</script>

<div class="task {taskType}" class:overdue>
  <div class="timeline">
    <button class="icon" on:click={() => toggleTask($obsidianApp, task)}>
      <svelte:component this={taskIcon} />
    </button>
    <div class="stripe"></div>
  </div>
  <div class="lines">
    <a
      href={task.file.path}
      class="internal-link"
      target="_blank"
      rel="noopener"
      on:contextmenu={() => editTask($obsidianApp, task)}
      on:click={() => openTaskFile($obsidianApp, task)}
    >
      <div class="content">
        {#if priority}
          {priority}
        {/if}
        {task.description}
      </div>
    </a>
    <div class="info">
      <div class="relative">
        <div class="icon"><Calendar /></div>
        <div class="label">{task.happens.fromNow.name}</div>
      </div>
      <div class="file">
        <div class="icon"><File /></div>
        <div class="label">
          {task.filename}
          {#if task.precedingHeader}
            <span class="header"> &gt; {task.precedingHeader}</span>
          {/if}
        </div>
      </div>
    </div>
  </div>
  <button
    class="postpone"
    aria-label="Postpone"
    on:click={showPostponeMenu}
  >
    <Forward />
  </button>
</div>

<style>
.task {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  border-radius: 10px;
  padding: 0;
  margin: 0;
  cursor: pointer;
}

button.icon {
  padding: 0;
  border: none;
  box-shadow: none;
  background: none;
  cursor: pointer;
}

.timeline, .lines {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  cursor: default;
}

.timeline {
  width: 50px;
  flex-shrink: 0;
  flex-grow: 0;
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  flex-grow: 0;
  text-align: center;
  height: 22px;
}

.icon :global(svg) {
  height: var(--checkbox-size);
  width: var(--checkbox-size);
  stroke-width: 1.75px;
}

.stripe {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 1;
  flex-grow: 1;
  margin: 0 auto;
  width: 1px;
  background: var(--checkbox-border-color);
}

.lines {
  flex-shrink: 1;
  flex-grow: 1;
  overflow: hidden;
}

.internal-link {
  cursor: var(--cursor-link);
  text-decoration: none;
  color: inherit;
}

.content {
  display: block;
  font-size: 15px;
  font-weight: normal;
  color: var(--text-normal);
  line-height: 22px;
}

.info {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    line-height: 22px;
    padding-bottom: 2px;
    cursor: default;
}

.relative {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  width: auto;
  font-size: 9px;
  font-weight: normal;
  margin: 2px 5px 2px 0;
  color: var(--text-muted);
  padding: 0px;
  border: none;
  line-height: 1;
  padding: 0;
  border-radius: 3px;
}

.file {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  width: auto;
  font-size: 9px;
  font-weight: normal;
  margin: 2px 5px 2px 0;
  color: var(--text-muted);
  padding: 0px;
  border: none;
  line-height: 1;
  padding: 0;
  border-radius: 3px;
  color: var(--task-color);
}

.info .icon {
  height: 15px;
}

.label {
  margin-left: 2px;
}

.overdue .relative, .overdue .relative .icon {
  color: #ff375f;
}

.cancelled .content, .done .content {
  text-decoration: line-through;
}

.cancelled .icon, .cancelled .content {
  color: var(--checkbox-border-color);
}

.done .timeline .icon {
  color: var(--interactive-accent);
}

.in_progress .timeline .icon {
  color: var(--interactive-accent);
}

button.postpone {
  align-self: flex-start;
  margin-top: 1px;
  padding: 2px;
  border: none;
  box-shadow: none;
  background: none;
  cursor: pointer;
  color: var(--text-muted);
  flex-shrink: 0;
  height: 22px;
  width: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

button.postpone:hover {
  color: var(--text-normal);
}

button.postpone :global(svg) {
  height: 16px;
  width: 16px;
  stroke-width: 1.75px;
}

.cancelled button.postpone,
.done button.postpone {
  display: none;
}
</style>

