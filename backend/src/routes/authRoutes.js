const express = require('express');
const authController = require('../controllers/authController');
const { validate } = require('../middlewares/validators');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const router = express.Router();

// Configuración de rate limiting para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Límite de 10 intentos por ventana
  message: {
    status: 'error',
    message: 'Demasiados intentos de inicio de sesión. Por favor intente nuevamente más tarde.',
    code: 'TOO_MANY_REQUESTS'
  },
  handler: (req, res, next, options) => {
    logger.warn('Límite de tasa excedido para autenticación', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y devuelve un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: contraseña123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiresIn:
 *                   type: string
 *                   example: 7d
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/login', authLimiter, authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Autenticación]
 *     summary: Cerrar sesión
 *     description: Invalida el token JWT actual
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cierre de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Sesión cerrada correctamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/logout', authController.authenticate, authController.logout);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     tags: [Autenticación]
 *     summary: Verificar token
 *     description: Verifica si el token JWT es válido y devuelve información del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/verify', authController.authenticate, (req, res) => {
  // El middleware de autenticación ya verificó el token y adjuntó el usuario a req.user
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        agent: req.user.agent
      }
    }
  });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Autenticación]
 *     summary: Refrescar token
 *     description: Genera un nuevo token JWT válido
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiresIn:
 *                   type: string
 *                   example: 7d
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/refresh', authController.authenticate, (req, res) => {
  try {
    // Generar un nuevo token con los mismos datos del usuario
    const token = authController.generateToken(req.user.id, req.user.role);
    
    logger.info('Token refrescado exitosamente', { userId: req.user.id });
    
    res.status(200).json({
      status: 'success',
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  } catch (error) {
    logger.logError('Error al refrescar el token', error, { userId: req.user?.id });
    
    res.status(500).json({
      status: 'error',
      message: 'Error al refrescar el token',
      code: 'TOKEN_REFRESH_ERROR'
    });
  }
});

module.exports = router;
