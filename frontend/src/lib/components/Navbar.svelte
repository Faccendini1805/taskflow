<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let title: string = 'Taskflow';
  export let user: { name?: string; email?: string } | null = null;

  const dispatch = createEventDispatcher<{ logout: void; toggleSidebar: void }>();
  let open = false;
</script>

<header class="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-40">
  <div class="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="md:hidden inline-flex items-center justify-center rounded-xl border px-2.5 py-1.5 hover:bg-gray-50"
        on:click={() => dispatch('toggleSidebar')}
        aria-label="Abrir menú"
      >
        ☰
      </button>
      <div class="text-xl font-semibold tracking-tight">{title}</div>
    </div>

    <div class="flex items-center gap-3">
      {#if user}
        <div class="relative">
          <button
            class="flex items-center gap-2 rounded-xl border px-3 py-1.5 hover:bg-gray-50"
            on:click={() => (open = !open)}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white text-sm">
              {user.name?.[0] ?? user.email?.[0] ?? 'U'}
            </span>
            <span class="hidden sm:block text-sm">{user.name ?? user.email}</span>
            <span class="text-gray-400">▾</span>
          </button>

          {#if open}
            <div
              class="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg overflow-hidden"
              on:click={() => (open = false)}
            >
              <a href="/profile" class="block px-4 py-2.5 text-sm hover:bg-gray-50">Perfil</a>
              <button
                class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50"
                on:click={() => dispatch('logout')}
              >
                Cerrar sesión
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <a href="/login" class="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">Ingresar</a>
      {/if}
    </div>
  </div>
</header>
