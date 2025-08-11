// src/lib/utils/fetchClient.ts
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

let authToken: string | undefined;
let baseURL = browser ? '' : 'http://localhost:3000'; // Ajusta si usas proxy

export function setAuthToken(token?: string) {
  authToken = token;
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${baseURL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 401 && browser) {
    // Si expira sesión, redirige al login
    localStorage.removeItem('taskflow_auth');
    goto('/login');
    throw new Error('Sesión expirada');
  }

  if (!res.ok) {
    let msg = 'Error en la solicitud';
    try {
      const err = await res.json();
      msg = err.error ?? msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

export const http = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, body?: unknown) => request<T>('POST', url, body),
  patch: <T>(url: string, body?: unknown) => request<T>('PATCH', url, body),
  del: <T>(url: string) => request<T>('DELETE', url)
};
