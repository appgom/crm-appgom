const express = require('express');
const facturaController = require('../controllers/facturaController');
const asyncHandler = require('../utils/asyncHandler');
const { uploadFactura } = require('../config/upload');

const router = express.Router();

router.get('/contrato/:contratoId', asyncHandler(facturaController.listarPorContrato));
router.post('/contrato/:contratoId', uploadFactura.single('archivo'), asyncHandler(facturaController.subir));
router.delete('/:id', asyncHandler(facturaController.eliminar));
router.get('/:id/descarga', asyncHandler(facturaController.descargar));

module.exports = router;
