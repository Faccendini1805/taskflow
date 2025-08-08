<script>
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import '../app.css';
  
  // Check auth status on mount if in browser
  onMount(async () => {
    if (browser) {
      await auth.checkAuth();
    }
  });
  
  // Handle route protection
  $: if (browser) {
    const publicRoutes = ['/login'];
    const isPublicRoute = publicRoutes.includes($page.url.pathname);
    
    if (!$auth.isAuthenticated && !isPublicRoute) {
      // Redirect to login with redirect back URL
      const redirectTo = encodeURIComponent($page.url.pathname + $page.url.search);
      goto(`/login?redirect=${redirectTo}`);
    } else if ($auth.isAuthenticated && isPublicRoute) {
      // Redirect to dashboard if already logged in
      goto('/dashboard');
    }
  }
</script>

<div class="min-h-screen bg-gray-50">
  {#if $page.url.pathname !== '/login'}
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a href="/" class="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors">
              TaskFlow
            </a>
          </div>
          
          {#if $auth.isAuthenticated}
            <div class="flex items-center space-x-4">
              <div class="relative">
                <button
                  class="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-indigo-600 focus:outline-none"
                >
                  <span class="truncate max-w-xs">
                    {$auth.user?.agent?.name || $auth.user?.email}
                  </span>
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <!-- Dropdown menu -->
                <div class="hidden group-hover:block absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div class="py-1">
                    <a
                      href="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mi perfil
                    </a>
                    {#if $auth.user?.role === 'ADMIN'}
                      <a
                        href="/admin/users"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Administrar usuarios
                      </a>
                    {/if}
                    <button
                      on:click={() => auth.logout()}
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </nav>
  {/if}

  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    {#if $auth.loading && !$auth.isAuthenticated && $page.url.pathname !== '/login'}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    {:else}
      <slot />
    {/if}
  </main>
  
  {#if $auth.error && !$auth.isAuthenticated && $page.url.pathname !== '/login'}
    <div class="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-500 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">Error de autenticación: {$auth.error}</p>
        </div>
      </div>
    </div>
  {/if}
</div>
