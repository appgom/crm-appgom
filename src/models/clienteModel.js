const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM clientes ORDER BY id');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
  return rows[0];
}

async function create({ nombre, email, telefono }) {
  const { rows } = await pool.query(
    'INSERT INTO clientes (nombre, email, telefono) VALUES ($1, $2, $3) RETURNING *',
    [nombre, email, telefono]
  );
  return rows[0];
}

async function update(id, { nombre, email, telefono }) {
  const { rows } = await pool.query(
    'UPDATE clientes SET nombre = $1, email = $2, telefono = $3 WHERE id = $4 RETURNING *',
    [nombre, email, telefono, id]
  );
  return rows[0];
}

async function remove(id) {
  const { rows } = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
  return rows[0];
}

module.exports = { findAll, findById, create, update, remove };
