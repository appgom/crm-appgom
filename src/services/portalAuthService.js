const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Secreto propio y separado del de administradores: un JWT de portal nunca
// debe poder validarse como sesion de admin ni viceversa, ni siquiera si
// alguno de los dos secretos llegara a filtrarse.
const PORTAL_JWT_SECRET = process.env.PORTAL_JWT_SECRET;
const JWT_EXPIRES_IN = '12h';
const SALT_ROUNDS = 12;

if (!PORTAL_JWT_SECRET) {
  throw new Error('PORTAL_JWT_SECRET no esta configurado. Define esta variable en .env antes de arrancar el servidor.');
}

// Hash "señuelo" con el mismo costo que un hash real: al comparar contra este
// cuando el correo no existe, bcrypt.compare tarda lo mismo que si existiera,
// evitando que el tiempo de respuesta delate si un correo esta registrado.
const HASH_SENUELO = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), SALT_ROUNDS);

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash || HASH_SENUELO);
}

function firmarToken(cliente) {
  return jwt.sign({ sub: cliente.id, email: cliente.email, tipo: 'portal' }, PORTAL_JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function verificarToken(token) {
  const payload = jwt.verify(token, PORTAL_JWT_SECRET);
  if (payload.tipo !== 'portal') throw new Error('Token no es de portal');
  return payload;
}

const COOKIE_NAME = 'crm_portal_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 12 * 60 * 60 * 1000,
  path: '/',
};

// Tokens de restablecimiento de contraseña: aleatorios, se envian al cliente
// por correo, pero solo se guarda su hash (sha256 basta, ya son 32 bytes de
// entropia real, no una contraseña que alguien pueda adivinar).
function generarResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generarPasswordTemporal() {
  return crypto.randomBytes(12).toString('base64url');
}

module.exports = {
  hashPassword,
  verifyPassword,
  firmarToken,
  verificarToken,
  COOKIE_NAME,
  COOKIE_OPTIONS,
  generarResetToken,
  hashResetToken,
  generarPasswordTemporal,
};
