const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM catalogo_servicios ORDER BY nombre');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM catalogo_servicios WHERE id = $1', [id]);
  return rows[0];
}

async function create({ nombre }) {
  const { rows } = await pool.query(
    'INSERT INTO catalogo_servicios (nombre) VALUES ($1) RETURNING *',
    [nombre]
  );
  return rows[0];
}

async function update(id, { nombre, activo }) {
  const { rows } = await pool.query(
    'UPDATE catalogo_servicios SET nombre = $1, activo = $2 WHERE id = $3 RETURNING *',
    [nombre, activo, id]
  );
  return rows[0];
}

module.exports = { findAll, findById, create, update };
