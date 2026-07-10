const express = require('express');
const pagoProveedorController = require('../controllers/pagoProveedorController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/:id/comprobante', asyncHandler(pagoProveedorController.descargarComprobante));

module.exports = router;
