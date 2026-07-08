const fs = require('fs');
const path = require('path');
const clienteModel = require('../models/clienteModel');
const { CSF_DIR } = require('../config/upload');

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
  const { nombre, email, telefono } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ error: 'nombre y email son requeridos' });
  }
  const cliente = await clienteModel.create({ nombre, email, telefono });
  res.status(201).json(cliente);
}

async function update(req, res) {
  const existente = await clienteModel.findById(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Cliente no encontrado' });

  const { nombre, email, telefono, razon_social, rfc, direccion_fiscal, direccion_envio_facturas } = req.body;
  const cliente = await clienteModel.update(req.params.id, {
    nombre: nombre ?? existente.nombre,
    email: email ?? existente.email,
    telefono: telefono ?? existente.telefono,
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

module.exports = { list, getOne, create, update, remove, subirCsf, descargarCsf };
