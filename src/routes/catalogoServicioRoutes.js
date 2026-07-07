const express = require('express');
const catalogoServicioController = require('../controllers/catalogoServicioController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(catalogoServicioController.list));
router.post('/', asyncHandler(catalogoServicioController.create));
router.put('/:id', asyncHandler(catalogoServicioController.update));

module.exports = router;
