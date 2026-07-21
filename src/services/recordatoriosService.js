const cargoModel = require('../models/cargoModel');
const notificacionLogModel = require('../models/notificacionLogModel');
const { enviarCorreo } = require('../config/mailer');
const { diasDesdeHoy } = require('../utils/diasCalendario');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const diasHasta = diasDesdeHoy;

// Contratos anuales avisan con más anticipación (30/15/7 dias); el resto
// (mensual, trimestral, quincenal, semanal y modalidades de pago unico)
// usa una ventana mas corta (10/5/1 dias), acorde a su ciclo de cobro.
const DIAS_ANTES_POR_PERIODICIDAD = {
  anual: [30, 15, 7],
  default: [10, 5, 1],
};

function determinarMomento(dias, periodicidad) {
  if (dias === 0) return 'vencimiento';
  if (dias === -1) return 'vencido';

  const tiers = DIAS_ANTES_POR_PERIODICIDAD[periodicidad] || DIAS_ANTES_POR_PERIODICIDAD.default;
  if (!tiers.includes(dias)) return null;
  return dias === 1 ? '1_dia_antes' : `${dias}_dias_antes`;
}

function diasDeMomento(momento) {
  if (momento === 'vencimiento') return 0;
  if (momento === 'vencido') return -1;
  const match = momento.match(/^(\d+)_dias?_antes$/);
  return match ? Number(match[1]) : null;
}

function asunto(cargo, momento) {
  if (momento === 'vencimiento') return `Tu pago de ${cargo.tipo_servicio} vence hoy`;
  if (momento === 'vencido') return `Pago vencido: ${cargo.tipo_servicio}`;
  const dias = diasDeMomento(momento);
  return `Recordatorio: tu pago de ${cargo.tipo_servicio} vence en ${dias} día${dias === 1 ? '' : 's'}`;
}

function cuerpoCliente(cargo, momento) {
  const monto = Number(cargo.monto).toFixed(2);
  const fecha = new Date(cargo.fecha_vencimiento).toLocaleDateString('es-MX');
  let mensaje;
  if (momento === 'vencimiento') {
    mensaje = `El pago de <strong>${cargo.tipo_servicio}</strong> por <strong>$${monto}</strong> vence hoy (${fecha}).`;
  } else if (momento === 'vencido') {
    mensaje = `El pago de <strong>${cargo.tipo_servicio}</strong> por <strong>$${monto}</strong> venció el ${fecha}. Por favor regulariza tu cuenta.`;
  } else {
    const dias = diasDeMomento(momento);
    mensaje = `Te recordamos que el pago de <strong>${cargo.tipo_servicio}</strong> por <strong>$${monto}</strong> vence en ${dias} día${dias === 1 ? '' : 's'} (${fecha}).`;
  }
  return `<p>Hola ${cargo.cliente_nombre},</p><p>${mensaje}</p>`;
}

function cuerpoAdmin(cargo, momento) {
  const monto = Number(cargo.monto).toFixed(2);
  const fecha = new Date(cargo.fecha_vencimiento).toLocaleDateString('es-MX');
  let mensaje;
  if (momento === 'vencimiento') {
    mensaje = `El contrato de ${cargo.tipo_servicio} de ${cargo.cliente_nombre} vence hoy (${fecha}), monto $${monto}.`;
  } else if (momento === 'vencido') {
    mensaje = `El contrato de ${cargo.tipo_servicio} de ${cargo.cliente_nombre} está vencido desde ${fecha}, monto $${monto}.`;
  } else {
    const dias = diasDeMomento(momento);
    mensaje = `El contrato de ${cargo.tipo_servicio} de ${cargo.cliente_nombre} vence en ${dias} día${dias === 1 ? '' : 's'} (${fecha}), monto $${monto}.`;
  }
  return `<p>${mensaje}</p>`;
}

async function enviarSiCorresponde(cargo) {
  const dias = diasHasta(cargo.fecha_vencimiento);
  const momento = determinarMomento(dias, cargo.periodicidad);
  if (!momento) return null;

  const resultado = { cargoId: cargo.cargo_id, momento, cliente: false, admin: false };

  const clienteYaEnviado = await notificacionLogModel.yaEnviada({
    cargoId: cargo.cargo_id,
    momento,
    tipo: 'recordatorio_cliente',
  });
  if (!clienteYaEnviado) {
    await enviarCorreo({
      to: cargo.cliente_email,
      subject: asunto(cargo, momento),
      html: cuerpoCliente(cargo, momento),
    });
    await notificacionLogModel.registrar({
      contratoId: cargo.contrato_id,
      cargoId: cargo.cargo_id,
      momento,
      tipo: 'recordatorio_cliente',
      canal: 'email',
      estatusEnvio: 'enviado',
    });
    resultado.cliente = true;
  }

  const adminYaEnviado = await notificacionLogModel.yaEnviada({
    cargoId: cargo.cargo_id,
    momento,
    tipo: 'alerta_admin',
  });
  if (!adminYaEnviado && ADMIN_EMAIL) {
    await enviarCorreo({
      to: ADMIN_EMAIL,
      subject: `[Admin] ${asunto(cargo, momento)}`,
      html: cuerpoAdmin(cargo, momento),
    });
    await notificacionLogModel.registrar({
      contratoId: cargo.contrato_id,
      cargoId: cargo.cargo_id,
      momento,
      tipo: 'alerta_admin',
      canal: 'email',
      estatusEnvio: 'enviado',
    });
    resultado.admin = true;
  }

  return resultado;
}

async function procesarRecordatorios() {
  const cargosPendientes = await cargoModel.findPendientesConDetalle();
  const resultados = [];
  for (const cargo of cargosPendientes) {
    const resultado = await enviarSiCorresponde(cargo);
    if (resultado) resultados.push(resultado);
  }
  return resultados;
}

module.exports = { procesarRecordatorios };
