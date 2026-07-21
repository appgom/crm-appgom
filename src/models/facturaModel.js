const pool = require('../config/db');

async function create({ contrato_id, nombre_original, nombre_archivo, monto, fecha_emision, subido_por }) {
  const { rows } = await pool.query(
    `INSERT INTO facturas (contrato_id, nombre_original, nombre_archivo, monto, fecha_emision, subido_por)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [contrato_id, nombre_original, nombre_archivo, monto || null, fecha_emision || null, subido_por || null]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM facturas WHERE id = $1', [id]);
  return rows[0];
}

async function findByContratoId(contratoId) {
  const { rows } = await pool.query(
    'SELECT * FROM facturas WHERE contrato_id = $1 ORDER BY created_at DESC',
    [contratoId]
  );
  return rows;
}

// Para el portal de clientes: agrega el nombre del servicio y el numero de
// contrato, ya que el portal no tiene acceso al catalogo administrativo.
async function findByClienteId(clienteId) {
  const { rows } = await pool.query(
    `SELECT f.*, c.numero_contrato, cs.nombre AS tipo_servicio
     FROM facturas f
     JOIN contratos c ON c.id = f.contrato_id
     JOIN catalogo_servicios cs ON cs.id = c.tipo_servicio_id
     WHERE c.cliente_id = $1
     ORDER BY f.created_at DESC`,
    [clienteId]
  );
  return rows;
}

async function remove(id) {
  const { rows } = await pool.query('DELETE FROM facturas WHERE id = $1 RETURNING *', [id]);
  return rows[0];
}

module.exports = { create, findById, findByContratoId, findByClienteId, remove };
