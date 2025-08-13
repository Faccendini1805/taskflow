<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { auth, currentUser } from '$lib/stores/auth.store';
  import { onDestroy } from 'svelte';

  let sidebarOpen = true;
  let user: any = null;

  // Svelte 5: no $store in markup; subscribe to the store manually
  const unsubscribe = currentUser.subscribe((v) => (user = v));
  onDestroy(unsubscribe);

  function handleLogout() {
    auth.logout();
    location.href = '/login';
  }
</script>

<Navbar title="Taskflow" user={user} on:toggleSidebar={() => (sidebarOpen = !sidebarOpen)} on:logout={handleLogout} />

<div class="mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-4 mt-4">
  <Sidebar open={sidebarOpen} on:select={(e) => (location.href = e.detail)} />
  <main class="min-h-[60vh]">
    <slot />
  </main>
</div>
