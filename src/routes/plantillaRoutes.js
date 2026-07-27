const express = require('express');
const plantillaController = require('../controllers/plantillaController');
const requireAdmin = require('../middleware/requireAdmin');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAdmin);

router.get('/', asyncHandler(plantillaController.list));
router.put('/:tipo/:canal', asyncHandler(plantillaController.actualizar));

module.exports = router;
