const contratoModel = require('../models/contratoModel');
const cargoModel = require('../models/cargoModel');
const pagoModel = require('../models/pagoModel');
const reporteModel = require('../models/reportePagoModel');
const { calcularSaldo } = require('../services/contratoSaldoService');

async function misContratos(req, res) {
  const contratos = await contratoModel.findByClienteIdConServicio(req.cliente.id);
  res.json(contratos);
}

async function contratoDetalle(req, res) {
  const contrato = await contratoModel.findByIdConServicio(req.params.id);
  if (!contrato || contrato.cliente_id !== req.cliente.id) {
    return res.status(404).json({ error: 'Contrato no encontrado' });
  }
  res.json(contrato);
}

async function contratoSaldo(req, res) {
  const contrato = await contratoModel.findById(req.params.id);
  // Nunca confiar en el :id de la URL sin verificar que pertenece al cliente autenticado.
  if (!contrato || contrato.cliente_id !== req.cliente.id) {
    return res.status(404).json({ error: 'Contrato no encontrado' });
  }
  res.json(await calcularSaldo(contrato));
}

async function misPagos(req, res) {
  const pagos = await pagoModel.findByClienteId(req.cliente.id);
  res.json(pagos);
}

async function misReportesPago(req, res) {
  const reportes = await reporteModel.findByClienteId(req.cliente.id);
  res.json(reportes);
}

async function reportarPago(req, res) {
  const { contrato_id, monto, fecha, referencia } = req.body;
  if (!contrato_id || !monto || Number(monto) <= 0 || !fecha) {
    return res.status(400).json({ error: 'contrato_id, monto y fecha son requeridos' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Debes adjuntar el comprobante de pago' });
  }

  const contrato = await contratoModel.findById(contrato_id);
  if (!contrato || contrato.cliente_id !== req.cliente.id) {
    return res.status(404).json({ error: 'Contrato no encontrado' });
  }

  const cargoPendiente = await cargoModel.findPendienteActual(contrato.id);

  const reporte = await reporteModel.create({
    cliente_id: req.cliente.id,
    contrato_id: contrato.id,
    cargo_id: cargoPendiente?.id || null,
    monto: Number(monto),
    fecha,
    referencia,
    comprobante_nombre_original: req.file.originalname,
    comprobante_nombre_archivo: req.file.filename,
  });
  res.status(201).json(reporte);
}

module.exports = { misContratos, contratoDetalle, contratoSaldo, misPagos, misReportesPago, reportarPago };
