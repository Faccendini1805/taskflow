const { body } = require('express-validator');
const { ROLES } = require('../../utils/roles');

// Validation rules for user creation
exports.createUserValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Correo electrónico no válido')
    .normalizeEmail(),
    
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula'),
    
  body('role')
    .optional()
    .isIn(Object.values(ROLES)).withMessage(`Rol no válido. Debe ser uno de: ${Object.values(ROLES).join(', ')}`),
    
  body('agentId')
    .optional()
    .isInt().withMessage('ID de agente no válido')
];

// Validation rules for updating user profile
exports.updateProfileValidation = [
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Correo electrónico no válido')
    .normalizeEmail(),
    
  body('currentPassword')
    .if((value, { req }) => req.body.newPassword)
    .notEmpty().withMessage('La contraseña actual es requerida para cambiar la contraseña'),
    
  body('newPassword')
    .if((value, { req }) => req.body.currentPassword)
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
];

// Validation rules for admin updating users
exports.updateUserValidation = [
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Correo electrónico no válido')
    .normalizeEmail(),
    
  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula'),
    
  body('role')
    .optional()
    .isIn(Object.values(ROLES)).withMessage(`Rol no válido. Debe ser uno de: ${Object.values(ROLES).join(', ')}`),
    
  body('agentId')
    .optional()
    .isInt().withMessage('ID de agente no válido'),
    
  body('isActive')
    .optional()
    .isBoolean().withMessage('El estado activo debe ser un valor booleano')
];

// Validation for changing password
exports.changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es requerida'),
    
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
];
