import { writable, get } from 'svelte/store';
import { goto } from '$app/navigation';
import { auth } from '$lib/stores/auth.store';

export const form = writable({ email: '', password: '' });
export const loading = writable(false);
export const error = writable<string | null>(null);

export async function submit() {
  error.set(null);
  const { email, password } = get(form);

  if (!(email?.includes('@')) || (password?.length ?? 0) < 8) {
    error.set('Verificá el email y que la clave tenga al menos 8 caracteres.');
    return;
  }

  loading.set(true);
  try {
    await auth.login(email.trim(), password);
    await goto('/');
  } catch (e: any) {
    error.set(e?.message ?? 'Error de autenticación');
  } finally {
    loading.set(false);
  }
}
