const request = require('supertest');
const { app, mocks } = require('../../test/app');

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Task Routes', () => {
  describe('POST /api/tasks', () => {
    it('should create a new task with valid data', async () => {
      const newTask = {
        expediente: 'EXP-002',
        description: 'New test task',
        status: 'PENDIENTE',
        agentId: 1,
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.expediente).toBe('EXP-002');
      expect(response.body.status).toBe('PENDIENTE');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidTask = {
        // Missing required expediente
        description: 'Missing expediente',
        status: 'PENDIENTE'
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update an existing task', async () => {
      const taskId = '123';
      const updateData = {
        expediente: 'EXP-001-UPDATED',
        description: 'Updated description',
        status: 'EN_PROGRESO',
      };
      
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body.expediente).toBe('EXP-001-UPDATED');
      expect(response.body.status).toBe('EN_PROGRESO');
    });
  });

  describe('GET /api/tasks/check/:expediente', () => {
    it('should return true for available expediente', async () => {
      const expediente = 'AVAILABLE-001';
      
      const response = await request(app)
        .get(`/api/tasks/check/${expediente}`)
        .expect(200);

      expect(response.body).toEqual({ available: true });
    });

    it('should return false for taken expediente', async () => {
      const expediente = 'TAKEN-001';
      
      const response = await request(app)
        .get(`/api/tasks/check/${expediente}`)
        .expect(200);

      expect(response.body).toEqual({ available: false });
    });
  });
});
