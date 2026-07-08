const express = require('express');
const pagoController = require('../controllers/pagoController');
const asyncHandler = require('../utils/asyncHandler');
const { uploadComprobante } = require('../config/upload');

const router = express.Router();

router.post('/', uploadComprobante.single('comprobante'), asyncHandler(pagoController.create));
router.get('/:id/comprobante', asyncHandler(pagoController.descargarComprobante));

module.exports = router;
