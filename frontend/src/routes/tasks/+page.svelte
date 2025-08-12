<script lang="ts">
  import KanbanBoard from '$lib/components/KanbanBoard.svelte';
  import { tasks, tasksByStatus } from '$lib/stores/tasks.store';
  import { onMount } from 'svelte';

  onMount(() => { tasks.list().catch(console.error); });

  function handleMove(e: CustomEvent<{ taskId: number; toStatus: any }>) {
    const { taskId, toStatus } = e.detail;
    tasks.changeStatus(taskId, toStatus).catch(console.error);
  }

  function openTask(id: number) {
    window.location.href = `/tasks/${id}`;
  }
</script>

<section class="space-y-4">
  <div class="flex items-center justify-between">
    <h1 class="text-xl font-semibold">Tareas</h1>
    <a href="/tasks/new" class="btn-primary">Nueva tarea</a>
  </div>

  <KanbanBoard tasksByStatus={$tasksByStatus} on:move={handleMove} on:open={(e)=>openTask(e.detail)} />
</section>
