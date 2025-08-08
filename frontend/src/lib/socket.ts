import { io, type Socket } from 'socket.io-client';
import type { Task } from './types';

type SocketEvent = 'task:created' | 'task:updated' | 'task:deleted';
type TaskEventMap = {
  'task:created': (task: Task) => void;
  'task:updated': (task: Task) => void;
  'task:deleted': (data: { id: number }) => void;
};

class SocketService {
  private socket: Socket | null = null;
  private callbacks: Record<SocketEvent, Set<(...args: any[]) => void>> = {
    'task:created': new Set(),
    'task:updated': new Set(),
    'task:deleted': new Set(),
  };

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up event listeners
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    // Forward events to registered callbacks
    (Object.keys(this.callbacks) as SocketEvent[]).forEach((event) => {
      this.socket?.on(event, (data: any) => {
        this.callbacks[event]?.forEach((callback) => callback(data));
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<K extends SocketEvent>(
    event: K,
    callback: TaskEventMap[K]
  ): () => void {
    if (!this.callbacks[event]) {
      this.callbacks[event as SocketEvent] = new Set();
    }
    this.callbacks[event]?.add(callback);
    return () => this.off(event, callback);
  }

  off<K extends SocketEvent>(event: K, callback: TaskEventMap[K]): void {
    this.callbacks[event]?.delete(callback as any);
  }
}

export const socketService = new SocketService();
