<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Task, Agent, TaskFormData } from '$lib/types';

  export let task: Partial<Task> = {};
  export let agents: Agent[] = [];
  export let isOpen = false;
  export let isSubmitting = false;

  const dispatch = createEventDispatcher();

  // Initialize form data
  $: formData = {
    expediente: task.expediente || '',
    description: task.description || '',
    status: task.status || 'PENDIENTE',
    agentId: task.agentId || undefined,
    collabId: task.collabId || undefined,
    inventoryCode: task.inventory?.code || ''
  };

  const statusOptions = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'EN_PROCESO', label: 'En Progreso' },
    { value: 'COMPLETADO', label: 'Completado' }
  ];

  function handleSubmit() {
    dispatch('submit', formData);
  }

  function handleClose() {
    dispatch('close');
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            {task.id ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <button 
            on:click={handleClose}
            class="text-gray-400 hover:text-gray-500"
            aria-label="Cerrar"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <!-- Expediente -->
          <div>
            <label for="expediente" class="block text-sm font-medium text-gray-700 mb-1">
              N° de Expediente <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="expediente"
              bind:value={formData.expediente}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <!-- Descripción -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span class="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              bind:value={formData.description}
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Estado -->
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                Estado <span class="text-red-500">*</span>
              </label>
              <select
                id="status"
                bind:value={formData.status}
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {#each statusOptions as option}
                  <option value={option.value}>
                    {option.label}
                  </option>
                {/each}
              </select>
            </div>

            <!-- Agente Asignado -->
            <div>
              <label for="agent" class="block text-sm font-medium text-gray-700 mb-1">
                Asignar a
              </label>
              <select
                id="agent"
                bind:value={formData.agentId}
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={undefined}>Sin asignar</option>
                {#each agents as agent}
                  <option value={agent.id}>
                    {agent.name}
                  </option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Código de Inventario -->
          <div>
            <label for="inventoryCode" class="block text-sm font-medium text-gray-700 mb-1">
              Código de Inventario
            </label>
            <input
              type="text"
              id="inventoryCode"
              bind:value={formData.inventoryCode}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Opcional"
            />
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="button"
              on:click={handleClose}
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting || !formData.expediente || !formData.description}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}
