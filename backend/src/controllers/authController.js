const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const config = require('../config/env');

// Función para generar token JWT
const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      id: userId,
      role: role
    }, 
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Middleware para validar el cuerpo de la solicitud de login
const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Por favor proporcione correo electrónico y contraseña',
      code: 'MISSING_CREDENTIALS'
    });
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'El formato del correo electrónico no es válido',
      code: 'INVALID_EMAIL_FORMAT'
    });
  }
  
  next();
};

// Controlador para el login
exports.login = [
  validateLoginInput,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      logger.debugInfo('Intento de inicio de sesión', { email: email });

      // 1. Verificar si el usuario existe
      const user = await prisma.user.findUnique({
        where: { email },
        include: { agent: true }
      });

      if (!user) {
        logger.warn('Intento de inicio de sesión fallido: usuario no encontrado', { email });
        return res.status(401).json({
          status: 'error',
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // 2. Verificar la contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.warn('Intento de inicio de sesión fallido: contraseña incorrecta', { userId: user.id });
        return res.status(401).json({
          status: 'error',
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // 3. Verificar si la cuenta está activa
      if (!user.isActive) {
        logger.warn('Intento de inicio de sesión fallido: cuenta inactiva', { userId: user.id });
        return res.status(403).json({
          status: 'error',
          message: 'Esta cuenta está desactivada',
          code: 'ACCOUNT_DISABLED'
        });
      }

      // 4. Generar token JWT
      const token = generateToken(user.id, user.role);
      
      // 5. Registrar inicio de sesión exitoso (sin información sensible)
      logger.info('Inicio de sesión exitoso', { 
        userId: user.id, 
        role: user.role,
        agentId: user.agent?.id || null
      });

      // 6. Enviar respuesta exitosa
      res.status(200).json({
        status: 'success',
        token,
        expiresIn: config.jwt.expiresIn,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            agent: user.agent,
            // No exponer información sensible
            password: undefined
          }
        }
      });

    } catch (error) {
      logger.logError('Error en el proceso de inicio de sesión', error, {
        email: req.body.email,
        ip: req.ip
      });
      
      res.status(500).json({
        status: 'error',
        message: 'Ocurrió un error al intentar iniciar sesión',
        code: 'LOGIN_ERROR',
        // Solo mostrar detalles del error en desarrollo
        ...(config.env === 'development' && { error: error.message })
      });
    }
  }
];

// Token blacklist para manejar logout (en producción, usa Redis o similar)
const tokenBlacklist = new Set();

// Tiempo de expiración para los tokens en la blacklist (1 día)
const BLACKLIST_EXPIRATION = 24 * 60 * 60 * 1000;

// Función para limpiar tokens expirados de la blacklist
setInterval(() => {
  const now = Date.now();
  tokenBlacklist.forEach((expiresAt, token) => {
    if (expiresAt <= now) {
      tokenBlacklist.delete(token);
    }
  });}, 3600000); // Ejecutar cada hora

// Middleware para verificar si un token está en la blacklist
const checkBlacklist = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token && tokenBlacklist.has(token)) {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido o sesión cerrada',
      code: 'INVALID_TOKEN'
    });
  }
  
  next();
};

// Controlador para cerrar sesión
exports.logout = [
  checkBlacklist,
  async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (token) {
        // Agregar token a la blacklist con tiempo de expiración
        tokenBlacklist.add(token);
        
        // Programar eliminación del token después de su expiración
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
          const expiresIn = decoded.exp * 1000 - Date.now();
          if (expiresIn > 0) {
            setTimeout(() => {
              tokenBlacklist.delete(token);
            }, expiresIn);
          }
        } else {
          // Si no se puede decodificar el token, eliminarlo después de 1 día
          setTimeout(() => {
            tokenBlacklist.delete(token);
          }, BLACKLIST_EXPIRATION);
        }
        
        logger.info('Sesión cerrada exitosamente', { 
          userId: req.user?.id,
          tokenExpiresAt: decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : 'unknown'
        });
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Sesión cerrada correctamente'
      });
      
    } catch (error) {
      logger.logError('Error al cerrar sesión', error, {
        userId: req.user?.id,
        ip: req.ip
      });
      
      res.status(500).json({
        status: 'error',
        message: 'Ocurrió un error al cerrar la sesión',
        code: 'LOGOUT_ERROR'
      });
    }
  }
];

// Middleware para verificar el token JWT
exports.authenticate = [
  checkBlacklist,
  async (req, res, next) => {
    try {
      // Obtener el token del header
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
      
      if (!token) {
        return res.status(401).json({
          status: 'error',
          message: 'No estás autenticado. Por favor inicia sesión para acceder.',
          code: 'NO_AUTH_TOKEN'
        });
      }
      
      // Verificar token
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, config.jwt.secret, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        });
      });
      
      // Verificar si el usuario aún existe
      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          agent: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      if (!currentUser) {
        return res.status(401).json({
          status: 'error',
          message: 'El usuario ya no existe.',
          code: 'USER_NOT_FOUND'
        });
      }
      
      if (!currentUser.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'Esta cuenta ha sido desactivada.',
          code: 'ACCOUNT_DISABLED'
        });
      }
      
      // Añadir usuario al request
      req.user = currentUser;
      
      // Continuar
      next();
      
    } catch (error) {
      logger.logError('Error de autenticación', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token inválido. Por favor inicia sesión nuevamente.',
          code: 'INVALID_TOKEN'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: 'Error al autenticar el token',
        code: 'AUTH_ERROR'
      });
    }
  }
];

// Middleware para restringir rutas por roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warn('Intento de acceso no autorizado', {
        userId: req.user.id,
        requiredRoles: roles,
        userRole: req.user.role,
        path: req.originalUrl
      });
      
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para realizar esta acción',
        code: 'FORBIDDEN'
      });
    }
    
    next();
  };
};
