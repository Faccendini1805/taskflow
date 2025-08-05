const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'TaskFlow API is running' });
});

// API Routes - Agents
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// API Routes - Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assignedTo: true,
        collaborator: true,
        inventory: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { expediente, description, agentId, collabId, inventoryCode, status } = req.body;

    // Check if expediente already exists
    const existingTask = await prisma.task.findUnique({
      where: { expediente }
    });

    if (existingTask) {
      return res.status(400).json({ error: 'El número de expediente ya existe' });
    }

    // Create inventory if provided
    let inventoryId = null;
    if (inventoryCode) {
      const inventory = await prisma.inventory.upsert({
        where: { code: inventoryCode },
        update: {},
        create: { code: inventoryCode, type: 'General' }
      });
      inventoryId = inventory.id;
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        expediente,
        description,
        agentId: agentId ? Number(agentId) : null,
        collabId: collabId ? Number(collabId) : null,
        inventoryId,
        status: status || 'PENDIENTE'
      },
      include: {
        assignedTo: true,
        collaborator: true,
        inventory: true
      }
    });

    // Create initial log entry
    await prisma.log.create({
      data: {
        message: `Tarea creada con estado: ${task.status}`,
        taskId: task.id,
        agentId: task.agentId
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, agentId, collabId, description } = req.body;

    const oldTask = await prisma.task.findUnique({
      where: { id: Number(id) },
      include: { assignedTo: true, collaborator: true }
    });

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        status,
        agentId: agentId ? Number(agentId) : null,
        collabId: collabId ? Number(collabId) : null,
        description
      },
      include: {
        assignedTo: true,
        collaborator: true,
        inventory: true
      }
    });

    // Create log entry for changes
    const changes = [];
    if (oldTask.status !== status) {
      changes.push(`Estado cambiado de ${oldTask.status} a ${status}`);
    }
    if (oldTask.agentId !== agentId) {
      const oldAgent = oldTask.assignedTo?.name || 'Sin asignar';
      const newAgent = updatedTask.assignedTo?.name || 'Sin asignar';
      changes.push(`Agente cambiado de ${oldAgent} a ${newAgent}`);
    }
    if (oldTask.collabId !== collabId) {
      const oldCollab = oldTask.collaborator?.name || 'Sin colaborador';
      const newCollab = updatedTask.collaborator?.name || 'Sin colaborador';
      changes.push(`Colaborador cambiado de ${oldCollab} a ${newCollab}`);
    }

    if (changes.length > 0) {
      await prisma.log.create({
        data: {
          message: changes.join(', '),
          taskId: Number(id),
          agentId: agentId ? Number(agentId) : null
        }
      });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Check if expediente exists
app.get('/api/tasks/check/:expediente', async (req, res) => {
  try {
    const { expediente } = req.params;
    const task = await prisma.task.findUnique({
      where: { expediente }
    });
    res.json({ exists: !!task });
  } catch (error) {
    console.error('Error checking expediente:', error);
    res.status(500).json({ error: 'Failed to check expediente' });
  }
});

// API Routes - Logs
app.get('/api/logs/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const logs = await prisma.log.findMany({
      where: { taskId: Number(taskId) },
      include: { agent: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const { taskId, message, agentId } = req.body;
    const log = await prisma.log.create({
      data: {
        message,
        taskId: Number(taskId),
        agentId: agentId ? Number(agentId) : null
      },
      include: { agent: true }
    });
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`TaskFlow API server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
}); 