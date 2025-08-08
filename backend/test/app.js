const express = require('express');
const app = express();

// Mock the validators for testing
const mockTaskValidationRules = jest.fn().mockImplementation(() => []);
const mockValidate = (req, res, next) => next();

// Middleware
app.use(express.json());

// Test routes
app.get('/test/validation', mockTaskValidationRules(), mockValidate, (req, res) => {
  res.json({ success: true });
});

// Mock task routes
app.post('/api/tasks', mockTaskValidationRules(), mockValidate, (req, res) => {
  res.status(201).json({ id: 1, ...req.body });
});

app.put('/api/tasks/:id', mockTaskValidationRules(), mockValidate, (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

app.get('/api/tasks/check/:expediente', (req, res) => {
  res.json({ available: req.params.expediente !== 'TAKEN-001' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
});

// Export mocks for testing
module.exports = {
  app,
  mocks: {
    taskValidationRules: mockTaskValidationRules,
    validate: mockValidate
  }
};
