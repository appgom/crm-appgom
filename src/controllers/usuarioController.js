const crypto = require('crypto');
const usuarioModel = require('../models/usuarioModel');
const { hashPassword } = require('../services/authService');

function generarPasswordSegura() {
  return crypto.randomBytes(9).toString('base64url');
}

async function list(req, res) {
  const usuarios = await usuarioModel.findAll();
  res.json(usuarios);
}

async function create(req, res) {
  const { nombre, email, rol } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ error: 'nombre y email son requeridos' });
  }
  if (rol && !['admin', 'cuentas'].includes(rol)) {
    return res.status(400).json({ error: 'rol debe ser "admin" o "cuentas"' });
  }

  const existente = await usuarioModel.findByEmail(email);
  if (existente) {
    return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
  }

  const passwordTemporal = generarPasswordSegura();
  const password_hash = await hashPassword(passwordTemporal);
  const usuario = await usuarioModel.create({ nombre, email, password_hash, rol });
  res.status(201).json({ ...usuario, passwordTemporal });
}

async function update(req, res) {
  const existente = await usuarioModel.findById(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Usuario no encontrado' });

  const { nombre, rol } = req.body;
  if (rol && !['admin', 'cuentas'].includes(rol)) {
    return res.status(400).json({ error: 'rol debe ser "admin" o "cuentas"' });
  }

  if (existente.rol === 'admin' && rol === 'cuentas') {
    const otrosAdmins = await usuarioModel.countAdmins(existente.id);
    if (otrosAdmins === 0) {
      return res.status(409).json({ error: 'No puedes quitar el rol de administrador al único administrador del sistema' });
    }
  }

  const usuario = await usuarioModel.update(req.params.id, {
    nombre: nombre ?? existente.nombre,
    rol: rol ?? existente.rol,
  });
  res.json(usuario);
}

async function remove(req, res) {
  const existente = await usuarioModel.findById(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Usuario no encontrado' });

  if (Number(req.params.id) === req.usuario.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
  }

  if (existente.rol === 'admin') {
    const otrosAdmins = await usuarioModel.countAdmins(existente.id);
    if (otrosAdmins === 0) {
      return res.status(409).json({ error: 'No puedes eliminar al único administrador del sistema' });
    }
  }

  await usuarioModel.remove(req.params.id);
  res.status(204).send();
}

async function resetPassword(req, res) {
  const existente = await usuarioModel.findById(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Usuario no encontrado' });

  const passwordTemporal = generarPasswordSegura();
  const password_hash = await hashPassword(passwordTemporal);
  await usuarioModel.updatePassword(existente.id, password_hash);
  res.json({ passwordTemporal });
}

module.exports = { list, create, update, remove, resetPassword };
