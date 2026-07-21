const pool = require('../config/db');

async function create({
  cliente_id,
  contrato_id,
  cargo_id,
  monto,
  fecha,
  referencia,
  comprobante_nombre_original,
  comprobante_nombre_archivo,
}) {
  const { rows } = await pool.query(
    `INSERT INTO reportes_pago
      (cliente_id, contrato_id, cargo_id, monto, fecha, referencia, comprobante_nombre_original, comprobante_nombre_archivo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [cliente_id, contrato_id, cargo_id, monto, fecha, referencia, comprobante_nombre_original, comprobante_nombre_archivo]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM reportes_pago WHERE id = $1', [id]);
  return rows[0];
}

async function findByClienteId(clienteId) {
  const { rows } = await pool.query(
    `SELECT rp.*, cs.nombre AS tipo_servicio, c.numero_contrato
     FROM reportes_pago rp
     JOIN contratos c ON c.id = rp.contrato_id
     JOIN catalogo_servicios cs ON cs.id = c.tipo_servicio_id
     WHERE rp.cliente_id = $1
     ORDER BY rp.created_at DESC`,
    [clienteId]
  );
  return rows;
}

async function findPendientes() {
  const { rows } = await pool.query(
    `SELECT rp.*, cl.nombre AS cliente_nombre, cl.empresa AS cliente_empresa,
      cs.nombre AS tipo_servicio, c.numero_contrato
     FROM reportes_pago rp
     JOIN clientes cl ON cl.id = rp.cliente_id
     JOIN contratos c ON c.id = rp.contrato_id
     JOIN catalogo_servicios cs ON cs.id = c.tipo_servicio_id
     WHERE rp.estatus = 'pendiente'
     ORDER BY rp.created_at ASC`
  );
  return rows;
}

async function confirmar(id, pagoId) {
  const { rows } = await pool.query(
    `UPDATE reportes_pago SET estatus = 'confirmado', pago_id = $1, revisado_at = now() WHERE id = $2 RETURNING *`,
    [pagoId, id]
  );
  return rows[0];
}

async function rechazar(id, notasAdmin) {
  const { rows } = await pool.query(
    `UPDATE reportes_pago SET estatus = 'rechazado', notas_admin = $1, revisado_at = now() WHERE id = $2 RETURNING *`,
    [notasAdmin || null, id]
  );
  return rows[0];
}

module.exports = { create, findById, findByClienteId, findPendientes, confirmar, rechazar };
