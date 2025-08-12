<script lang="ts">
  import KanbanBoard from '$lib/components/KanbanBoard.svelte';
  import { tasks, tasksByStatus } from '$lib/stores/tasks.store';
  import { onMount } from 'svelte';

  onMount(() => { tasks.list().catch(console.error); });

  function handleMove(e: CustomEvent<{ taskId: number; toStatus: any }>) {
    const { taskId, toStatus } = e.detail;
    tasks.changeStatus(taskId, toStatus).catch(console.error);
  }
</script>

<section class="space-y-4">
  <h1 class="text-xl font-semibold">Tablero</h1>
  <KanbanBoard tasksByStatus={$tasksByStatus} on:move={handleMove} />
</section>
<script lang="ts">
  import { onMount } from 'svelte';
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

  onMount(async () => {
    loading = true; error = null;
    try {
      // Resumen
      summary = await http.get<Summary>('/api/reports/summary');

      // Últimas 8 tareas (ordenadas por fecha desc)
      const q = new URLSearchParams({ page: '1', pageSize: '8' }).toString();
      recent = await http.get<Task[]>(`/api/tasks?${q}`);
    } catch (e: any) {
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
