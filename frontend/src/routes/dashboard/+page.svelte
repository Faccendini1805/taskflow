<script>
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  
  let stats = {
    totalTasks: 24,
    pendingTasks: 8,
    inProgressTasks: 10,
    completedTasks: 6
  };
  
  let recentTasks = [
    { id: 1, title: 'Revisar informe trimestral', status: 'pending', priority: 'high', dueDate: '2025-08-10' },
    { id: 2, title: 'Preparar presentación', status: 'in_progress', priority: 'medium', dueDate: '2025-08-12' },
    { id: 3, title: 'Enviar recordatorio', status: 'pending', priority: 'low', dueDate: '2025-08-15' }
  ];
  
  function getStatusClass(status) {
    return {
      'completed': 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    }[status] || 'bg-gray-100 text-gray-800';
  }
  
  function getStatusText(status) {
    return {
      'completed': 'Completada',
      'in_progress': 'En progreso',
      'pending': 'Pendiente'
    }[status] || status;
  }
</script>

<div class="py-6">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
    <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
    <p class="mt-1 text-sm text-gray-500">
      Bienvenido, {$auth.user?.agent?.name || 'Usuario'}.
    </p>
  </div>
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
    <!-- Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {#each Object.entries(stats) as [key, value]}
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {key === 'totalTasks' ? 'Tareas Totales' : 
                     key === 'pendingTasks' ? 'Pendientes' :
                     key === 'inProgressTasks' ? 'En Progreso' : 'Completadas'}
                  </dt>
                  <dd class="text-2xl font-semibold text-gray-900">
                    {value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Recent Tasks -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Tareas Recientes
        </h3>
      </div>
      
      <div class="bg-white overflow-hidden">
        <ul class="divide-y divide-gray-200">
          {#each recentTasks as task}
            <li class="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <p class="text-sm font-medium text-indigo-600 truncate">
                    {task.title}
                  </p>
                  <span class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusClass(task.status)}">
                    {getStatusText(task.status)}
                  </span>
                </div>
                <div class="text-sm text-gray-500">
                  Vence: {new Date(task.dueDate).toLocaleDateString('es-ES')}
                </div>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</div>
