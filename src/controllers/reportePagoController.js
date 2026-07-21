const path = require('path');
const reporteModel = require('../models/reportePagoModel');
const pagoModel = require('../models/pagoModel');
const { REPORTES_PAGO_DIR } = require('../config/upload');

async function listPendientes(req, res) {
  const reportes = await reporteModel.findPendientes();
  res.json(reportes);
}

async function confirmar(req, res) {
  const reporte = await reporteModel.findById(req.params.id);
  if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
  if (reporte.estatus !== 'pendiente') {
    return res.status(409).json({ error: 'Este reporte ya fue revisado' });
  }

  const pago = await pagoModel.create({
    fecha: reporte.fecha,
    metodo: 'transferencia',
    referencia: reporte.referencia,
    comprobante_nombre_original: reporte.comprobante_nombre_original,
    comprobante_nombre_archivo: reporte.comprobante_nombre_archivo,
    aplicaciones: [{ contrato_id: reporte.contrato_id, cargo_id: reporte.cargo_id, monto: Number(reporte.monto) }],
  });

  const actualizado = await reporteModel.confirmar(reporte.id, pago.id);
  res.json(actualizado);
}

async function rechazar(req, res) {
  const reporte = await reporteModel.findById(req.params.id);
  if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
  if (reporte.estatus !== 'pendiente') {
    return res.status(409).json({ error: 'Este reporte ya fue revisado' });
  }

  const actualizado = await reporteModel.rechazar(reporte.id, req.body.notas);
  res.json(actualizado);
}

async function descargarComprobante(req, res) {
  const reporte = await reporteModel.findById(req.params.id);
  if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
  res.download(path.join(REPORTES_PAGO_DIR, reporte.comprobante_nombre_archivo), reporte.comprobante_nombre_original);
}

module.exports = { listPendientes, confirmar, rechazar, descargarComprobante };
