const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { validate } = require('../middlewares/validators');
const { 
  createUserValidation, 
  updateProfileValidation, 
  updateUserValidation 
} = require('../middlewares/validators/userValidators');
const { ROLES } = require('../utils/roles');
const logger = require('../utils/logger');

const router = express.Router();

// Middleware para verificar autenticación y adjuntar usuario a la solicitud
router.use(authController.authenticate);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener perfil del usuario actual
 *     description: Devuelve la información del perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/me', userController.getMe);

/**
 * @swagger
 * /api/users/update-me:
 *   patch:
 *     tags: [Usuarios]
 *     summary: Actualizar perfil del usuario actual
 *     description: Actualiza la información del perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfile'
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/update-me', updateProfileValidation, validate, userController.updateMe);

// Rutas de administrador - requieren rol ADMIN
router.use(authController.restrictTo(ROLES.ADMIN));

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener todos los usuarios (Admin)
 *     description: Devuelve una lista de todos los usuarios (solo para administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para la paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 *   post:
 *     tags: [Usuarios]
 *     summary: Crear un nuevo usuario (Admin)
 *     description: Crea un nuevo usuario en el sistema (solo para administradores)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router
  .route('/')
  .get(userController.getAllUsers)
  .post(createUserValidation, validate, userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener un usuario por ID (Admin)
 *     description: Devuelve la información de un usuario específico (solo para administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 *   patch:
 *     tags: [Usuarios]
 *     summary: Actualizar un usuario (Admin)
 *     description: Actualiza la información de un usuario específico (solo para administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 *   delete:
 *     tags: [Usuarios]
 *     summary: Eliminar un usuario (Admin)
 *     description: Elimina un usuario del sistema (solo para administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       204:
 *         description: Usuario eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router
  .route('/:id')
  .get(userController.getUser)
  .patch(updateUserValidation, validate, userController.updateUser)
  .delete(userController.deleteUser);

// Manejador de errores para rutas no encontradas
router.use((req, res, next) => {
  logger.warn(`Ruta no encontrada: ${req.originalUrl}`, {
    method: req.method,
    ip: req.ip,
    user: req.user?.id || 'No autenticado'
  });
  
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
    code: 'NOT_FOUND'
  });
});

// Manejador global de errores
router.use((err, req, res, next) => {
  logger.logError('Error en ruta de usuarios', err, {
    path: req.path,
    method: req.method,
    user: req.user?.id || 'No autenticado',
    body: req.body
  });
  
  // Si los encabezados ya se enviaron, delegar al manejador de errores por defecto de Express
  if (res.headersSent) {
    return next(err);
  }
  
  // En producción, no exponer detalles del error
  const errorResponse = {
    status: 'error',
    message: 'Algo salió mal en el servidor',
    code: 'SERVER_ERROR'
  };
  
  // En desarrollo, incluir detalles del error
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = err.message;
    errorResponse.stack = err.stack;
  }
  
  res.status(500).json(errorResponse);
});

module.exports = router;
