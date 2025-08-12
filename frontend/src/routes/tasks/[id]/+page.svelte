<script lang="ts">
  export let data: {
    task: {
      id: number;
      expediente: string;
      description: string;
      status: string;
      priority?: string;
      area?: { id: number; name: string } | null;
      members?: { role: string; agent: { id: number; name: string } }[];
      logs?: { createdAt: string; message: string }[];
      statusHistory?: { createdAt: string; oldStatus: string | null; newStatus: string; reason?: string | null }[];
    } | null
  };

  const t = data.task;
</script>

{#if !t}
  <p class="text-sm text-gray-600">Tarea no encontrada.</p>
{:else}
  <section class="space-y-4">
    <header class="flex items-start justify-between">
      <div>
        <h1 class="text-xl font-semibold">#{t.id} • {t.expediente}</h1>
        <p class="text-sm text-gray-600 mt-1">{t.description}</p>
      </div>
      <a href="/tasks" class="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">Volver</a>
    </header>

    <div class="grid md:grid-cols-3 gap-4">
      <div class="md:col-span-2 space-y-4">
        <div class="rounded-2xl border bg-white p-4">
          <h2 class="text-sm font-semibold mb-3">Historial de estado</h2>
          <ul class="space-y-2">
            {#each (t.statusHistory ?? []) as h}
              <li class="text-sm">
                <span class="font-medium">{new Date(h.createdAt).toLocaleString('es-AR')}</span>
                — {h.oldStatus ?? '∅'} → <span class="font-medium">{h.newStatus}</span>
                {#if h.reason} <span class="text-gray-600">({h.reason})</span> {/if}
              </li>
            {/each}
            {#if !(t.statusHistory?.length)}
              <li class="text-sm text-gray-600">Sin registros.</li>
            {/if}
          </ul>
        </div>

        <div class="rounded-2xl border bg-white p-4">
          <h2 class="text-sm font-semibold mb-3">Logs</h2>
          <ul class="space-y-2">
            {#each (t.logs ?? []) as l}
              <li class="text-sm">
                <span class="font-medium">{new Date(l.createdAt).toLocaleString('es-AR')}</span>
                — {l.message}
              </li>
            {/each}
            {#if !(t.logs?.length)}
              <li class="text-sm text-gray-600">Sin logs.</li>
            {/if}
          </ul>
        </div>
      </div>

      <aside class="space-y-4">
        <div class="rounded-2xl border bg-white p-4">
          <h2 class="text-sm font-semibold mb-3">Estado</h2>
          <p class="text-sm"><span class="font-medium">Actual:</span> {t.status}</p>
          {#if t.priority}<p class="text-sm"><span class="font-medium">Prioridad:</span> {t.priority}</p>{/if}
          {#if t.area}<p class="text-sm"><span class="font-medium">Área:</span> {t.area.name}</p>{/if}
        </div>

        <div class="rounded-2xl border bg-white p-4">
          <h2 class="text-sm font-semibold mb-3">Miembros</h2>
          <ul class="space-y-1">
            {#each (t.members ?? []) as m}
              <li class="text-sm">{m.role}: {m.agent.name}</li>
            {/each}
            {#if !(t.members?.length)}
              <li class="text-sm text-gray-600">Sin miembros.</li>
            {/if}
          </ul>
        </div>
      </aside>
    </div>
  </section>
{/if}
