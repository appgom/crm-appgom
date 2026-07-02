const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM contratos ORDER BY id');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM contratos WHERE id = $1', [id]);
  return rows[0];
}

async function findByClienteId(clienteId) {
  const { rows } = await pool.query('SELECT * FROM contratos WHERE cliente_id = $1 ORDER BY id', [clienteId]);
  return rows;
}

async function create({
  cliente_id,
  tipo_servicio,
  descripcion,
  numero_contrato,
  monto,
  periodicidad,
  fecha_inicio,
  fecha_proximo_vencimiento,
  estatus,
}) {
  const { rows } = await pool.query(
    `INSERT INTO contratos
      (cliente_id, tipo_servicio, descripcion, numero_contrato, monto, periodicidad, fecha_inicio, fecha_proximo_vencimiento, estatus)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'activo')::estatus_contrato_enum)
     RETURNING *`,
    [
      cliente_id,
      tipo_servicio,
      descripcion,
      numero_contrato,
      monto,
      periodicidad,
      fecha_inicio,
      fecha_proximo_vencimiento,
      estatus,
    ]
  );
  return rows[0];
}

async function update(id, {
  tipo_servicio,
  descripcion,
  numero_contrato,
  monto,
  periodicidad,
  fecha_inicio,
  fecha_proximo_vencimiento,
  estatus,
}) {
  const { rows } = await pool.query(
    `UPDATE contratos SET
      tipo_servicio = $1,
      descripcion = $2,
      numero_contrato = $3,
      monto = $4,
      periodicidad = $5,
      fecha_inicio = $6,
      fecha_proximo_vencimiento = $7,
      estatus = $8
     WHERE id = $9
     RETURNING *`,
    [tipo_servicio, descripcion, numero_contrato, monto, periodicidad, fecha_inicio, fecha_proximo_vencimiento, estatus, id]
  );
  return rows[0];
}

async function remove(id) {
  const { rows } = await pool.query('DELETE FROM contratos WHERE id = $1 RETURNING *', [id]);
  return rows[0];
}

module.exports = { findAll, findById, findByClienteId, create, update, remove };
