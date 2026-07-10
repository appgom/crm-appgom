const express = require('express');
const proveedorController = require('../controllers/proveedorController');
const pagoProveedorController = require('../controllers/pagoProveedorController');
const asyncHandler = require('../utils/asyncHandler');
const { uploadComprobanteProveedor } = require('../config/upload');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.get('/', asyncHandler(proveedorController.list));
router.get('/:id', asyncHandler(proveedorController.getOne));
router.post('/', asyncHandler(proveedorController.create));
router.put('/:id', asyncHandler(proveedorController.update));
router.delete('/:id', requireAdmin, asyncHandler(proveedorController.remove));
router.get('/:id/saldo', asyncHandler(proveedorController.saldo));

router.get('/:id/pagos', asyncHandler(pagoProveedorController.listByProveedor));
router.post('/:id/pagos', uploadComprobanteProveedor.single('comprobante'), asyncHandler(pagoProveedorController.create));

module.exports = router;
