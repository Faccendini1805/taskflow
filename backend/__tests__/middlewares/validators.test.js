const request = require('supertest');
const { taskValidationRules, validate } = require('../../src/middlewares/validators');
const app = require('../../test/app');
const { validationResult } = require('express-validator');

// Mock express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
  body: jest.fn().mockReturnThis(),
  param: jest.fn().mockReturnThis(),
  query: jest.fn().mockReturnThis(),
  oneOf: jest.fn().mockReturnThis(),
  notEmpty: jest.fn().mockReturnThis(),
  isLength: jest.fn().mockReturnThis(),
  isIn: jest.fn().mockReturnThis(),
  isISO8601: jest.fn().mockReturnThis(),
  isInt: jest.fn().mockReturnThis(),
  optional: jest.fn().mockReturnThis(),
  custom: jest.fn().mockReturnThis(),
  withMessage: jest.fn().mockReturnThis(),
  run: jest.fn().mockReturnThis()
}));

describe('Task Validation Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      method: 'POST',
      route: { path: '/api/tasks' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('taskValidationRules', () => {
    it('should validate required fields', async () => {
      const validations = taskValidationRules();
      expect(validations).toHaveLength(5); // Number of validation chains
    });
  });

  describe('expediente validation', () => {
    it('should reject empty expediente', async () => {
      req.body.expediente = '';
      const validations = taskValidationRules();
      
      // Run all validations
      await Promise.all(validations.map(validation => validation.run(req)));
      
      const errors = validationResult(req);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'El expediente es requerido',
            param: 'expediente',
          })
        ])
      );
    });

    it('should reject expediente that is too short', async () => {
      req.body.expediente = 'AB';
      const validations = taskValidationRules();
      
      await Promise.all(validations.map(validation => validation.run(req)));
      
      const errors = validationResult(req);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'El expediente debe tener entre 3 y 50 caracteres',
            param: 'expediente',
          })
        ])
      );
    });
  });

  describe('status validation', () => {
    it('should accept valid status', async () => {
      req.body.status = 'EN_PROGRESO';
      const validations = taskValidationRules();
      
      await Promise.all(validations.map(validation => validation.run(req)));
      
      const errors = validationResult(req);
      expect(errors.array()).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ param: 'status' })
        ])
      );
    });

    it('should reject invalid status', async () => {
      req.body.status = 'INVALID_STATUS';
      const validations = taskValidationRules();
      
      await Promise.all(validations.map(validation => validation.run(req)));
      
      const errors = validationResult(req);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Estado no válido',
            param: 'status',
          })
        ])
      );
    });
  });

  describe('validate middleware', () => {
    it('should call next() if no validation errors', () => {
      const mockErrors = { isEmpty: () => true };
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();
      
      validate(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 422 with validation errors', () => {
      const mockErrors = {
        isEmpty: () => false,
        array: () => [
          { param: 'expediente', msg: 'Invalid expediente' }
        ]
      };
      
      const mockReq = { method: 'POST', route: { path: '/api/tasks' } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();
      
      // Mock validationResult
      jest.spyOn(require('express-validator'), 'validationResult')
        .mockReturnValue(mockErrors);
      
      validate(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error de validación',
        details: mockErrors.array()
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
