<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { flip } from 'svelte/animate';
  import type { Task, Agent } from '$lib/types';
  import TaskCard from './TaskCard.svelte';

  export let tasks: Task[] = [];
  export let agents: Agent[] = [];

  const dispatch = createEventDispatcher();
  
  // Track drag state
  let draggedTask: Task | null = null;
  let dragOverColumn: string | null = null;
  let isDragging = false;

  const columns = [
    { 
      key: 'PENDIENTE', 
      label: 'Pendiente', 
      color: 'bg-yellow-50 border-yellow-200',
      icon: '⏳',
      description: 'Tareas que están esperando a ser iniciadas',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      accentColor: 'bg-yellow-500'
    },
    { 
      key: 'EN_PROGRESO', 
      label: 'En Progreso', 
      color: 'bg-blue-50 border-blue-200',
      icon: '🚧',
      description: 'Tareas que están siendo trabajadas actualmente',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
      accentColor: 'bg-blue-500',
      pulse: true
    },
    { 
      key: 'COMPLETADO', 
      label: 'Completado', 
      color: 'bg-green-50 border-green-200',
      icon: '✅',
      description: 'Tareas que han sido finalizadas',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      accentColor: 'bg-green-500',
      showCheck: true
    }
  ];

  function getStatusColor(status: string) {
    const column = columns.find(col => col.key === status);
    return column ? `${column.bgColor} ${column.textColor}` : 'bg-gray-100 text-gray-800';
  }
  
  function getColumnConfig(status: string) {
    return columns.find(col => col.key === status) || columns[0];
  }

  function handleOpenBitacora(event: CustomEvent) {
    dispatch('openBitacora', { taskId: event.detail.taskId });
  }

  function handleDragStart(task: Task) {
    draggedTask = task;
    isDragging = true;
  }

  function handleDragEnd() {
    isDragging = false;
    dragOverColumn = null;
  }

  function handleDragOver(columnKey: string, event: DragEvent) {
    event.preventDefault();
    if (draggedTask?.status !== columnKey) {
      dragOverColumn = columnKey;
    } else {
      dragOverColumn = null;
    }
  }

  function handleDrop(columnKey: string, event: DragEvent) {
    event.preventDefault();
    
    if (draggedTask && draggedTask.status !== columnKey) {
      // Update the task status
      const updatedTask = { ...draggedTask, status: columnKey };
      
      // Emit the change to the parent component
      dispatch('taskUpdate', {
        taskId: updatedTask.id,
        updates: { status: columnKey }
      });
      
      // Update local state for immediate feedback
      const taskIndex = tasks.findIndex(t => t.id === updatedTask.id);
      if (taskIndex !== -1) {
        tasks = [
          ...tasks.slice(0, taskIndex),
          updatedTask,
          ...tasks.slice(taskIndex + 1)
        ];
      }
    }
    
    dragOverColumn = null;
    draggedTask = null;
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
    <div>
      <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800">📋</span>
        Tablero Kanban
      </h3>
      <p class="text-sm text-gray-500 mt-1">Arrastra las tareas entre columnas para cambiar su estado</p>
    </div>
    <div class="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
      <span class="text-sm font-medium text-gray-700">Total:</span>
      <span class="inline-flex items-center justify-center h-6 px-2.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-800">
        {tasks.length} {tasks.length === 1 ? 'tarea' : 'tareas'}
      </span>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each columns as column}
      <div class="bg-white rounded-lg shadow-sm border {column.borderColor} overflow-hidden transition-all duration-200 hover:shadow-md">
        <div class="p-4 border-b {column.borderColor} {column.bgColor}">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl">{column.icon}</span>
              <h4 class="font-semibold {column.textColor}">{column.label}</h4>
            </div>
            <span class="inline-flex items-center justify-center h-6 px-2.5 rounded-full bg-white/80 text-xs font-medium {column.textColor} border {column.borderColor}">
              {tasks.filter(t => t.status === column.key).length}
            </span>
          </div>
          <p class="text-xs mt-1 {column.textColor} opacity-80">{column.description}</p>
        </div>
        
        <div 
          class="min-h-[100px] p-3 space-y-2 transition-all duration-200 {dragOverColumn === column.key ? 'bg-opacity-50' + ' ' + column.bgColor : ''}"
          class:ring-2={dragOverColumn === column.key}
          class:ring-offset-2={dragOverColumn === column.key}
          class:ring-opacity-50={dragOverColumn === column.key}
          class:ring-{column.accentColor?.split('-')[1]}-300={dragOverColumn === column.key}
          on:dragover|preventDefault={() => dragOverColumn = column.key}
          on:dragleave|preventDefault={() => dragOverColumn = null}
          on:drop|preventDefault={() => handleDrop(column.key, event)}
        >
          {#if dragOverColumn === column.key}
            <div class="flex flex-col items-center justify-center py-4 px-3 border-2 border-dashed rounded-lg border-{column.accentColor?.split('-')[1]}-300">
              <span class="text-2xl mb-1">{column.icon}</span>
              <span class="text-sm font-medium text-gray-500">Suelta aquí para mover</span>
            </div>
          {:else}
            <div class="space-y-2" data-status={column.key}>
              {#each tasks.filter(t => t.status === column.key) as task (task.id)}
                <div
                  draggable
                  on:dragstart|self={() => handleDragStart(task)}
                  on:dragend|self={handleDragEnd}
                  class={`cursor-grab active:cursor-grabbing transition-transform duration-200 ${draggedTask?.id === task.id ? 'opacity-50 scale-95' : ''}`}
                >
                  <TaskCard 
                    {task} 
                    {agents}
                    on:openBitacora
                    on:taskUpdate
                    getStatusColor={getStatusColor}
                  />
                </div>
              {:else}
                <div class="text-center py-6">
                  <p class="text-sm text-gray-400">No hay tareas en esta columna</p>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div> 