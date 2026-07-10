const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const requireAdmin = require('../middleware/requireAdmin');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAdmin);

router.get('/', asyncHandler(usuarioController.list));
router.post('/', asyncHandler(usuarioController.create));
router.put('/:id', asyncHandler(usuarioController.update));
router.delete('/:id', asyncHandler(usuarioController.remove));
router.post('/:id/reset-password', asyncHandler(usuarioController.resetPassword));

module.exports = router;
