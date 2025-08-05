<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Log } from '$lib/types';

  export let taskId: number | null = null;
  export let show = false;

  const dispatch = createEventDispatcher();

  let logs: Log[] = [];
  let loading = false;

  $: if (show && taskId) {
    fetchLogs();
  }

  async function fetchLogs() {
    if (!taskId) return;
    
    loading = true;
    try {
      const res = await fetch(`http://localhost:3000/api/logs/${taskId}`);
      logs = await res.json();
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      loading = false;
    }
  }

  function closeModal() {
    dispatch('close');
  }

  function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
</script>

{#if show}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">
          Bitácora de la Tarea #{taskId}
        </h2>
        <button
          on:click={closeModal}
          class="text-gray-400 hover:text-gray-600 p-2"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        {#if loading}
          <div class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        {:else if logs.length === 0}
          <div class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay registros</h3>
            <p class="mt-1 text-sm text-gray-500">Aún no se han registrado actividades en esta tarea.</p>
          </div>
        {:else}
          <div class="space-y-4">
            {#each logs as log, index}
              <div class="flex items-start space-x-4">
                <!-- Timeline dot -->
                <div class="flex-shrink-0">
                  <div class="w-3 h-3 rounded-full bg-blue-600 mt-2"></div>
                  {#if index < logs.length - 1}
                    <div class="w-0.5 h-8 bg-gray-200 mx-auto mt-1"></div>
                  {/if}
                </div>
                
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-gray-900 text-sm">{log.message}</p>
                    
                    <div class="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>{formatDateTime(log.createdAt)}</span>
                      {#if log.agent}
                        <span class="font-medium">por {log.agent.name}</span>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex justify-end p-6 border-t border-gray-200">
        <button
          on:click={closeModal}
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
{/if} 