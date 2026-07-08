const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos.' },
});

router.post('/login', loginLimiter, asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', requireAuth, asyncHandler(authController.me));
router.post('/change-password', requireAuth, asyncHandler(authController.cambiarPassword));

module.exports = router;
