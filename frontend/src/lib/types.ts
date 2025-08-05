export interface Agent {
  id: number;
  name: string;
}

export interface Inventory {
  id: number;
  code: string;
  type: string;
}

export interface Task {
  id: number;
  expediente: string;
  description: string;
  status: 'PENDIENTE' | 'EN_PROCESO' | 'EN_ESPERA' | 'COMPLETADO';
  createdAt: string;
  updatedAt: string;
  assignedTo?: Agent;
  agentId?: number;
  collaborator?: Agent;
  collabId?: number;
  inventory?: Inventory;
  inventoryId?: number;
}

export interface Log {
  id: number;
  message: string;
  createdAt: string;
  taskId: number;
  agent?: Agent;
  agentId?: number;
}

export interface TaskFormData {
  expediente: string;
  description: string;
  agentId?: number;
  collabId?: number;
  inventoryCode?: string;
  status: 'PENDIENTE' | 'EN_PROCESO' | 'EN_ESPERA' | 'COMPLETADO';
} 