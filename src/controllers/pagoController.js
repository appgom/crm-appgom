const pagoModel = require('../models/pagoModel');
const contratoModel = require('../models/contratoModel');

async function listByContrato(req, res) {
  const pagos = await pagoModel.findByContratoId(req.params.contratoId);
  res.json(pagos);
}

async function create(req, res) {
  const { contrato_id, fecha, monto, metodo, referencia } = req.body;

  if (!contrato_id || !fecha || !monto || !metodo) {
    return res.status(400).json({ error: 'contrato_id, fecha, monto y metodo son requeridos' });
  }

  const contrato = await contratoModel.findById(contrato_id);
  if (!contrato) return res.status(404).json({ error: 'Contrato no encontrado' });

  const pago = await pagoModel.create({ contrato_id, fecha, monto, metodo, referencia });
  res.status(201).json(pago);
}

module.exports = { listByContrato, create };
