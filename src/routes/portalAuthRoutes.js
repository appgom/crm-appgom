const express = require('express');
const rateLimit = require('express-rate-limit');
const portalAuthController = require('../controllers/portalAuthController');
const requirePortalAuth = require('../middleware/requirePortalAuth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos.' },
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.' },
});

router.post('/login', loginLimiter, asyncHandler(portalAuthController.login));
router.post('/logout', asyncHandler(portalAuthController.logout));
router.get('/me', requirePortalAuth, asyncHandler(portalAuthController.me));
router.post('/solicitar-reset', resetLimiter, asyncHandler(portalAuthController.solicitarReset));
router.post('/restablecer', resetLimiter, asyncHandler(portalAuthController.restablecerPassword));

module.exports = router;
