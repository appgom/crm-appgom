const express = require('express');
const portalController = require('../controllers/portalController');
const asyncHandler = require('../utils/asyncHandler');
const { uploadReportePago } = require('../config/upload');

const router = express.Router();

router.get('/contratos', asyncHandler(portalController.misContratos));
router.get('/contratos/:id', asyncHandler(portalController.contratoDetalle));
router.get('/contratos/:id/saldo', asyncHandler(portalController.contratoSaldo));
router.get('/pagos', asyncHandler(portalController.misPagos));
router.get('/reportes-pago', asyncHandler(portalController.misReportesPago));
router.post('/reportes-pago', uploadReportePago.single('comprobante'), asyncHandler(portalController.reportarPago));
router.get('/facturas', asyncHandler(portalController.misFacturas));
router.get('/facturas/:id/descarga', asyncHandler(portalController.descargarFactura));

module.exports = router;
