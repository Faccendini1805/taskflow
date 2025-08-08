import { Server } from 'socket.io';

class WebSocketService {
  constructor() {
    this.io = null;
    this.clients = new Set();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log('New client connected');
      this.clients.add(socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected');
        this.clients.delete(socket.id);
      });
    });

    return this.io;
  }

  broadcastTaskUpdated(task) {
    if (this.io) {
      this.io.emit('task:updated', task);
    }
  }

  broadcastTaskCreated(task) {
    if (this.io) {
      this.io.emit('task:created', task);
    }
  }

  broadcastTaskDeleted(taskId) {
    if (this.io) {
      this.io.emit('task:deleted', { id: taskId });
    }
  }
}

export default new WebSocketService();
