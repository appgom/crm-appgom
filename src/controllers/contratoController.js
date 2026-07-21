const contratoModel = require('../models/contratoModel');
const cargoModel = require('../models/cargoModel');

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
    tipo_servicio_id,
    descripcion,
    notas_internas,
    monto,
    periodicidad,
    fecha_inicio,
    fecha_proximo_vencimiento,
    dias_gracia_pago,
    estatus,
    modalidad_facturacion,
  } = req.body;

  if (!cliente_id || !tipo_servicio_id || !monto || !periodicidad || !fecha_inicio || !fecha_proximo_vencimiento) {
    return res.status(400).json({
      error: 'cliente_id, tipo_servicio_id, monto, periodicidad, fecha_inicio y fecha_proximo_vencimiento son requeridos',
    });
  }

  const contrato = await contratoModel.create({
    cliente_id,
    tipo_servicio_id,
    descripcion,
    notas_internas,
    monto,
    periodicidad,
    fecha_inicio,
    fecha_proximo_vencimiento,
    dias_gracia_pago,
    estatus,
    modalidad_facturacion,
  });
  res.status(201).json(contrato);
}

async function update(req, res) {
  const existente = await contratoModel.findById(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Contrato no encontrado' });

  const body = req.body;
  const contrato = await contratoModel.update(req.params.id, {
    tipo_servicio_id: body.tipo_servicio_id ?? existente.tipo_servicio_id,
    descripcion: body.descripcion ?? existente.descripcion,
    notas_internas: body.notas_internas ?? existente.notas_internas,
    monto: body.monto ?? existente.monto,
    periodicidad: body.periodicidad ?? existente.periodicidad,
    fecha_inicio: body.fecha_inicio ?? existente.fecha_inicio,
    fecha_proximo_vencimiento: body.fecha_proximo_vencimiento ?? existente.fecha_proximo_vencimiento,
    dias_gracia_pago: body.dias_gracia_pago ?? existente.dias_gracia_pago,
    estatus: body.estatus ?? existente.estatus,
    modalidad_facturacion: body.modalidad_facturacion ?? existente.modalidad_facturacion,
  });

  // Si se corrigio manualmente la fecha/monto del contrato, el cargo pendiente
  // (generado con los valores anteriores) debe reflejar los valores nuevos,
  // para que el saldo y los dias de atraso no queden desincronizados.
  const cargoPendiente = await cargoModel.findPendienteActual(contrato.id);
  if (cargoPendiente) {
    // El monto puede subir/bajar de precio a mitad de un contrato recurrente.
    // aplicar_monto_desde deja elegir explicitamente si el cambio afecta el
    // cobro que ya esta en curso o solo empieza a regir el proximo periodo;
    // si no se especifica, se conserva el comportamiento previo (solo se
    // toca el cargo si aun no tiene ningun pago aplicado).
    let aplicarMontoAhora;
    if (body.aplicar_monto_desde === 'actual') {
      aplicarMontoAhora = true;
    } else if (body.aplicar_monto_desde === 'proximo') {
      aplicarMontoAhora = false;
    } else {
      aplicarMontoAhora = cargoPendiente.estatus === 'pendiente';
    }

    await cargoModel.actualizarPendiente(cargoPendiente.id, {
      fecha_vencimiento: contrato.fecha_proximo_vencimiento,
      monto: aplicarMontoAhora ? contrato.monto : cargoPendiente.monto,
    });
  }

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

  const cargoPendiente = await cargoModel.findPendienteActual(contrato.id);

  if (!cargoPendiente) {
    return res.json({
      contrato_id: contrato.id,
      saldo_pendiente: 0,
      cargo_pendiente: null,
      dias_atraso: 0,
      al_corriente: true,
    });
  }

  const totalPagado = await cargoModel.sumPagosByCargoId(cargoPendiente.id);
  const saldoPendiente = Math.max(Number(cargoPendiente.monto) - totalPagado, 0);

  const hoy = new Date();
  const vencimiento = new Date(cargoPendiente.fecha_vencimiento);
  const msPorDia = 1000 * 60 * 60 * 24;
  const diasAtraso = Math.max(Math.floor((hoy - vencimiento) / msPorDia), 0);

  res.json({
    contrato_id: contrato.id,
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

async function cargos(req, res) {
  const contrato = await contratoModel.findById(req.params.id);
  if (!contrato) return res.status(404).json({ error: 'Contrato no encontrado' });
  const lista = await cargoModel.findByContratoId(contrato.id);
  res.json(lista);
}

module.exports = { list, getOne, create, update, remove, saldo, cargos };
