<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Agent } from '$lib/types';

  export let agents: Agent[] = [];
  
  // Filtros
  let statusFilter = '';
  let agentFilter = '';
  let searchText = '';
  let startDate = '';
  let endDate = '';
  
  const dispatch = createEventDispatcher();
  
  // Opciones de estado
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'EN_PROGRESO', label: 'En Progreso' },
    { value: 'COMPLETADO', label: 'Completado' }
  ];
  
  // Aplicar filtros
  function applyFilters() {
    dispatch('filter', {
      status: statusFilter,
      agentId: agentFilter,
      search: searchText,
      startDate,
      endDate
    });
  }
  
  // Limpiar filtros
  function clearFilters() {
    statusFilter = '';
    agentFilter = '';
    searchText = '';
    startDate = '';
    endDate = '';
    applyFilters();
  }
  
  // Disparar evento cuando cambie cualquier filtro
  $: if (statusFilter || agentFilter || searchText || startDate || endDate) {
    applyFilters();
  }
</script>

<div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
  <div class="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
    <!-- Búsqueda por texto -->
    <div class="flex-1">
      <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
      <input
        type="text"
        id="search"
        bind:value={searchText}
        placeholder="Buscar tareas..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    
    <!-- Filtro por estado -->
    <div class="w-full md:w-48">
      <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
      <select
        id="status"
        bind:value={statusFilter}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {#each statusOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>
    
    <!-- Filtro por agente -->
    <div class="w-full md:w-48">
      <label for="agent" class="block text-sm font-medium text-gray-700 mb-1">Agente</label>
      <select
        id="agent"
        bind:value={agentFilter}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Todos los agentes</option>
        {#each agents as agent}
          <option value={agent.id}>
            {agent.name}
          </option>
        {/each}
      </select>
    </div>
    
    <!-- Filtro por rango de fechas -->
    <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
      <div>
        <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
        <input
          type="date"
          id="startDate"
          bind:value={startDate}
          class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
        <input
          type="date"
          id="endDate"
          bind:value={endDate}
          class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
    
    <!-- Botón para limpiar filtros -->
    <div class="flex items-end">
      <button
        on:click={clearFilters}
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Limpiar
      </button>
    </div>
  </div>
</div>
