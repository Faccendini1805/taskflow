<script lang="ts">
  import { onMount } from 'svelte';
  import type { Task, Agent } from '$lib/types';
  import TaskForm from './tasks/TaskForm.svelte';
  import KanbanBoard from '../components/KanbanBoard.svelte';
  import BitacoraModal from '../components/BitacoraModal.svelte';

  let tasks: Task[] = [];
  let agents: Agent[] = [];
  let showBitacora = false;
  let selectedTaskId: number | null = null;
  let loading = true;

  async function fetchTasks() {
    try {
      const res = await fetch('http://localhost:3000/api/tasks');
      tasks = await res.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }

  async function fetchAgents() {
    try {
      const res = await fetch('http://localhost:3000/api/agents');
      agents = await res.json();
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  }

  function handleOpenBitacora(event: CustomEvent) {
    selectedTaskId = event.detail.taskId;
    showBitacora = true;
  }

  onMount(async () => {
    await Promise.all([fetchTasks(), fetchAgents()]);
    loading = false;
  });
</script>

<div class="space-y-6">
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Dashboard de Tareas</h2>
    
    {#if loading}
      <div class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <TaskForm {agents} on:created={fetchTasks} />
        </div>
        <div class="lg:col-span-2">
          <KanbanBoard {tasks} {agents} on:openBitacora={handleOpenBitacora} />
        </div>
      </div>
    {/if}
  </div>
</div>

<BitacoraModal
  taskId={selectedTaskId}
  bind:show={showBitacora}
  on:close={() => showBitacora = false}
/>
