const usuarioModel = require('../models/usuarioModel');
const { hashPassword, verifyPassword, firmarToken, COOKIE_NAME, COOKIE_OPTIONS } = require('../services/authService');

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son requeridos' });
  }

  const usuario = await usuarioModel.findByEmail(email);
  const passwordValido = usuario && (await verifyPassword(password, usuario.password_hash));

  if (!passwordValido) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = firmarToken(usuario);
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: undefined });
  res.status(204).send();
}

async function me(req, res) {
  const usuario = await usuarioModel.findById(req.usuario.id);
  if (!usuario) return res.status(401).json({ error: 'No autenticado' });
  res.json(usuario);
}

async function cambiarPassword(req, res) {
  const { passwordActual, passwordNueva } = req.body;
  if (!passwordActual || !passwordNueva || passwordNueva.length < 8) {
    return res.status(400).json({ error: 'passwordActual y passwordNueva (mínimo 8 caracteres) son requeridos' });
  }

  const usuario = await usuarioModel.findByEmail(req.usuario.email);
  const passwordValido = await verifyPassword(passwordActual, usuario.password_hash);
  if (!passwordValido) {
    return res.status(401).json({ error: 'La contraseña actual no es correcta' });
  }

  const nuevoHash = await hashPassword(passwordNueva);
  await usuarioModel.updatePassword(usuario.id, nuevoHash);
  res.status(204).send();
}

module.exports = { login, logout, me, cambiarPassword };
