<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export type NavItem = {
    label: string;
    href?: string;
    icon?: string; // opcional si luego usas un set de íconos
    active?: boolean;
  };

  export let items: NavItem[] = [
    { label: 'Dashboard', href: '/', active: true },
    { label: 'Tareas', href: '/tasks' },
    { label: 'Reportes', href: '/reports' }
  ];

  export let open: boolean = true; // control externo para mobile
  const dispatch = createEventDispatcher<{ select: string }>();
</script>

<aside class="md:w-64 w-72 max-w-full md:block"
  class:hidden={!open}
  aria-label="Sidebar">
  <nav class="h-[calc(100dvh-56px)] sticky top-14 overflow-y-auto border-r bg-white">
    <ul class="p-3 space-y-1">
      {#each items as item}
        <li>
          <a
            href={item.href ?? '#'}
            on:click|preventDefault={() => dispatch('select', item.href ?? '#')}
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-gray-50 {item.active ? 'bg-gray-100 font-medium' : ''}"
            aria-current={item.active ? 'page' : undefined}
          >
            <span class="text-gray-500">{item.icon ?? '•'}</span>
            <span>{item.label}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</aside>
