const contratoModel = require('../models/contratoModel');
const pagoModel = require('../models/pagoModel');

async function list(req, res) {
  const contratos = await contratoModel.findAll();
  res.json(contratos);
}

async function getOne(req, res) {
  const contrato = await contratoModel.findById(req.params.id);
  if (!contrato) return res.status(404).json({ error: 'Contrato no encontrado' });
  res.json(contrato);
}

async function create(req, res) {
  const {
    cliente_id,
    tipo_servicio,
    descripcion,
    numero_contrato,
    monto,
    periodicidad,
    fecha_inicio,
    fecha_proximo_vencimiento,
    estatus,
  } = req.body;

  if (!cliente_id || !tipo_servicio || !monto || !periodicidad || !fecha_inicio || !fecha_proximo_vencimiento) {
    return res.status(400).json({
      error: 'cliente_id, tipo_servicio, monto, periodicidad, fecha_inicio y fecha_proximo_vencimiento son requeridos',
    });
  }

  const contrato = await contratoModel.create({
    cliente_id,
    tipo_servicio,
    descripcion,
    numero_contrato,
    monto,
    periodicidad,
    fecha_inicio,
    fecha_proximo_vencimiento,
    estatus,
  });
  res.status(201).json(contrato);
}

async function update(req, res) {
  const existente = await contratoModel.findById(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Contrato no encontrado' });

  const body = req.body;
  const contrato = await contratoModel.update(req.params.id, {
    tipo_servicio: body.tipo_servicio ?? existente.tipo_servicio,
    descripcion: body.descripcion ?? existente.descripcion,
    numero_contrato: body.numero_contrato ?? existente.numero_contrato,
    monto: body.monto ?? existente.monto,
    periodicidad: body.periodicidad ?? existente.periodicidad,
    fecha_inicio: body.fecha_inicio ?? existente.fecha_inicio,
    fecha_proximo_vencimiento: body.fecha_proximo_vencimiento ?? existente.fecha_proximo_vencimiento,
    estatus: body.estatus ?? existente.estatus,
  });
  res.json(contrato);
}

async function remove(req, res) {
  const contrato = await contratoModel.remove(req.params.id);
  if (!contrato) return res.status(404).json({ error: 'Contrato no encontrado' });
  res.status(204).send();
}

async function saldo(req, res) {
  const contrato = await contratoModel.findById(req.params.id);
  if (!contrato) return res.status(404).json({ error: 'Contrato no encontrado' });

  const totalPagado = await pagoModel.sumByContratoId(contrato.id);
  const monto = Number(contrato.monto);
  const saldoPendiente = Math.max(monto - totalPagado, 0);

  const hoy = new Date();
  const vencimiento = new Date(contrato.fecha_proximo_vencimiento);
  const msPorDia = 1000 * 60 * 60 * 24;
  const diasAtraso = Math.max(Math.floor((hoy - vencimiento) / msPorDia), 0);

  res.json({
    contrato_id: contrato.id,
    monto,
    total_pagado: totalPagado,
    saldo_pendiente: saldoPendiente,
    fecha_proximo_vencimiento: contrato.fecha_proximo_vencimiento,
    dias_atraso: diasAtraso,
    al_corriente: diasAtraso === 0 && saldoPendiente === 0,
  });
}

module.exports = { list, getOne, create, update, remove, saldo };
