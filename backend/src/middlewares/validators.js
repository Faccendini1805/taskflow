const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Validation rules for authentication
exports.loginValidationRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
    
  body('password')
    .notEmpty().withMessage('Contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
];

// Validation rules for tasks
exports.taskValidationRules = [
  body('expediente')
    .trim()
    .notEmpty().withMessage('Expediente requerido')
    .isLength({ min: 3, max: 50 })
    .custom(async (value, { req }) => {
      if (req.method === 'PUT' && !value) return true;
      
      const task = await prisma.task.findUnique({ where: { expediente: value } });
      if (req.method === 'PUT' && task && task.id === parseInt(req.params.id)) return true;
      if (task) throw new Error('Expediente ya existe');
      return true;
    }),
    
  body('status')
    .optional()
    .isIn(['PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO'])
    .withMessage('Estado inválido'),
    
  body('agentId')
    .optional()
    .isInt()
    .custom(async value => {
      if (!value) return true;
      const agent = await prisma.agent.findUnique({ where: { id: value } });
      if (!agent) throw new Error('Agente no encontrado');
      return true;
    })
];

// Validation middleware
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  
  const extractedErrors = errors.array().map(err => ({
    field: err.param,
    message: err.msg
  }));
  
  return res.status(422).json({ errors: extractedErrors });
};

// Error handler for authentication
exports.authErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación',
      errors: err.details
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expirado. Por favor inicia sesión nuevamente.'
    });
  }
  
  next(err);
};

// Global error handler
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: [err.message]
    });
  }
  
  res.status(500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
};
