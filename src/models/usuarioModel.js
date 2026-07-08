const pool = require('../config/db');

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email.toLowerCase()]);
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query('SELECT id, nombre, email, created_at FROM usuarios WHERE id = $1', [id]);
  return rows[0];
}

async function create({ nombre, email, password_hash }) {
  const { rows } = await pool.query(
    'INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id, nombre, email, created_at',
    [nombre, email.toLowerCase(), password_hash]
  );
  return rows[0];
}

async function updatePassword(id, password_hash) {
  await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [password_hash, id]);
}

module.exports = { findByEmail, findById, create, updatePassword };
