<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export type Member = { id: number; name: string };
  export type Task = {
    id: number;
    expediente: string;
    description: string;
    status: 'PENDIENTE' | 'EN_PROCESO' | 'EN_ESPERA' | 'COMPLETADO' | 'CANCELADO';
    priority?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    members?: { role: 'OWNER' | 'COLLABORATOR'; agent: Member }[];
    area?: { id: number; name: string } | null;
    dueDate?: string | null;
  };

  export let task: Task;
  export let draggable = true;

  const dispatch = createEventDispatcher<{ open: number }>();

  $: badge =
    task.priority === 'CRITICA' ? 'bg-red-600 text-white' :
    task.priority === 'ALTA' ? 'bg-red-100 text-red-700' :
    task.priority === 'BAJA' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700';

  function onDragStart(e: DragEvent) {
    if (!draggable) return;
    e.dataTransfer?.setData('text/plain', String(task.id));
    e.dataTransfer?.setData('application/task', JSON.stringify(task));
    e.dataTransfer!.effectAllowed = 'move';
  }
</script>

<div
  class="rounded-2xl border bg-white p-3 shadow-sm cursor-grab active:cursor-grabbing select-none"
  draggable={draggable}
  on:dragstart={onDragStart}
  on:dblclick={() => dispatch('open', task.id)}
>
  <div class="flex items-start justify-between gap-2">
    <div class="text-sm font-medium truncate">#{task.id} • {task.expediente}</div>
    <span class="inline-flex rounded-full px-2 py-0.5 text-[11px] {badge}">
      {task.priority ?? 'MEDIA'}
    </span>
  </div>

  <div class="mt-1.5 text-sm text-gray-700 line-clamp-3">
    {task.description}
  </div>

  <div class="mt-2 flex items-center justify-between">
    <div class="flex -space-x-2">
      {#each (task.members ?? []).slice(0,3) as m}
        <div class="inline-flex h-7 w-7 items-center justify-center rounded-full border bg-gray-900 text-white text-[11px]" title={`${m.role}: ${m.agent.name}`}>
          {m.agent.name[0]}
        </div>
      {/each}
      {#if (task.members?.length ?? 0) > 3}
        <div class="inline-flex h-7 w-7 items-center justify-center rounded-full border bg-gray-100 text-gray-600 text-[11px]">+{(task.members!.length - 3)}</div>
      {/if}
    </div>
    {#if task.dueDate}
      <span class="text-[11px] text-gray-500">Vence: {new Date(task.dueDate).toLocaleDateString('es-AR')}</span>
    {/if}
  </div>
</div>
