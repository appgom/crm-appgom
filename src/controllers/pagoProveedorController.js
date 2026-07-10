const path = require('path');
const pagoProveedorModel = require('../models/pagoProveedorModel');
const cargoProveedorModel = require('../models/cargoProveedorModel');
const proveedorModel = require('../models/proveedorModel');
const { COMPROBANTES_PROVEEDOR_DIR } = require('../config/upload');

async function listByProveedor(req, res) {
  const pagos = await pagoProveedorModel.findByProveedorId(req.params.id);
  res.json(pagos);
}

async function create(req, res) {
  const { cargo_proveedor_id, fecha, monto, metodo, referencia } = req.body;

  if (!cargo_proveedor_id || !fecha || !monto || !metodo || Number(monto) <= 0) {
    return res.status(400).json({ error: 'cargo_proveedor_id, fecha, monto y metodo son requeridos, y monto debe ser mayor a 0' });
  }

  const proveedor = await proveedorModel.findById(req.params.id);
  if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });

  const cargo = await cargoProveedorModel.findById(cargo_proveedor_id);
  if (!cargo || cargo.proveedor_id !== Number(req.params.id)) {
    return res.status(400).json({ error: 'El cargo indicado no pertenece a este proveedor' });
  }

  const pago = await pagoProveedorModel.create({
    cargo_proveedor_id,
    fecha,
    monto,
    metodo,
    referencia,
    comprobante_nombre_original: req.file?.originalname,
    comprobante_nombre_archivo: req.file?.filename,
  });
  res.status(201).json(pago);
}

async function descargarComprobante(req, res) {
  const pago = await pagoProveedorModel.findById(req.params.id);
  if (!pago || !pago.comprobante_nombre_archivo) {
    return res.status(404).json({ error: 'Este pago no tiene comprobante adjunto' });
  }
  res.download(path.join(COMPROBANTES_PROVEEDOR_DIR, pago.comprobante_nombre_archivo), pago.comprobante_nombre_original);
}

module.exports = { listByProveedor, create, descargarComprobante };
