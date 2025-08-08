const express = require('express');
const authController = require('../controllers/authController');
const { loginValidationRules, validate } = require('../middlewares/validators');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// Ruta para login
router.post('/login', loginValidationRules, validate, authController.login);

// Ruta para verificar token (opcional, útil para frontend)
router.get('/verify', authenticate, (req, res) => {
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

module.exports = router;
