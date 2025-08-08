const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, restrictTo } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validators');
const { 
  createUserValidation, 
  updateProfileValidation, 
  updateUserValidation 
} = require('../middlewares/validators/userValidators');
const { ROLES } = require('../utils/roles');

const router = express.Router();

// Protect all routes after this middleware
router.use(authenticate);

// Routes for the currently authenticated user
router.get('/me', userController.getMe);
router.patch('/update-me', updateProfileValidation, validate, userController.updateMe);

// Admin routes - require ADMIN role
router.use(restrictTo(ROLES.ADMIN));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(createUserValidation, validate, userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(updateUserValidation, validate, userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
