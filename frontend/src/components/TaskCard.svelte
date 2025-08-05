<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Task, Agent } from '$lib/types';

  export let task: Task;
  export let agents: Agent[];
  export let getStatusColor: (status: string) => string;

  const dispatch = createEventDispatcher();

  let showEditModal = false;
  let editing = false;

  // Form data for editing
  let editData = {
    description: task.description,
    agentId: task.agentId,
    collabId: task.collabId,
    status: task.status
  };

  function openBitacora() {
    dispatch('openBitacora', { taskId: task.id });
  }

  function openEditModal() {
    editData = {
      description: task.description,
      agentId: task.agentId,
      collabId: task.collabId,
      status: task.status
    };
    showEditModal = true;
  }

  async function saveChanges() {
    editing = true;
    
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (res.ok) {
        const updatedTask = await res.json();
        task = updatedTask;
        showEditModal = false;
        dispatch('updated', { task: updatedTask });
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      editing = false;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
</script>

<div class="task-card mb-3">
  <div class="flex justify-between items-start mb-2">
    <div class="flex-1">
      <h4 class="font-semibold text-gray-900 text-sm">{task.expediente}</h4>
      <p class="text-gray-600 text-xs mt-1">{task.description}</p>
    </div>
    <div class="flex space-x-1">
      <button
        on:click={openEditModal}
        class="text-gray-400 hover:text-gray-600 p-1"
        title="Editar tarea"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
      </button>
      <button
        on:click={openBitacora}
        class="text-blue-400 hover:text-blue-600 p-1"
        title="Ver bitácora"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      </button>
    </div>
  </div>

  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-xs text-gray-500">Estado:</span>
      <span class="px-2 py-1 rounded-full text-xs font-medium {getStatusColor(task.status)}">
        {task.status.replace('_', ' ')}
      </span>
    </div>

    {#if task.assignedTo}
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">Agente:</span>
        <span class="text-xs font-medium text-gray-700">{task.assignedTo.name}</span>
      </div>
    {/if}

    {#if task.collaborator}
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">Colaborador:</span>
        <span class="text-xs font-medium text-gray-700">{task.collaborator.name}</span>
      </div>
    {/if}

    {#if task.inventory}
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">Inventario:</span>
        <span class="text-xs font-medium text-gray-700">{task.inventory.code}</span>
      </div>
    {/if}

    <div class="flex items-center justify-between">
      <span class="text-xs text-gray-500">Creada:</span>
      <span class="text-xs text-gray-500">{formatDate(task.createdAt)}</span>
    </div>
  </div>
</div>

<!-- Edit Modal -->
{#if showEditModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <h3 class="text-lg font-semibold mb-4">Editar Tarea</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            bind:value={editData.description}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Agente</label>
            <select bind:value={editData.agentId} class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value={null}>Sin asignar</option>
              {#each agents as agent}
                <option value={agent.id}>{agent.name}</option>
              {/each}
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Colaborador</label>
            <select bind:value={editData.collabId} class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value={null}>Sin colaborador</option>
              {#each agents as agent}
                <option value={agent.id}>{agent.name}</option>
              {/each}
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select bind:value={editData.status} class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="EN_ESPERA">En Espera</option>
            <option value="COMPLETADO">Completado</option>
          </select>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          on:click={() => showEditModal = false}
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
          disabled={editing}
        >
          Cancelar
        </button>
        <button
          on:click={saveChanges}
          disabled={editing}
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {#if editing}
            Guardando...
          {:else}
            Guardar
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if} 