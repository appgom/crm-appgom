const express = require('express');
const contratoController = require('../controllers/contratoController');
const pagoController = require('../controllers/pagoController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(contratoController.list));
router.get('/:id', asyncHandler(contratoController.getOne));
router.post('/', asyncHandler(contratoController.create));
router.put('/:id', asyncHandler(contratoController.update));
router.delete('/:id', asyncHandler(contratoController.remove));

router.get('/:id/saldo', asyncHandler(contratoController.saldo));
router.get('/:contratoId/pagos', asyncHandler(pagoController.listByContrato));

module.exports = router;
