<script>
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  
  let formData = {
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  let loading = false;
  let error = '';
  let success = '';
  
  // Initialize form with user data
  onMount(() => {
    if ($auth.user) {
      formData.email = $auth.user.email || '';
    }
  });
  
  // Handle form submission
  async function handleSubmit() {
    // Basic validation
    if (!formData.email) {
      error = 'El correo electrónico es requerido';
      return;
    }
    
    // Password change validation
    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        error = 'Debe ingresar su contraseña actual para realizar cambios';
        return;
      }
      
      if (formData.newPassword.length > 0 && formData.newPassword.length < 8) {
        error = 'La nueva contraseña debe tener al menos 8 caracteres';
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        error = 'Las contraseñas no coinciden';
        return;
      }
    }
    
    loading = true;
    error = '';
    success = '';
    
    try {
      // Prepare update data
      const updateData = {
        email: formData.email,
        ...(formData.currentPassword && {
          currentPassword: formData.currentPassword,
          ...(formData.newPassword && { newPassword: formData.newPassword })
        })
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${$auth.token}`
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar el perfil');
      }
      
      // Update user in auth store
      auth.updateUser(data.data.user);
      
      // Show success message
      success = 'Perfil actualizado correctamente';
      
      // Clear password fields
      formData.currentPassword = '';
      formData.newPassword = '';
      formData.confirmPassword = '';
      
      // Update token if it was refreshed
      if (data.token) {
        auth.updateToken(data.token);
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        success = '';
      }, 3000);
      
    } catch (err) {
      console.error('Update profile error:', err);
      error = err.message || 'Error al actualizar el perfil. Por favor intente de nuevo.';
    } finally {
      loading = false;
    }
  }
  
  // Handle input changes
  function handleInputChange(event) {
    const { name, value } = event.target;
    formData = { ...formData, [name]: value };
    
    // Clear error when user starts typing
    if (error) error = '';
  }
  
  // Handle form submission on Enter key
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

<svelte:head>
  <title>Mi Perfil - TaskFlow</title>
</svelte:head>

<div class="max-w-3xl mx-auto">
  <div class="md:flex md:items-center md:justify-between mb-8">
    <div class="flex-1 min-w-0">
      <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
        Mi Perfil
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        Actualiza tu información personal y cambia tu contraseña
      </p>
    </div>
  </div>
  
  {#if error}
    <div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}
  
  {#if success}
    <div class="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">{success}</p>
        </div>
      </div>
    </div>
  {/if}
  
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
      <h3 class="text-lg leading-6 font-medium text-gray-900">
        Información del perfil
      </h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        Detalles personales y configuración de la cuenta.
      </p>
    </div>
    
    <div class="px-4 py-5 sm:p-6">
      <div class="space-y-6">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <div class="mt-1">
            <input
              type="email"
              id="email"
              name="email"
              bind:value={formData.email}
              on:input={handleInputChange}
              on:keydown={handleKeyDown}
              class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="tu@ejemplo.com"
              disabled={loading}
            />
          </div>
        </div>
        
        <!-- Current Password -->
        <div>
          <label for="currentPassword" class="block text-sm font-medium text-gray-700">
            Contraseña actual
          </label>
          <div class="mt-1">
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              bind:value={formData.currentPassword}
              on:input={handleInputChange}
              on:keydown={handleKeyDown}
              class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <p class="mt-1 text-xs text-gray-500">
            Solo necesitas ingresar tu contraseña actual si deseas cambiarla.
          </p>
        </div>
        
        <!-- New Password -->
        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700">
            Nueva contraseña
          </label>
          <div class="mt-1">
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              bind:value={formData.newPassword}
              on:input={handleInputChange}
              on:keydown={handleKeyDown}
              class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <p class="mt-1 text-xs text-gray-500">
            Deja este campo en blanco si no deseas cambiar la contraseña.
          </p>
        </div>
        
        <!-- Confirm New Password -->
        {#if formData.newPassword}
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmar nueva contraseña
            </label>
            <div class="mt-1">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                bind:value={formData.confirmPassword}
                on:input={handleInputChange}
                on:keydown={handleKeyDown}
                class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>
        {/if}
        
        <div class="pt-5">
          <div class="flex justify-end">
            <button
              type="button"
              on:click={handleSubmit}
              disabled={loading}
              class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if loading}
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              {:else}
                Guardar cambios
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Account Information -->
  <div class="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
      <h3 class="text-lg leading-6 font-medium text-gray-900">
        Información de la cuenta
      </h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        Detalles de tu cuenta y rol en el sistema.
      </p>
    </div>
    
    <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
      <dl class="sm:divide-y sm:divide-gray-200">
        <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">
            Rol
          </dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {#if $auth.user?.role === 'ADMIN'}
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                Administrador
              </span>
            {:else if $auth.user?.role === 'SUPERVISOR'}
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                Supervisor
              </span>
            {:else}
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Agente
              </span>
            {/if}
          </dd>
        </div>
        
        {#if $auth.user?.agent}
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">
              Nombre
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {$auth.user.agent.name}
            </dd>
          </div>
          
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">
              Teléfono
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {$auth.user.agent.phone || 'No especificado'}
            </dd>
          </div>
        {/if}
        
        <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">
            Miembro desde
          </dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {new Date($auth.user?.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</div>
