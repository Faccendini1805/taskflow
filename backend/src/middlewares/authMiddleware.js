const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { ROLES, checkPermission } = require('../utils/roles');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware para verificar el token JWT
exports.authenticate = async (req, res, next) => {
  try {
    // 1. Obtener el token del encabezado
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No estás autenticado. Por favor inicia sesión.'
      });
    }

    // 2. Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Verificar si el usuario aún existe
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { 
        agent: true,
        // Incluir relaciones adicionales si son necesarias
      }
    });

    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'El usuario ya no existe.'
      });
    }

    // 4. Agregar usuario al request
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido. Por favor inicia sesión nuevamente.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
      });
    }
    
    console.error('Error en autenticación:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al autenticar el usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware para verificar roles específicos
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para realizar esta acción.'
      });
    }
    next();
  };
};

// Middleware para verificar permisos específicos
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    try {
      // Primero verificar autenticación
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'No estás autenticado.'
        });
      }

      // Verificar permisos especiales
      if (permission === 'tasks:update:own') {
        // Permitir si el usuario es dueño del recurso o es admin/supervisor
        if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPERVISOR) {
          return next();
        }
        
        // Para agentes, verificar que sea el dueño de la tarea
        if (req.params.id && req.user.agentId === req.body.agentId) {
          return next();
        }
        
        return res.status(403).json({
          status: 'error',
          message: 'Solo puedes modificar tus propias tareas.'
        });
      }

      // Verificar permisos generales
      const hasAccess = checkPermission(req.user.role, permission);
      
      if (!hasAccess) {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permiso para realizar esta acción.'
        });
      }
      
      next();
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al verificar permisos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

// Middleware para verificar si el usuario es propietario del recurso
exports.isOwner = (model, paramKey = 'id', ownerField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'No estás autenticado.'
        });
      }

      // Los administradores pueden hacer cualquier cosa
      if (req.user.role === ROLES.ADMIN) {
        return next();
      }

      const resource = await prisma[model].findUnique({
        where: { id: req.params[paramKey] },
        select: { [ownerField]: true }
      });

      if (!resource) {
        return res.status(404).json({
          status: 'error',
          message: 'Recurso no encontrado.'
        });
      }

      // Verificar si el usuario es el propietario
      if (resource[ownerField] !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permiso para acceder a este recurso.'
        });
      }

      next();
    } catch (error) {
      console.error('Error al verificar propiedad:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al verificar permisos de propiedad',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};
