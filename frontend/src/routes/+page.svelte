<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import KanbanBoard from '$lib/components/KanbanBoard.svelte';
  import { tasks, tasksByStatus } from '$lib/stores/tasks.store';
  import { http } from '$lib/utils/fetchClient';

  type Summary = {
    since: string;
    throughput30d: number;
    leadTimeAvgHours30d: number;
    statusByArea: { area: string; status: string; count: number }[];
  };

  type Task = {
    id: number;
    expediente: string;
    description: string;
    status: 'PENDIENTE' | 'EN_PROCESO' | 'EN_ESPERA' | 'COMPLETADO' | 'CANCELADO';
    priority?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    area?: { id: number; name: string } | null;
    createdAt?: string;
  };

  let loading = true;
  let error: string | null = null;
  let summary: Summary | null = null;
  let recent: Task[] = [];

  // Client-side only code
  if (browser) {
    onMount(async () => {
      loading = true;
      error = null;
      
      try {
        // Load tasks for the Kanban board
        await tasks.list();
        
        // Load dashboard summary
        try {
          summary = await http.get<Summary>('/api/reports/summary');
        } catch (e) {
          console.error('Error loading dashboard summary:', e);
          // Continue even if summary fails
        }
        
        // Load recent tasks
        try {
          const response = await http.get<Task[]>('/api/tasks/recent');
          recent = response || [];
        } catch (e) {
          console.error('Error loading recent tasks:', e);
          recent = [];
        }
      } catch (e) {
        console.error('Error loading dashboard data:', e);
        error = 'Error al cargar el tablero. Por favor, recarga la página.';
      } finally {
        loading = false;
      }
    });
  } else {
    // Server-side rendering - don't load data
    loading = false;
  }

  function handleMove(e: CustomEvent<{ taskId: number; toStatus: any }>) {
    if (!browser) return;
    const { taskId, toStatus } = e.detail;
    tasks.changeStatus(taskId, toStatus).catch(console.error);
  }
</script>

<section class="space-y-4">
  <h1 class="text-xl font-semibold">Tablero</h1>
  {#if loading}
    <div class="text-center p-8">Cargando tablero...</div>
  {:else if error}
    <div class="bg-red-50 border-l-4 border-red-400 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {:else}
    <KanbanBoard tasksByStatus={$tasksByStatus} on:move={handleMove} />
  {/if}
</section>
      error = e?.message ?? 'Error cargando el dashboard';
    } finally {
      loading = false;
    }
  });

  function fmt(n: number) {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n);
  }
</script>

<section class="space-y-6">
  <header class="flex items-center justify-between">
    <h1 class="text-xl font-semibold">Dashboard</h1>
    <a href="/tasks" class="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">Ver tareas</a>
  </header>

  {#if loading}
    <div class="text-sm text-gray-600">Cargando…</div>
  {:else if error}
    <div class="text-sm text-red-600">{error}</div>
  {:else}
    <!-- KPIs -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-2xl border bg-white p-4">
        <div class="text-xs text-gray-500 mb-1">Throughput (30 días)</div>
        <div class="text-2xl font-semibold">{fmt(summary!.throughput30d)}</div>
      </div>

      <div class="rounded-2xl border bg-white p-4">
        <div class="text-xs text-gray-500 mb-1">Lead Time Promedio</div>
        <div class="text-2xl font-semibold">{fmt(summary!.leadTimeAvgHours30d)} h</div>
      </div>

      <div class="rounded-2xl border bg-white p-4">
        <div class="text-xs text-gray-500 mb-1">Áreas con más carga</div>
        <div class="text-sm">
          {#each (summary!.statusByArea.slice(0,3)) as r}
            <div class="flex justify-between">
              <span class="text-gray-700 truncate">{r.area} · {r.status}</span>
              <span class="font-medium">{r.count}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="rounded-2xl border bg-white p-4">
        <div class="text-xs text-gray-500 mb-1">Desde</div>
        <div class="text-sm">{new Date(summary!.since).toLocaleDateString('es-AR')}</div>
      </div>
    </div>

    <!-- Últimas tareas -->
    <div class="rounded-2xl border bg-white">
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-sm font-semibold">Últimas tareas</h2>
        <a href="/tasks" class="text-sm text-blue-600 hover:underline">Ver todas</a>
      </div>

      <ul class="divide-y">
        {#each recent as t}
          <li class="p-4 hover:bg-gray-50 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="text-sm font-medium truncate">#{t.id} • {t.expediente}</div>
              <div class="text-sm text-gray-600 truncate">{t.description}</div>
              <div class="mt-1 text-xs text-gray-500">
                {t.area ? t.area.name : 'Sin área'} · {t.status}
                {#if t.createdAt} · {new Date(t.createdAt).toLocaleDateString('es-AR')}{/if}
              </div>
            </div>
            <a href={`/tasks/${t.id}`} class="rounded-lg border px-2.5 py-1 text-xs hover:bg-gray-50">Abrir</a>
          </li>
        {/each}
        {#if recent.length === 0}
          <li class="p-4 text-sm text-gray-600">No hay tareas recientes.</li>
        {/if}
      </ul>
    </div>
  {/if}
</section>
