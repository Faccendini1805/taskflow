// @ts-nocheck
import type { PageLoad } from './$types';

export const load = async ({ fetch, params }: Parameters<PageLoad>[0]) => {
  const id = Number(params.id);
  const res = await fetch(`/api/tasks/${id}`);
  if (!res.ok) return { task: null };

  const task = await res.json();
  return { task };
};
