const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM clientes ORDER BY id');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
  return rows[0];
}

async function create({ nombre, email, telefono, empresa }) {
  const { rows } = await pool.query(
    'INSERT INTO clientes (nombre, email, telefono, empresa) VALUES ($1, $2, $3, $4) RETURNING *',
    [nombre, email, telefono, empresa]
  );
  return rows[0];
}

async function update(id, { nombre, email, telefono, empresa, razon_social, rfc, direccion_fiscal, direccion_envio_facturas }) {
  const { rows } = await pool.query(
    `UPDATE clientes SET
      nombre = $1, email = $2, telefono = $3, empresa = $4,
      razon_social = $5, rfc = $6, direccion_fiscal = $7, direccion_envio_facturas = $8
     WHERE id = $9
     RETURNING *`,
    [nombre, email, telefono, empresa, razon_social, rfc, direccion_fiscal, direccion_envio_facturas, id]
  );
  return rows[0];
}

async function actualizarCsf(id, { csf_nombre_original, csf_nombre_archivo }) {
  const { rows } = await pool.query(
    'UPDATE clientes SET csf_nombre_original = $1, csf_nombre_archivo = $2 WHERE id = $3 RETURNING *',
    [csf_nombre_original, csf_nombre_archivo, id]
  );
  return rows[0];
}

async function remove(id) {
  const { rows } = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
  return rows[0];
}

module.exports = { findAll, findById, create, update, actualizarCsf, remove };
