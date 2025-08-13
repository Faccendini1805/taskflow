import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Redirect to login if not authenticated
  if (!locals.user) {
    throw redirect(307, '/login');
  }
  
  // The actual data fetching will happen in the component's onMount
  return {};
};
