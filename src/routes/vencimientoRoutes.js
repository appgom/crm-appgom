const express = require('express');
const vencimientoController = require('../controllers/vencimientoController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(vencimientoController.list));

module.exports = router;
