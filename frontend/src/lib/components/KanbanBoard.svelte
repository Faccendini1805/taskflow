<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TaskCard, { type Task } from './TaskCard.svelte';

  export type Column = {
    key: Task['status'];
    title: string;
  };

  export let columns: Column[] = [
    { key: 'PENDIENTE', title: 'Pendiente' },
    { key: 'EN_PROCESO', title: 'En Proceso' },
    { key: 'EN_ESPERA', title: 'En Espera' },
    { key: 'COMPLETADO', title: 'Completado' }
  ];

  export let tasksByStatus: Record<Task['status'], Task[]> = {
    PENDIENTE: [],
    EN_PROCESO: [],
    EN_ESPERA: [],
    COMPLETADO: [],
    CANCELADO: []
  };

  const dispatch = createEventDispatcher<{
    move: { taskId: number; toStatus: Task['status'] };
    open: number;
  }>();

  let dragOverStatus: Task['status'] | null = null;

  function onDrop(e: DragEvent, toStatus: Task['status']) {
    e.preventDefault();
    const idStr = e.dataTransfer?.getData('text/plain');
    const taskId = idStr ? Number(idStr) : NaN;
    if (!Number.isFinite(taskId)) return;
    dispatch('move', { taskId, toStatus });
    dragOverStatus = null;
  }

  function allowDrop(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
  {#each columns as col}
    <section
      class="rounded-2xl border bg-gray-50/60 p-3 min-h-[240px] flex flex-col"
      class:border-blue-400={dragOverStatus === col.key}
      on:dragover={allowDrop}
      on:dragenter={() => (dragOverStatus = col.key)}
      on:dragleave={() => (dragOverStatus = null)}
      on:drop={(e) => onDrop(e, col.key)}
      aria-dropeffect="move"
    >
      <header class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-semibold">{col.title}</h3>
        <span class="text-xs text-gray-500">{tasksByStatus[col.key]?.length ?? 0}</span>
      </header>

      <div class="flex-1 space-y-2">
        {#each tasksByStatus[col.key] ?? [] as t (t.id)}
          <TaskCard task={t} on:open={(e) => dispatch('open', e.detail)} />
        {/each}
      </div>
    </section>
  {/each}
</div>
