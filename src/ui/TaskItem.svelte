<script lang="ts">
  import { StatusType, type Task } from "src/typings";
  import WarningCircle from 'src/assets/WarningCircle.svelte';
  import Circle from 'src/assets/Circle.svelte';
  import HalfCircle from 'src/assets/HalfCircle.svelte';
  import Complete from 'src/assets/Complete.svelte';
  import Cancel from 'src/assets/Cancel.svelte';
  import Calendar from 'src/assets/Calendar.svelte';
  import File from 'src/assets/File.svelte';
	import { PRIORITY_SYMBOLS } from "src/constants";
	import { toggleTask, editTask, openTaskFile } from "src/commands";
	import { obsidianApp } from 'src/store';

  export let task: Task;

  type TaskType = 'overdue' | 'cancelled' | 'done' | 'in_progress' | 'todo';

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

    if (task.due.category.name === 'Overdue') {
      return 'overdue';
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
      case 'overdue':
        return WarningCircle;
      default:
        return Circle;
    }
  }

  $: taskType = getTaskType(task);
  $: taskIcon = getTaskIcon(taskType);
  $: priority = PRIORITY_SYMBOLS[task.priority] || '';

</script>

<div class="task {taskType}">
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

.overdue .timeline :global(svg) :global(line) {
  stroke: #ff375f;
  stroke-width: 2.5px;
}

.overdue .relative {
  color: #ff375f;
}

.cancelled .content, .done .content {
  text-decoration: line-through;
}

.cancelled .icon {
  color: var(--checkbox-border-color);
}
.cancelled .content {
  color: var(--checkbox-border-color);
}

.done .timeline .icon {
  color: var(--interactive-accent);
}

.in_progress .timeline .icon {
  stroke: var(--interactive-accent);
}
</style>

