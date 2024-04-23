<script lang="ts">
  import { settings, tasksList } from 'src/store';
  import moment from "moment";
  import { compareByDate } from "src/utils";
  import type { Task } from "src/typings";
	import DayView from './DayView.svelte';
	import type { TasksTimelineView } from 'src/view';

  function getTaskGroupByDate(list: Task[], dateFormat: string) {
		const groupByDate = list.reduce<Record<string, Task[]>>(
			(group, task) => {
				const endOfDay = moment().endOf("day");

				let date: string;
				if (compareByDate(task.happens.moment, endOfDay) <= 0) {
					date = endOfDay.format("YYYY-MM-DD");
				} else {
					date = task.happens.formatAsDate("unplanned");
				}

				if (!group[date]) {
					group[date] = [];
				}
				group[date].push(task);
				return group;
			},
			{},
		);

		const allDates = Object.keys(groupByDate).filter(
			(d) => d !== "unplanned",
		);
		allDates.sort();
		const orderedTaskGroup = allDates.map((date) => ({
			dateString: moment(date, "YYYY-MM-DD").format(dateFormat),
			tasks: groupByDate[date],
		}));

		if (groupByDate["unplanned"]) {
		  orderedTaskGroup.push({
			  dateString: "Unplanned",
			  tasks: groupByDate["unplanned"],
		  });
		}

		return orderedTaskGroup;
  }
  $: ({ dateFormat } = $settings)
  $: tasksGroup = getTaskGroupByDate($tasksList, dateFormat)

  export let plugin: TasksTimelineView;
</script>

<div>
  <div class="header"><button on:click={() => plugin.refreshTasks()}>↻</button></div>
  {#each tasksGroup as {tasks, dateString}, i}
    <DayView tasks={tasks} title={dateString} today={i===0} />
  {/each}
</div>

<style>
.header {
  display: flex;
  flex-direction: row-reverse;
  position: relative;
}

.header button {
  font-size: var(--font-ui-medium);
  position: absolute;
}
</style>
