<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Task, Agent } from '$lib/types';
  import TaskForm from './tasks/TaskForm.svelte';
  import KanbanBoard from '../components/KanbanBoard.svelte';
  import BitacoraModal from '../components/BitacoraModal.svelte';
  import { socketService } from '$lib/socket';

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

  async function updateTaskStatus(taskId: number, status: string) {
    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      // Refresh the task list to get the latest data
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert the UI to reflect the actual state
      await fetchTasks();
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
    
    // Initialize WebSocket connection
    socketService.connect();
    
    // Set up WebSocket event listeners with proper typing
    const unsubTaskUpdated = socketService.on('task:updated', (updatedTask: Task) => {
      tasks = tasks.map(task => 
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      );
    });
    
    const unsubTaskCreated = socketService.on('task:created', (newTask: Task) => {
      // Only add if task doesn't exist (in case of race conditions)
      if (!tasks.some(t => t.id === newTask.id)) {
        tasks = [...tasks, newTask];
      }
    });
    
    const unsubTaskDeleted = socketService.on('task:deleted', ({ id }: { id: number }) => {
      tasks = tasks.filter(task => task.id !== id);
    });
    
    // Clean up on component destroy
    return () => {
      unsubTaskUpdated();
      unsubTaskCreated();
      unsubTaskDeleted();
      socketService.disconnect();
    };
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
          <KanbanBoard 
            {tasks} 
            {agents} 
            on:openBitacora={handleOpenBitacora}
            on:taskUpdate={async (e) => {
              const { taskId, updates } = e.detail;
              await updateTaskStatus(taskId, updates.status);
            }}
          />
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
