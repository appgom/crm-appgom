const clienteModel = require('../models/clienteModel');

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

  const { nombre, email, telefono } = req.body;
  const cliente = await clienteModel.update(req.params.id, {
    nombre: nombre ?? existente.nombre,
    email: email ?? existente.email,
    telefono: telefono ?? existente.telefono,
  });
  res.json(cliente);
}

async function remove(req, res) {
  const cliente = await clienteModel.remove(req.params.id);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove };
