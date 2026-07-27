const path = require('path');
const facturaModel = require('../models/facturaModel');
const contratoModel = require('../models/contratoModel');
const clienteModel = require('../models/clienteModel');
const { FACTURAS_DIR } = require('../config/upload');
const { enviarCorreo } = require('../config/mailer');
const { renderPlantilla } = require('../services/plantillaService');

async function listarPorContrato(req, res) {
  const facturas = await facturaModel.findByContratoId(req.params.contratoId);
  res.json(facturas);
}

async function subir(req, res) {
  const contrato = await contratoModel.findByIdConServicio(req.params.contratoId);
  if (!contrato) return res.status(404).json({ error: 'Contrato no encontrado' });
  if (!req.file) return res.status(400).json({ error: 'Debes adjuntar el archivo de la factura' });

  const { monto, fecha_emision } = req.body;
  const factura = await facturaModel.create({
    contrato_id: contrato.id,
    nombre_original: req.file.originalname,
    nombre_archivo: req.file.filename,
    monto: monto || null,
    fecha_emision: fecha_emision || null,
    subido_por: req.usuario.id,
  });

  const cliente = await clienteModel.findById(contrato.cliente_id);
  const plantilla = await renderPlantilla('factura_subida', 'email', {
    cliente_nombre: cliente.nombre,
    tipo_servicio: contrato.tipo_servicio,
    numero_contrato: contrato.numero_contrato,
  });
  if (plantilla) {
    await enviarCorreo({ to: cliente.email, subject: plantilla.asunto, html: plantilla.cuerpo }).catch(() => {});
  }

  res.status(201).json(factura);
}

async function eliminar(req, res) {
  const factura = await facturaModel.remove(req.params.id);
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
  res.json({ mensaje: 'Factura eliminada' });
}

async function descargar(req, res) {
  const factura = await facturaModel.findById(req.params.id);
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
  res.download(path.join(FACTURAS_DIR, factura.nombre_archivo), factura.nombre_original);
}

module.exports = { listarPorContrato, subir, eliminar, descargar };
