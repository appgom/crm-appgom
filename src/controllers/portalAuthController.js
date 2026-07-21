const clienteModel = require('../models/clienteModel');
const resetTokenModel = require('../models/clienteResetTokenModel');
const {
  hashPassword,
  verifyPassword,
  firmarToken,
  COOKIE_NAME,
  COOKIE_OPTIONS,
  generarResetToken,
  hashResetToken,
} = require('../services/portalAuthService');
const { enviarCorreo } = require('../config/mailer');

const PORTAL_URL = process.env.PORTAL_URL || '';

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son requeridos' });
  }

  const cliente = await clienteModel.findByEmailParaAuth(email);
  // verifyPassword siempre corre bcrypt.compare (contra un hash señuelo si el
  // cliente no existe), para que el tiempo de respuesta no delate si el
  // correo esta registrado.
  const passwordValido = await verifyPassword(password, cliente?.password_hash);

  if (!cliente || !cliente.portal_habilitado || !passwordValido) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = firmarToken(cliente);
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res.json({ id: cliente.id, nombre: cliente.nombre, email: cliente.email });
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: undefined });
  res.status(204).send();
}

async function me(req, res) {
  const cliente = await clienteModel.findById(req.cliente.id);
  if (!cliente) return res.status(401).json({ error: 'No autenticado' });
  res.json({ id: cliente.id, nombre: cliente.nombre, email: cliente.email, empresa: cliente.empresa });
}

async function solicitarReset(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email es requerido' });

  const cliente = await clienteModel.findByEmailParaAuth(email);
  if (cliente && cliente.portal_habilitado) {
    const token = generarResetToken();
    const tokenHash = hashResetToken(token);
    const expiraEn = new Date(Date.now() + 60 * 60 * 1000);
    await resetTokenModel.create({ cliente_id: cliente.id, token_hash: tokenHash, expira_en: expiraEn });

    const url = `${PORTAL_URL}/portal/restablecer?token=${token}`;
    await enviarCorreo({
      to: cliente.email,
      subject: 'Restablece tu contraseña — Portal Appgom',
      html: `<p>Hola ${cliente.nombre},</p><p>Da clic en el siguiente enlace para restablecer tu contraseña (válido por 1 hora):</p><p><a href="${url}">${url}</a></p><p>Si tú no solicitaste esto, ignora este correo.</p>`,
    }).catch(() => {});
  }

  // La misma respuesta exista o no el correo, para no revelar que cuentas estan registradas.
  res.json({ mensaje: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
}

async function restablecerPassword(req, res) {
  const { token, passwordNueva } = req.body;
  if (!token || !passwordNueva || passwordNueva.length < 8) {
    return res.status(400).json({ error: 'token y passwordNueva (mínimo 8 caracteres) son requeridos' });
  }

  const tokenHash = hashResetToken(token);
  const registro = await resetTokenModel.findValidoPorHash(tokenHash);
  if (!registro) return res.status(400).json({ error: 'El enlace es inválido o ya expiró' });

  const nuevoHash = await hashPassword(passwordNueva);
  await clienteModel.actualizarPassword(registro.cliente_id, nuevoHash);
  await resetTokenModel.marcarUsado(registro.id);

  res.status(204).send();
}

module.exports = { login, logout, me, solicitarReset, restablecerPassword };
