const { verificarToken, COOKIE_NAME } = require('../services/authService');

function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  try {
    const payload = verificarToken(token);
    req.usuario = { id: payload.sub, email: payload.email, rol: payload.rol };
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
}

module.exports = requireAuth;
