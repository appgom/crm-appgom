const express = require('express');
const clienteController = require('../controllers/clienteController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(clienteController.list));
router.get('/:id', asyncHandler(clienteController.getOne));
router.post('/', asyncHandler(clienteController.create));
router.put('/:id', asyncHandler(clienteController.update));
router.delete('/:id', asyncHandler(clienteController.remove));

module.exports = router;
