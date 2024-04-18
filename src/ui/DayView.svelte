<script lang="ts">
  import { StatusType, type Task } from "src/typings";
	import TodayCards from "./TodayCards.svelte";
	import TaskItem from "./TaskItem.svelte";

  export let tasks: Task[];
  export let title: string;
  export let today: boolean;

  let filter: string;

  function getFilteredTasks(filter: string, tasks: Task[]) {
    switch(filter) {
      case 'overdue':
        return tasks.filter(task => task.due.category.name === 'Overdue')
      case 'todo':
        return tasks.filter(task => task.status.type === StatusType.TODO);
      case 'unplanned':
        return tasks.filter(task => !task.dueDate)
      default:
        return tasks;
    }
  }

  $: filteredTasks = getFilteredTasks(filter, tasks);
  $: overdueCount = getFilteredTasks('overdue', tasks).length;
  $: todoCount = getFilteredTasks('todo', tasks).length;
  $: unplannedCount = getFilteredTasks('unplanned', tasks).length;
</script>

<h3>{title}</h3>

{#if today}
  <TodayCards bind:filter={filter} {overdueCount} {todoCount} {unplannedCount} />
{/if}

<div>
{#each filteredTasks as task}
  <TaskItem {task} />
{/each}
</div>

<style>
</style>
