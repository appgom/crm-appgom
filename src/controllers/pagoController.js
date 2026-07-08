const path = require('path');
const pagoModel = require('../models/pagoModel');
const contratoModel = require('../models/contratoModel');
const { COMPROBANTES_DIR } = require('../config/upload');

async function listByContrato(req, res) {
  const pagos = await pagoModel.findByContratoId(req.params.contratoId);
  res.json(pagos);
}

async function listByCliente(req, res) {
  const pagos = await pagoModel.findByClienteId(req.params.id);
  res.json(pagos);
}

async function create(req, res) {
  const { fecha, metodo, referencia } = req.body;
  let aplicaciones;

  try {
    aplicaciones = typeof req.body.aplicaciones === 'string' ? JSON.parse(req.body.aplicaciones) : req.body.aplicaciones;
  } catch {
    return res.status(400).json({ error: 'aplicaciones debe ser un JSON válido' });
  }

  if (!fecha || !metodo || !Array.isArray(aplicaciones) || aplicaciones.length === 0) {
    return res.status(400).json({ error: 'fecha, metodo y al menos una aplicación (contrato_id/cargo_id, monto) son requeridos' });
  }

  for (const aplicacion of aplicaciones) {
    if (!aplicacion.contrato_id || !aplicacion.monto || Number(aplicacion.monto) <= 0) {
      return res.status(400).json({ error: 'Cada aplicación requiere contrato_id y monto mayor a 0' });
    }
    const contrato = await contratoModel.findById(aplicacion.contrato_id);
    if (!contrato) return res.status(404).json({ error: `Contrato ${aplicacion.contrato_id} no encontrado` });
  }

  const pago = await pagoModel.create({
    fecha,
    metodo,
    referencia,
    comprobante_nombre_original: req.file?.originalname,
    comprobante_nombre_archivo: req.file?.filename,
    aplicaciones,
  });
  res.status(201).json(pago);
}

async function descargarComprobante(req, res) {
  const pago = await pagoModel.findById(req.params.id);
  if (!pago || !pago.comprobante_nombre_archivo) {
    return res.status(404).json({ error: 'Este pago no tiene comprobante adjunto' });
  }
  res.download(path.join(COMPROBANTES_DIR, pago.comprobante_nombre_archivo), pago.comprobante_nombre_original);
}

module.exports = { listByContrato, listByCliente, create, descargarComprobante };
