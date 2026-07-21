const express = require('express');
const reportePagoController = require('../controllers/reportePagoController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(reportePagoController.listPendientes));
router.post('/:id/confirmar', asyncHandler(reportePagoController.confirmar));
router.post('/:id/rechazar', asyncHandler(reportePagoController.rechazar));
router.get('/:id/comprobante', asyncHandler(reportePagoController.descargarComprobante));

module.exports = router;
