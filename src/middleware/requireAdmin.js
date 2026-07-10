function requireAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ error: 'Esta acción requiere permisos de administrador' });
  }
  next();
}

module.exports = requireAdmin;
