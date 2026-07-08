const cargoModel = require('../models/cargoModel');
const notificacionLogModel = require('../models/notificacionLogModel');
const { enviarCorreo } = require('../config/mailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

function inicioDelDiaUTC(fecha) {
  const d = new Date(fecha);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function diasHasta(fecha) {
  const ms = inicioDelDiaUTC(fecha) - inicioDelDiaUTC(new Date());
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function determinarMomento(dias) {
  if (dias === 7) return '7_dias_antes';
  if (dias === 0) return 'vencimiento';
  if (dias === -1) return 'vencido';
  return null;
}

const ASUNTOS = {
  '7_dias_antes': (cargo) => `Recordatorio: tu pago de ${cargo.tipo_servicio} vence en 7 días`,
  vencimiento: (cargo) => `Tu pago de ${cargo.tipo_servicio} vence hoy`,
  vencido: (cargo) => `Pago vencido: ${cargo.tipo_servicio}`,
};

function cuerpoCliente(cargo, momento) {
  const monto = Number(cargo.monto).toFixed(2);
  const fecha = new Date(cargo.fecha_vencimiento).toLocaleDateString('es-MX');
  const mensajes = {
    '7_dias_antes': `Te recordamos que el pago de <strong>${cargo.tipo_servicio}</strong> por <strong>$${monto}</strong> vence el ${fecha}.`,
    vencimiento: `El pago de <strong>${cargo.tipo_servicio}</strong> por <strong>$${monto}</strong> vence hoy (${fecha}).`,
    vencido: `El pago de <strong>${cargo.tipo_servicio}</strong> por <strong>$${monto}</strong> venció el ${fecha}. Por favor regulariza tu cuenta.`,
  };
  return `<p>Hola ${cargo.cliente_nombre},</p><p>${mensajes[momento]}</p>`;
}

function cuerpoAdmin(cargo, momento) {
  const monto = Number(cargo.monto).toFixed(2);
  const fecha = new Date(cargo.fecha_vencimiento).toLocaleDateString('es-MX');
  const mensajes = {
    '7_dias_antes': `El contrato de ${cargo.tipo_servicio} de ${cargo.cliente_nombre} vence en 7 días (${fecha}), monto $${monto}.`,
    vencimiento: `El contrato de ${cargo.tipo_servicio} de ${cargo.cliente_nombre} vence hoy (${fecha}), monto $${monto}.`,
    vencido: `El contrato de ${cargo.tipo_servicio} de ${cargo.cliente_nombre} está vencido desde ${fecha}, monto $${monto}.`,
  };
  return `<p>${mensajes[momento]}</p>`;
}

async function enviarSiCorresponde(cargo) {
  const dias = diasHasta(cargo.fecha_vencimiento);
  const momento = determinarMomento(dias);
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
      subject: ASUNTOS[momento](cargo),
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
      subject: `[Admin] ${ASUNTOS[momento](cargo)}`,
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
