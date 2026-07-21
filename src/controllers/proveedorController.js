const proveedorModel = require('../models/proveedorModel');
const cargoProveedorModel = require('../models/cargoProveedorModel');
const { diasDesdeHoy } = require('../utils/diasCalendario');

async function list(req, res) {
  const proveedores = await proveedorModel.findAll();
  res.json(proveedores);
}

async function getOne(req, res) {
  const proveedor = await proveedorModel.findById(req.params.id);
  if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
  res.json(proveedor);
}

async function create(req, res) {
  const { nombre, servicio, contacto_email, password_suscripcion, monto, periodicidad, fecha_inicio, fecha_proximo_vencimiento, estatus, notas } = req.body;

  if (!nombre || !monto || !periodicidad || !fecha_inicio || !fecha_proximo_vencimiento) {
    return res.status(400).json({
      error: 'nombre, monto, periodicidad, fecha_inicio y fecha_proximo_vencimiento son requeridos',
    });
  }

  const proveedor = await proveedorModel.create({
    nombre,
    servicio,
    contacto_email,
    password_suscripcion,
    monto,
    periodicidad,
    fecha_inicio,
    fecha_proximo_vencimiento,
    estatus,
    notas,
  });
  res.status(201).json(proveedor);
}

async function update(req, res) {
  const existente = await proveedorModel.findById(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Proveedor no encontrado' });

  const body = req.body;
  const proveedor = await proveedorModel.update(req.params.id, {
    nombre: body.nombre ?? existente.nombre,
    servicio: body.servicio ?? existente.servicio,
    contacto_email: body.contacto_email ?? existente.contacto_email,
    password_suscripcion: body.password_suscripcion ?? existente.password_suscripcion,
    monto: body.monto ?? existente.monto,
    periodicidad: body.periodicidad ?? existente.periodicidad,
    fecha_inicio: body.fecha_inicio ?? existente.fecha_inicio,
    fecha_proximo_vencimiento: body.fecha_proximo_vencimiento ?? existente.fecha_proximo_vencimiento,
    estatus: body.estatus ?? existente.estatus,
    notas: body.notas ?? existente.notas,
  });
  res.json(proveedor);
}

async function remove(req, res) {
  const proveedor = await proveedorModel.remove(req.params.id);
  if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
  res.status(204).send();
}

async function saldo(req, res) {
  const proveedor = await proveedorModel.findById(req.params.id);
  if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });

  const cargoPendiente = await cargoProveedorModel.findPendienteActual(proveedor.id);

  if (!cargoPendiente) {
    return res.json({
      proveedor_id: proveedor.id,
      saldo_pendiente: 0,
      cargo_pendiente: null,
      dias_atraso: 0,
      al_corriente: true,
    });
  }

  const totalPagado = await cargoProveedorModel.sumPagosByCargoId(cargoPendiente.id);
  const saldoPendiente = Math.max(Number(cargoPendiente.monto) - totalPagado, 0);

  const diasAtraso = Math.max(-diasDesdeHoy(cargoPendiente.fecha_vencimiento), 0);

  res.json({
    proveedor_id: proveedor.id,
    cargo_pendiente: {
      id: cargoPendiente.id,
      fecha_vencimiento: cargoPendiente.fecha_vencimiento,
      monto: Number(cargoPendiente.monto),
      total_pagado: totalPagado,
      estatus: cargoPendiente.estatus,
    },
    saldo_pendiente: saldoPendiente,
    dias_atraso: diasAtraso,
    al_corriente: diasAtraso === 0 && saldoPendiente === 0,
  });
}

module.exports = { list, getOne, create, update, remove, saldo };
