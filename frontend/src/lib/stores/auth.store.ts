// src/lib/stores/auth.store.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { http, setAuthToken } from '$lib/utils/fetchClient';

export type AuthUser = {
  id: number;
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'AGENT' | 'AUDITOR';
  name?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

const initial: AuthState = { user: null, token: null, loading: false, error: null };

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initial);

  // Restaurar sesión del localStorage (solo en browser)
  if (browser) {
    const raw = localStorage.getItem('taskflow_auth');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { user: AuthUser; token: string };
        set({ user: parsed.user, token: parsed.token, loading: false, error: null });
        setAuthToken(parsed.token);
      } catch {
        /* ignore */
      }
    }
  }

  function persist(state: AuthState) {
    if (!browser) return;
    if (state.user && state.token) {
      localStorage.setItem('taskflow_auth', JSON.stringify({ user: state.user, token: state.token }));
    } else {
      localStorage.removeItem('taskflow_auth');
    }
  }

  async function login(email: string, password: string) {
    update((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await http.post<{ user: AuthUser; token: string }>('/api/auth/login', { email, password });
      const { user, token } = data;
      set({ user, token, loading: false, error: null });
      setAuthToken(token);
      persist({ user, token, loading: false, error: null });
      return user;
    } catch (err: any) {
      const msg = err?.message ?? 'Error de autenticación';
      update((s) => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }

  async function register(payload: { email: string; password: string; name?: string; role?: AuthUser['role'] }) {
    update((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await http.post<{ user: AuthUser; token: string }>('/api/auth/register', payload);
      const { user, token } = data;
      set({ user, token, loading: false, error: null });
      setAuthToken(token);
      persist({ user, token, loading: false, error: null });
      return user;
    } catch (err: any) {
      const msg = err?.message ?? 'Error al registrar';
      update((s) => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }

  function logout() {
    const next = { ...initial };
    set(next);
    setAuthToken(undefined);
    persist(next);
  }

  return {
    subscribe,
    login,
    register,
    logout,
    set: (s: Partial<AuthState>) => update((v) => ({ ...v, ...s }))
  };
}

export const auth = createAuthStore();
export const isAuthenticated = derived(auth, ($a) => Boolean($a.token && $a.user));
export const currentUser = derived(auth, ($a) => $a.user);
