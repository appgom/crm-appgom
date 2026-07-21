const { verificarToken, COOKIE_NAME } = require('../services/portalAuthService');

function requirePortalAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  try {
    const payload = verificarToken(token);
    req.cliente = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
}

module.exports = requirePortalAuth;
