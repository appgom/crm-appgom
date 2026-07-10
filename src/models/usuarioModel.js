const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY id');
  return rows;
}

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email.toLowerCase()]);
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query('SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = $1', [id]);
  return rows[0];
}

async function create({ nombre, email, password_hash, rol }) {
  const { rows } = await pool.query(
    'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, COALESCE($4, \'cuentas\')::rol_usuario_enum) RETURNING id, nombre, email, rol, created_at',
    [nombre, email.toLowerCase(), password_hash, rol]
  );
  return rows[0];
}

async function update(id, { nombre, rol }) {
  const { rows } = await pool.query(
    'UPDATE usuarios SET nombre = $1, rol = $2 WHERE id = $3 RETURNING id, nombre, email, rol, created_at',
    [nombre, rol, id]
  );
  return rows[0];
}

async function updatePassword(id, password_hash) {
  await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [password_hash, id]);
}

async function countAdmins(excludeId = null) {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS total FROM usuarios WHERE rol = 'admin' AND id != COALESCE($1, -1)",
    [excludeId]
  );
  return rows[0].total;
}

async function remove(id) {
  const { rows } = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre, email, rol', [id]);
  return rows[0];
}

module.exports = { findAll, findByEmail, findById, create, update, updatePassword, countAdmins, remove };
