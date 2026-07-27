const plantillaModel = require('../models/plantillaModel');

// Metadatos por situacion: etiqueta legible, para donde se usa, y que
// variables {{...}} puede usar el admin al redactar el texto. Compartido
// entre el backend (para saber que sustituir) y el endpoint que alimenta el
// modulo de Configuracion > Plantillas en el frontend.
const METADATA_TIPOS = {
  recordatorio_cliente: {
    etiqueta: 'Recordatorio de pago al cliente',
    descripcion: 'Se envía al cliente antes de que venza un cargo, el día que vence, y cuando ya venció.',
    variables: ['cliente_nombre', 'tipo_servicio', 'monto', 'fecha', 'situacion_texto'],
  },
  alerta_admin_vencimiento: {
    etiqueta: 'Alerta interna de vencimiento',
    descripcion: 'Aviso al correo del negocio con el mismo calendario que el recordatorio al cliente.',
    variables: ['cliente_nombre', 'tipo_servicio', 'monto', 'fecha', 'situacion_texto'],
  },
  portal_acceso: {
    etiqueta: 'Acceso al portal habilitado',
    descripcion: 'Se envía cuando el admin habilita o reenvía el acceso al portal de un cliente.',
    variables: ['cliente_nombre', 'cliente_email', 'portal_url', 'password_temporal'],
  },
  portal_reset: {
    etiqueta: 'Restablecer contraseña del portal',
    descripcion: 'Se envía cuando el cliente solicita recuperar su contraseña del portal.',
    variables: ['cliente_nombre', 'reset_url'],
  },
  bienvenida_cliente: {
    etiqueta: 'Bienvenida a nuevo cliente',
    descripcion: 'Se envía al dar de alta un cliente nuevo en el sistema.',
    variables: ['cliente_nombre', 'empresa'],
  },
  pago_confirmado: {
    etiqueta: 'Pago confirmado',
    descripcion: 'Se envía al cliente cuando el admin confirma un pago o aprueba un reporte de pago del portal.',
    variables: ['cliente_nombre', 'tipo_servicio', 'monto', 'fecha'],
  },
  reporte_pago_rechazado: {
    etiqueta: 'Reporte de pago rechazado',
    descripcion: 'Se envía al cliente cuando el admin rechaza un comprobante subido desde el portal.',
    variables: ['cliente_nombre', 'tipo_servicio', 'monto', 'motivo'],
  },
  factura_subida: {
    etiqueta: 'Factura subida',
    descripcion: 'Se envía al cliente cuando se sube una factura nueva a uno de sus contratos.',
    variables: ['cliente_nombre', 'tipo_servicio', 'numero_contrato'],
  },
  alerta_admin_pago_stripe: {
    etiqueta: 'Alerta interna de pago con tarjeta (Stripe)',
    descripcion: 'Pendiente: se activará cuando se conecte la integración con Stripe.',
    variables: ['cliente_nombre', 'tipo_servicio', 'monto', 'fecha'],
  },
};

function sustituir(texto, variables) {
  if (!texto) return texto;
  return texto.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, clave) => {
    const valor = variables[clave];
    return valor === undefined || valor === null ? '' : String(valor);
  });
}

// Devuelve {asunto, cuerpo} con las variables sustituidas, o null si la
// plantilla no existe o está desactivada (en ese caso no se debe enviar).
async function renderPlantilla(tipo, canal, variables) {
  const plantilla = await plantillaModel.findByTipoYCanal(tipo, canal);
  if (!plantilla || !plantilla.activo) return null;
  return {
    asunto: sustituir(plantilla.asunto, variables),
    cuerpo: sustituir(plantilla.cuerpo, variables),
  };
}

module.exports = { METADATA_TIPOS, renderPlantilla };
