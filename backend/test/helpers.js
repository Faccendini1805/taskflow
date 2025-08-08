const { PrismaClient } = require('@prisma/client');

// Mock data for tests
const mockTasks = [
  {
    id: 1,
    expediente: 'EXP-001',
    description: 'Test task 1',
    status: 'PENDIENTE',
    agentId: 1,
    createdAt: new Date(),
    updatedAt: new(),
  },
  // Add more mock tasks as needed
];

const mockAgents = [
  {
    id: 1,
    name: 'Test Agent',
    email: 'agent@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Add more mock agents as needed
];

// Reset all mocks before each test
const resetMocks = (prisma) => {
  // Reset all mocks
  Object.values(prisma).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === 'function') {
          method.mockReset();
        }
      });
    }
  });

  // Setup default mock implementations
  prisma.task.findMany.mockResolvedValue([...mockTasks]);
  prisma.task.findUnique.mockImplementation(({ where }) => {
    return Promise.resolve(mockTasks.find(task => task.id === where.id));
  });
  prisma.task.create.mockImplementation(({ data }) => {
    const newTask = {
      id: mockTasks.length + 1,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockTasks.push(newTask);
    return Promise.resolve(newTask);
  });
  
  // Add more default mock implementations as needed
};

module.exports = {
  mockTasks,
  mockAgents,
  resetMocks,
};
