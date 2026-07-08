const pool = require('../config/db');
const pagoModel = require('../models/pagoModel');
const contratoModel = require('../models/contratoModel');

async function listByContrato(req, res) {
  const pagos = await pagoModel.findByContratoId(req.params.contratoId);
  res.json(pagos);
}

async function listByCliente(req, res) {
  const pagos = await pagoModel.findByClienteId(req.params.id);
  res.json(pagos);
}

async function create(req, res) {
  const { fecha, monto, metodo, referencia } = req.body;
  let { contrato_id, cargo_id } = req.body;

  if (!fecha || !monto || !metodo || (!contrato_id && !cargo_id)) {
    return res.status(400).json({
      error: 'fecha, monto, metodo y (contrato_id o cargo_id) son requeridos',
    });
  }

  if (cargo_id && !contrato_id) {
    const { rows } = await pool.query('SELECT contrato_id FROM cargos WHERE id = $1', [cargo_id]);
    if (!rows[0]) return res.status(404).json({ error: 'Cargo no encontrado' });
    contrato_id = rows[0].contrato_id;
  }

  const contrato = await contratoModel.findById(contrato_id);
  if (!contrato) return res.status(404).json({ error: 'Contrato no encontrado' });

  const pago = await pagoModel.create({ contrato_id, cargo_id: cargo_id || null, fecha, monto, metodo, referencia });
  res.status(201).json(pago);
}

module.exports = { listByContrato, listByCliente, create };
