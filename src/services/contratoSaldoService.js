const cargoModel = require('../models/cargoModel');
const { diasDesdeHoy } = require('../utils/diasCalendario');

// Compartido entre el CRM (admin) y el portal de clientes, para que ambos
// calculen saldo/atraso exactamente igual.
async function calcularSaldo(contrato) {
  const cargoPendiente = await cargoModel.findPendienteActual(contrato.id);

  if (!cargoPendiente) {
    return {
      contrato_id: contrato.id,
      saldo_pendiente: 0,
      cargo_pendiente: null,
      dias_atraso: 0,
      al_corriente: true,
    };
  }

  const totalPagado = await cargoModel.sumPagosByCargoId(cargoPendiente.id);
  const saldoPendiente = Math.max(Number(cargoPendiente.monto) - totalPagado, 0);
  const diasAtraso = Math.max(-diasDesdeHoy(cargoPendiente.fecha_vencimiento), 0);

  return {
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
  };
}

module.exports = { calcularSaldo };
