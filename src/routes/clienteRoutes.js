const express = require('express');
const clienteController = require('../controllers/clienteController');
const pagoController = require('../controllers/pagoController');
const asyncHandler = require('../utils/asyncHandler');
const { uploadCsf } = require('../config/upload');

const router = express.Router();

router.get('/', asyncHandler(clienteController.list));
router.get('/:id', asyncHandler(clienteController.getOne));
router.post('/', asyncHandler(clienteController.create));
router.put('/:id', asyncHandler(clienteController.update));
router.delete('/:id', asyncHandler(clienteController.remove));

router.post('/:id/csf', uploadCsf.single('csf'), asyncHandler(clienteController.subirCsf));
router.get('/:id/csf', asyncHandler(clienteController.descargarCsf));

router.get('/:id/pagos', asyncHandler(pagoController.listByCliente));
router.get('/:id/cargos-pendientes', asyncHandler(clienteController.cargosPendientes));

module.exports = router;
