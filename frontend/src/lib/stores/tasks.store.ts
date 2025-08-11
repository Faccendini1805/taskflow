import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Opcional: cliente central
let http: any = null;
let setAuthToken: (t?: string) => void = () => {};
(async () => {
  try {
    const mod = await import('$lib/utils/fetchClient');
    http = mod.http ?? http;
    setAuthToken = mod.setAuthToken ?? setAuthToken;
  } catch { /* fallback */ }
})();

export type MemberRole = 'OWNER'|'COLLABORATOR';
export type Status = 'PENDIENTE'|'EN_PROCESO'|'EN_ESPERA'|'COMPLETADO'|'CANCELADO';
export type Priority = 'BAJA'|'MEDIA'|'ALTA'|'CRITICA';

export type Agent = { id: number; name: string };
export type Task = {
  id: number;
  expediente: string;
  description: string;
  status: Status;
  priority?: Priority;
  area?: { id: number; name: string } | null;
  dueDate?: string | null;
  members?: { role: MemberRole; agent: Agent }[];
};

type TasksState = {
  items: Task[];
  loading: boolean;
  error: string | null;
  filters: {
    status?: Status;
    areaId?: number;
    priority?: Priority;
    search?: string;
    page?: number;
    pageSize?: number;
  };
};

const initial: TasksState = {
  items: [],
  loading: false,
  error: null,
  filters: { page: 1, pageSize: 50 }
};

function groupByStatus(tasks: Task[]) {
  const acc: Record<Status, Task[]> = {
    PENDIENTE: [], EN_PROCESO: [], EN_ESPERA: [], COMPLETADO: [], CANCELADO: []
  };
  for (const t of tasks) acc[t.status].push(t);
  return acc;
}

function createTasksStore() {
  const { subscribe, update, set } = writable<TasksState>(initial);

  async function list(filters?: Partial<TasksState['filters']>) {
    update(s => ({ ...s, loading: true, error: null, filters: { ...s.filters, ...(filters ?? {}) } }));
    try {
      const params = new URLSearchParams();
      const f = filters ?? {};
      Object.entries({ ...initial.filters, ...f }).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') return;
        params.set(k, String(v));
      });

      let data: Task[];
      if (http) data = await http.get(`/api/tasks?${params.toString()}`);
      else {
        const res = await fetch(`/api/tasks?${params.toString()}`);
        if (!res.ok) throw new Error((await res.json()).error ?? 'Error listando tareas');
        data = await res.json();
      }

      update(s => ({ ...s, items: data, loading: false }));
      return data;
    } catch (err: any) {
      const msg = err?.message ?? 'Error al listar tareas';
      update(s => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }

  async function create(payload: {
    expediente: string; description: string; ownerAgentId: number;
    areaId?: number | null; priority?: Priority; inventoryId?: number | null; tags?: number[];
  }) {
    update(s => ({ ...s, error: null }));
    let created: Task;
    if (http) created = await http.post('/api/tasks', payload);
    else {
      const res = await fetch('/api/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error creando tarea');
      created = await res.json();
    }
    update(s => ({ ...s, items: [created, ...s.items] }));
    return created;
  }

  // Movimiento Kanban con actualización optimista
  async function changeStatus(taskId: number, toStatus: Status, reason?: string) {
    let prev: Task | undefined;
    update(s => {
      const items = s.items.map(t => {
        if (t.id === taskId) { prev = { ...t }; return { ...t, status: toStatus }; }
        return t;
      });
      return { ...s, items };
    });

    try {
      if (http) await http.patch(`/api/tasks/${taskId}/status`, { newStatus: toStatus, reason });
      else {
        const res = await fetch(`/api/tasks/${taskId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newStatus: toStatus, reason })
        });
        if (!res.ok) throw new Error((await res.json()).error ?? 'Error cambiando estado');
      }
    } catch (err) {
      // rollback
      if (prev) update(s => ({ ...s, items: s.items.map(t => (t.id === taskId ? prev! : t)) }));
      throw err;
    }
  }

  async function updateBasics(id: number, data: Partial<Pick<Task, 'description'|'priority'|'area'|'dueDate'>>) {
    let updated: Task;
    if (http) updated = await http.patch(`/api/tasks/${id}`, data);
    else {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error actualizando tarea');
      updated = await res.json();
    }
    update(s => ({ ...s, items: s.items.map(t => (t.id === id ? updated : t)) }));
    return updated;
  }

  async function addMember(id: number, payload: { agentId: number; role: MemberRole }) {
    let updated: Task;
    if (http) updated = await http.patch(`/api/tasks/${id}/members`, payload);
    else {
      const res = await fetch(`/api/tasks/${id}/members`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error agregando miembro');
      updated = await res.json();
    }
    update(s => ({ ...s, items: s.items.map(t => (t.id === id ? updated : t)) }));
    return updated;
  }

  async function removeMember(id: number, agentId: number) {
    let updated: Task;
    if (http) updated = await http.del(`/api/tasks/${id}/members/${agentId}`);
    else {
      const res = await fetch(`/api/tasks/${id}/members/${agentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error removiendo miembro');
      updated = await res.json();
    }
    update(s => ({ ...s, items: s.items.map(t => (t.id === id ? updated : t)) }));
    return updated;
  }

  return { subscribe, list, create, changeStatus, updateBasics, addMember, removeMember, set };
}

export const tasks = createTasksStore();
export const tasksByStatus = derived(tasks, ($t) => groupByStatus($t.items));
