import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Si tenés un cliente central: $lib/utils/fetchClient.ts
// exporta setAuthToken(token?: string) y http.{get,post,patch,del}
// Ajustá estos imports a tu implementación real:
let setAuthToken: (t?: string) => void = () => {};
let http: any = null;
(async () => {
  try {
    const mod = await import('$lib/utils/fetchClient');
    setAuthToken = mod.setAuthToken ?? setAuthToken;
    http = mod.http ?? http;
  } catch { /* fallback a fetch nativo */ }
})();

export type AuthUser = { id: number; email: string; role: 'ADMIN'|'SUPERVISOR'|'AGENT'|'AUDITOR'; name?: string };
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
        setAuthToken?.(parsed.token);
      } catch { /* ignore */ }
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
    update(s => ({ ...s, loading: true, error: null }));
    try {
      let data: any;
      if (http) {
        data = await http.post('/api/auth/login', { email, password });
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error((await res.json()).error ?? 'Login failed');
        data = await res.json();
      }
      const { user, token } = data;
      set({ user, token, loading: false, error: null });
      setAuthToken?.(token);
      persist({ user, token, loading: false, error: null });
      return user;
    } catch (err: any) {
      const msg = err?.message ?? 'Error de autenticación';
      update(s => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }

  async function register(payload: { email: string; password: string; name?: string; role?: AuthUser['role'] }) {
    update(s => ({ ...s, loading: true, error: null }));
    try {
      let data: any;
      if (http) data = await http.post('/api/auth/register', payload);
      else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error((await res.json()).error ?? 'Register failed');
        data = await res.json();
      }
      const { user, token } = data;
      set({ user, token, loading: false, error: null });
      setAuthToken?.(token);
      persist({ user, token, loading: false, error: null });
      return user;
    } catch (err: any) {
      const msg = err?.message ?? 'Error al registrar';
      update(s => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }

  function logout() {
    const next = { ...initial };
    set(next);
    setAuthToken?.(undefined);
    persist(next);
  }

  return {
    subscribe,
    login,
    register,
    logout,
    set: (s: Partial<AuthState>) => update(v => ({ ...v, ...s }))
  };
}

export const auth = createAuthStore();
export const isAuthenticated = derived(auth, ($a) => Boolean($a.token && $a.user));
export const currentUser = derived(auth, ($a) => $a.user);
