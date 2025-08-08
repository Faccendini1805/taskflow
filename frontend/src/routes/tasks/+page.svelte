<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import TaskForm from '../../components/TaskForm.svelte';
  import type { PageData } from './$types';
  import type { Task, Agent } from '$lib/types';

  export let data: PageData;
  
  let isSubmitting = false;
  let agents: Agent[] = data.agents || [];
  let task: Partial<Task> = data.task || {};
  const isEditMode = !!task?.id;

  async function handleSubmit(formData: any) {
    isSubmitting = true;
    try {
      const url = isEditMode ? `/api/tasks/${task.id}` : '/api/tasks';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la tarea');
      }

      // Redirect to the main page after successful save
      goto('/');
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Ocurrió un error al guardar la tarea. Por favor, inténtalo de nuevo.');
    } finally {
      isSubmitting = false;
    }
  }

  function handleClose() {
    // Go back to the previous page
    window.history.back();
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900">
      {isEditMode ? 'Editar Tarea' : 'Nueva Tarea'}
    </h1>
    <p class="mt-1 text-sm text-gray-500">
      {isEditMode 
        ? 'Modifica los detalles de la tarea existente.' 
        : 'Completa el formulario para crear una nueva tarea.'}
    </p>
  </div>

  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <TaskForm
      {task}
      {agents}
      isOpen={true}
      {isSubmitting}
      on:submit={({ detail }) => handleSubmit(detail)}
      on:close={handleClose}
    />
  </div>
</div>
