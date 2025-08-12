import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  const id = Number(params.id);
  const res = await fetch(`/api/tasks/${id}`);
  if (!res.ok) return { task: null };

  const task = await res.json();
  return { task };
};
