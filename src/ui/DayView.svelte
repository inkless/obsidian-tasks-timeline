<script lang="ts">
  import { Priority, StatusType, type Task } from "src/typings";
	import TodayCards from "./TodayCards.svelte";
	import TaskItem from "./TaskItem.svelte";

  export let tasks: Task[];
  export let title: string;
  export let today: boolean;
  export let filter = '';

  const isHighPriority = (task: Task) =>
    task.priority === Priority.Highest || task.priority === Priority.High;
  const isActive = (task: Task) =>
    task.status.type === StatusType.TODO ||
    task.status.type === StatusType.IN_PROGRESS;

  function getFilteredTasks(filter: string, tasks: Task[]) {
    if (!tasks) { return []; }
    switch(filter) {
      case 'overdue':
        return tasks.filter(task => task.due.category.name === 'Overdue')
      case 'active':
        return tasks.filter(isActive);
      case 'high-priority':
        return tasks.filter(isHighPriority);
      default:
        return tasks;
    }
  }

  $: filteredTasks = getFilteredTasks(filter, tasks);
  $: overdueCount = getFilteredTasks('overdue', tasks).length;
  $: activeCount = getFilteredTasks('active', tasks).length;
  $: highPriorityCount = getFilteredTasks('high-priority', tasks).length;
</script>

<h3>{title}</h3>

{#if today}
  <TodayCards bind:filter={filter} {overdueCount} {activeCount} {highPriorityCount} />
{/if}

<div>
{#each filteredTasks as task (`${task.file.path}:${task.lineNumber}`)}
  <TaskItem {task} />
{/each}
</div>

<style>
</style>
