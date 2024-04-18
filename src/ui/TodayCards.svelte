<script lang="ts">
  export let filter: string;
  export let overdueCount: number;
  export let todoCount: number;
  export let unplannedCount: number;

  function clickFilter(f: string) {
    filter = filter === f ? '' : f;
  }
</script>

<div class="today">
  <h2 class="header">Today</h2>
  <div class="cards">
    <button class="card" class:active={filter==='todo'} on:click={() => clickFilter('todo')}>
      <div class="count">{todoCount}</div>
      <div class="label">To Do</div>
    </button>
    <button class="card" class:active={filter==='overdue'} on:click={() => clickFilter('overdue')}>
      <div class="count">{overdueCount}</div>
      <div class="label">Overdue</div>
    </button>
    <button class="card" class:active={filter==='unplanned'} on:click={() => clickFilter('unplanned')}>
      <div class="count">{unplannedCount}</div>
      <div class="label">Unplanned</div>
    </button>
  </div>

</div>

<style>
.header {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin: 10px 5px;
  border-radius: 10px;
  cursor: pointer;
}

.cards {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  margin: 20px 0;
}

.card {
  display: flex;
  height: auto;
  flex-direction: column;
  flex-wrap: nowrap;
  color: var(--text-normal);
  border-radius: 10px;
  padding: 5px;
  text-align: center;
  flex: 1 1 0;
  margin: 0 5px;
  min-width: 70px;
  max-width: 150px;
  overflow: hidden;
  background: var(--interactive-normal);
  box-shadow: var(--input-shadow);
  cursor: pointer;
}

.card.active {
  color: var(--interactive-accent);
  background: hsla(var(--interactive-accent-hsl), 0.2);
  box-shadow: var(--input-shadow);
}

.count {
  font-size: 18px;
  font-weight: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.label {
  font-size: 12px;
  font-weight: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
