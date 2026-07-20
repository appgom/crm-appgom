const cargoModel = require('../models/cargoModel');

async function list(req, res) {
  const cargos = await cargoModel.findPendientesConDetalle();
  const hoy = new Date();
  const msPorDia = 1000 * 60 * 60 * 24;

  const resultado = cargos.map((c) => {
    const totalPagado = Number(c.total_pagado);
    const saldoPendiente = Math.max(Number(c.monto) - totalPagado, 0);
    const diasAtraso = Math.max(Math.floor((hoy - new Date(c.fecha_vencimiento)) / msPorDia), 0);

    return {
      cargo_id: c.cargo_id,
      contrato_id: c.contrato_id,
      numero_contrato: c.numero_contrato,
      estatus_contrato: c.estatus_contrato,
      modalidad_facturacion: c.modalidad_facturacion,
      periodicidad: c.periodicidad,
      tipo_servicio: c.tipo_servicio,
      cliente_id: c.cliente_id,
      cliente_nombre: c.cliente_nombre,
      cliente_empresa: c.cliente_empresa,
      cliente_email: c.cliente_email,
      fecha_vencimiento: c.fecha_vencimiento,
      monto: Number(c.monto),
      total_pagado: totalPagado,
      saldo_pendiente: saldoPendiente,
      dias_atraso: diasAtraso,
      vencido: diasAtraso > 0,
    };
  });

  res.json(resultado);
}

module.exports = { list };
