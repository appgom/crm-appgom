const catalogoServicioModel = require('../models/catalogoServicioModel');

async function list(req, res) {
  const servicios = await catalogoServicioModel.findAll();
  res.json(servicios);
}

async function create(req, res) {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });
  const servicio = await catalogoServicioModel.create({ nombre });
  res.status(201).json(servicio);
}

async function update(req, res) {
  const existente = await catalogoServicioModel.findById(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Servicio no encontrado' });

  const { nombre, activo } = req.body;
  const servicio = await catalogoServicioModel.update(req.params.id, {
    nombre: nombre ?? existente.nombre,
    activo: activo ?? existente.activo,
  });
  res.json(servicio);
}

module.exports = { list, create, update };
