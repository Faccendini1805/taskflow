<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Task, Agent } from '$lib/types';
  import TaskForm from './tasks/TaskForm.svelte';
  import KanbanBoard from '../components/KanbanBoard.svelte';
  import BitacoraModal from '../components/BitacoraModal.svelte';
  import TaskFilters from '../components/TaskFilters.svelte';
  import { socketService } from '$lib/socket';

  let tasks: Task[] = [];
  let filteredTasks: Task[] = [];
  let agents: Agent[] = [];
  let showBitacora = false;
  let selectedTaskId: number | null = null;
  let loading = true;
  
  // Filtros
  let activeFilters = {
    status: '',
    agentId: '',
    search: '',
    startDate: '',
    endDate: ''
  };

  async function fetchTasks() {
    try {
      // Construir parámetros de consulta basados en los filtros activos
      const params = new URLSearchParams();
      
      if (activeFilters.status) params.append('status', activeFilters.status);
      if (activeFilters.agentId) params.append('agentId', activeFilters.agentId);
      if (activeFilters.search) params.append('search', activeFilters.search);
      if (activeFilters.startDate) params.append('startDate', activeFilters.startDate);
      if (activeFilters.endDate) params.append('endDate', activeFilters.endDate);
      
      const queryString = params.toString();
      const url = `http://localhost:3000/api/tasks${queryString ? `?${queryString}` : ''}`;
      
      const res = await fetch(url);
      tasks = await res.json();
      filteredTasks = [...tasks];
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }
  
  // Manejar cambios en los filtros
  function handleFilter(event: CustomEvent) {
    const { status, agentId, search, startDate, endDate } = event.detail;
    activeFilters = { status, agentId, search, startDate, endDate };
    fetchTasks();
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
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Dashboard de Tareas</h2>
      <div class="text-sm text-gray-500">
        {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea' : 'tareas'} mostradas
      </div>
    </div>
    
    {#if loading}
      <div class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    {:else}
      <!-- Filtros avanzados -->
      <TaskFilters 
        {agents}
        on:filter={handleFilter}
        class="mb-6"
      />
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <TaskForm {agents} on:created={fetchTasks} />
        </div>
        <div class="lg:col-span-2">
          <KanbanBoard 
            tasks={filteredTasks}
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
