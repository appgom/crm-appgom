const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '12h';
const SALT_ROUNDS = 12;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no esta configurado. Define esta variable en .env antes de arrancar el servidor.');
}

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function firmarToken(usuario) {
  return jwt.sign({ sub: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verificarToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

const COOKIE_NAME = 'crm_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 12 * 60 * 60 * 1000,
  path: '/',
};

module.exports = { hashPassword, verifyPassword, firmarToken, verificarToken, COOKIE_NAME, COOKIE_OPTIONS };
