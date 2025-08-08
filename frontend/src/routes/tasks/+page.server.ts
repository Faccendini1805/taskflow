import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, url }) => {
  const taskId = url.searchParams.get('id');
  let task = null;
  
  // If we have an ID, fetch the task details
  if (taskId) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw error(404, 'Tarea no encontrada');
        }
        throw new Error('Error al cargar la tarea');
      }
      
      task = await response.json();
    } catch (err) {
      console.error('Error loading task:', err);
      throw error(500, 'Error al cargar la tarea');
    }
  }

  // Fetch agents for the assignee dropdown
  let agents = [];
  try {
    const response = await fetch('/api/agents');
    if (response.ok) {
      agents = await response.json();
    }
  } catch (err) {
    console.error('Error loading agents:', err);
  }

  return {
    task,
    agents
  };
};
