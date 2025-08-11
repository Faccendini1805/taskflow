<script lang="ts">
  import KanbanBoard from '$lib/components/KanbanBoard.svelte';
  import { tasks, tasksByStatus } from '$lib/stores/tasks.store';
  import { onMount } from 'svelte';

  onMount(() => { tasks.list().catch(console.error); });

  function handleMove(e: CustomEvent<{ taskId: number; toStatus: any }>) {
    const { taskId, toStatus } = e.detail;
    tasks.changeStatus(taskId, toStatus).catch(console.error);
  }
</script>

<section class="space-y-4">
  <h1 class="text-xl font-semibold">Tablero</h1>
  <KanbanBoard tasksByStatus={$tasksByStatus} on:move={handleMove} />
</section>
