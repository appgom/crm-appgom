const pool = require('../config/db');

// password_hash nunca debe viajar hacia el frontend del admin (ni de casualidad
// en un SELECT *), asi que las consultas normales lo excluyen explicitamente.
// Las que si lo necesitan (login/reset del portal) tienen su propia funcion.
const COLUMNAS_PUBLICAS = `
  id, nombre, email, telefono, empresa, razon_social, rfc,
  direccion_fiscal, direccion_envio_facturas,
  csf_nombre_original, csf_nombre_archivo,
  portal_habilitado, created_at
`;

async function findAll() {
  const { rows } = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM clientes ORDER BY id`);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM clientes WHERE id = $1`, [id]);
  return rows[0];
}

async function create({ nombre, email, telefono, empresa }) {
  const { rows } = await pool.query(
    `INSERT INTO clientes (nombre, email, telefono, empresa) VALUES ($1, $2, $3, $4) RETURNING ${COLUMNAS_PUBLICAS}`,
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
     RETURNING ${COLUMNAS_PUBLICAS}`,
    [nombre, email, telefono, empresa, razon_social, rfc, direccion_fiscal, direccion_envio_facturas, id]
  );
  return rows[0];
}

async function actualizarCsf(id, { csf_nombre_original, csf_nombre_archivo }) {
  const { rows } = await pool.query(
    `UPDATE clientes SET csf_nombre_original = $1, csf_nombre_archivo = $2 WHERE id = $3 RETURNING ${COLUMNAS_PUBLICAS}`,
    [csf_nombre_original, csf_nombre_archivo, id]
  );
  return rows[0];
}

async function remove(id) {
  const { rows } = await pool.query(`DELETE FROM clientes WHERE id = $1 RETURNING ${COLUMNAS_PUBLICAS}`, [id]);
  return rows[0];
}

// --- Portal de clientes ---
// Estas si necesitan password_hash; se usan solo desde el flujo de
// autenticacion del portal, nunca desde endpoints administrativos.
async function findByEmailParaAuth(email) {
  const { rows } = await pool.query(
    'SELECT id, nombre, email, password_hash, portal_habilitado FROM clientes WHERE email = $1',
    [email.toLowerCase()]
  );
  return rows[0];
}

async function findByIdParaAuth(id) {
  const { rows } = await pool.query(
    'SELECT id, nombre, email, password_hash, portal_habilitado FROM clientes WHERE id = $1',
    [id]
  );
  return rows[0];
}

async function habilitarPortal(id, password_hash) {
  const { rows } = await pool.query(
    `UPDATE clientes SET password_hash = $1, portal_habilitado = true WHERE id = $2 RETURNING ${COLUMNAS_PUBLICAS}`,
    [password_hash, id]
  );
  return rows[0];
}

async function actualizarPassword(id, password_hash) {
  await pool.query('UPDATE clientes SET password_hash = $1 WHERE id = $2', [password_hash, id]);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  actualizarCsf,
  remove,
  findByEmailParaAuth,
  findByIdParaAuth,
  habilitarPortal,
  actualizarPassword,
};
