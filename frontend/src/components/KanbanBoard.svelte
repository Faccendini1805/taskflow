<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Task, Agent } from '$lib/types';
  import TaskCard from './TaskCard.svelte';

  export let tasks: Task[] = [];
  export let agents: Agent[] = [];

  const dispatch = createEventDispatcher();

  const columns = [
    { key: 'PENDIENTE', label: 'Pendiente', color: 'bg-yellow-50 border-yellow-200' },
    { key: 'EN_PROCESO', label: 'En Proceso', color: 'bg-blue-50 border-blue-200' },
    { key: 'EN_ESPERA', label: 'En Espera', color: 'bg-orange-50 border-orange-200' },
    { key: 'COMPLETADO', label: 'Completado', color: 'bg-green-50 border-green-200' }
  ];

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'EN_PROCESO': return 'bg-blue-100 text-blue-800';
      case 'EN_ESPERA': return 'bg-orange-100 text-orange-800';
      case 'COMPLETADO': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function handleOpenBitacora(event: CustomEvent) {
    dispatch('openBitacora', { taskId: event.detail.taskId });
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h3 class="text-lg font-semibold text-gray-900">Tablero Kanban</h3>
    <div class="text-sm text-gray-500">
      {tasks.length} tarea{tasks.length !== 1 ? 's' : ''} total
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each columns as column}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200">
          <h4 class="font-medium text-gray-900">{column.label}</h4>
          <div class="text-sm text-gray-500">
            {tasks.filter(t => t.status === column.key).length} tarea{tasks.filter(t => t.status === column.key).length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div class="p-2 min-h-[400px]">
          {#each tasks.filter(t => t.status === column.key) as task (task.id)}
            <TaskCard 
              {task} 
              {agents} 
              {getStatusColor}
              on:openBitacora={handleOpenBitacora}
            />
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div> 