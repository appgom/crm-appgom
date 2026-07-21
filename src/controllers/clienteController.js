const fs = require('fs');
const path = require('path');
const clienteModel = require('../models/clienteModel');
const cargoModel = require('../models/cargoModel');
const { CSF_DIR } = require('../config/upload');
const { hashPassword, generarPasswordTemporal } = require('../services/portalAuthService');
const { enviarCorreo } = require('../config/mailer');

const PORTAL_URL = process.env.PORTAL_URL || '';

async function list(req, res) {
  const clientes = await clienteModel.findAll();
  res.json(clientes);
}

async function getOne(req, res) {
  const cliente = await clienteModel.findById(req.params.id);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(cliente);
}

async function create(req, res) {
  const { nombre, email, telefono, empresa } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ error: 'nombre y email son requeridos' });
  }
  const cliente = await clienteModel.create({ nombre, email, telefono, empresa });
  res.status(201).json(cliente);
}

async function update(req, res) {
  const existente = await clienteModel.findById(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Cliente no encontrado' });

  const { nombre, email, telefono, empresa, razon_social, rfc, direccion_fiscal, direccion_envio_facturas } = req.body;
  const cliente = await clienteModel.update(req.params.id, {
    nombre: nombre ?? existente.nombre,
    email: email ?? existente.email,
    telefono: telefono ?? existente.telefono,
    empresa: empresa ?? existente.empresa,
    razon_social: razon_social ?? existente.razon_social,
    rfc: rfc ?? existente.rfc,
    direccion_fiscal: direccion_fiscal ?? existente.direccion_fiscal,
    direccion_envio_facturas: direccion_envio_facturas ?? existente.direccion_envio_facturas,
  });
  res.json(cliente);
}

async function remove(req, res) {
  const cliente = await clienteModel.remove(req.params.id);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.status(204).send();
}

async function subirCsf(req, res) {
  const existente = await clienteModel.findById(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Cliente no encontrado' });
  if (!req.file) return res.status(400).json({ error: 'Archivo CSF requerido' });

  if (existente.csf_nombre_archivo) {
    fs.unlink(path.join(CSF_DIR, existente.csf_nombre_archivo), () => {});
  }

  const cliente = await clienteModel.actualizarCsf(req.params.id, {
    csf_nombre_original: req.file.originalname,
    csf_nombre_archivo: req.file.filename,
  });
  res.json(cliente);
}

async function descargarCsf(req, res) {
  const cliente = await clienteModel.findById(req.params.id);
  if (!cliente || !cliente.csf_nombre_archivo) {
    return res.status(404).json({ error: 'Este cliente no tiene CSF cargada' });
  }
  res.download(path.join(CSF_DIR, cliente.csf_nombre_archivo), cliente.csf_nombre_original);
}

async function cargosPendientes(req, res) {
  const cargos = await cargoModel.findPendientesByClienteId(req.params.id);
  res.json(cargos);
}

async function habilitarPortal(req, res) {
  const cliente = await clienteModel.findById(req.params.id);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

  const passwordTemporal = generarPasswordTemporal();
  const hash = await hashPassword(passwordTemporal);
  await clienteModel.habilitarPortal(cliente.id, hash);

  const url = PORTAL_URL;
  let correoEnviado = true;
  try {
    await enviarCorreo({
      to: cliente.email,
      subject: 'Acceso a tu portal de cliente — Appgom',
      html: `<p>Hola ${cliente.nombre},</p>
        <p>Ya puedes ingresar a tu portal de cliente en <a href="${url}">${url}</a> con estos datos:</p>
        <p>Correo: ${cliente.email}<br/>Contraseña temporal: <strong>${passwordTemporal}</strong></p>
        <p>Te recomendamos cambiarla después de tu primer ingreso.</p>`,
    });
  } catch {
    correoEnviado = false;
  }

  // El acceso ya quedo habilitado en la base aunque el correo falle; si no se
  // pudo enviar, se devuelve la contraseña para que el admin la comparta el mismo.
  res.json({
    mensaje: correoEnviado
      ? 'Acceso al portal habilitado. Se envió la contraseña temporal al correo del cliente.'
      : `Acceso habilitado, pero no se pudo enviar el correo. Comparte tú la contraseña temporal: ${passwordTemporal}`,
  });
}

module.exports = { list, getOne, create, update, remove, subirCsf, descargarCsf, cargosPendientes, habilitarPortal };
