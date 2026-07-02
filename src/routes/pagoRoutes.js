const express = require('express');
const pagoController = require('../controllers/pagoController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/', asyncHandler(pagoController.create));

module.exports = router;
