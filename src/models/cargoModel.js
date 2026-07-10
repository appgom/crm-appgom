const pool = require('../config/db');

async function findByContratoId(contratoId) {
  const { rows } = await pool.query(
    'SELECT * FROM cargos WHERE contrato_id = $1 ORDER BY fecha_vencimiento',
    [contratoId]
  );
  return rows;
}

async function findPendienteActual(contratoId) {
  const { rows } = await pool.query(
    `SELECT * FROM cargos
     WHERE contrato_id = $1 AND estatus IN ('pendiente', 'parcial')
     ORDER BY fecha_vencimiento
     LIMIT 1`,
    [contratoId]
  );
  return rows[0];
}

async function create({ contrato_id, fecha_vencimiento, monto }, client = pool) {
  const { rows } = await client.query(
    `INSERT INTO cargos (contrato_id, fecha_vencimiento, monto)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [contrato_id, fecha_vencimiento, monto]
  );
  return rows[0];
}

async function actualizarPendiente(id, { fecha_vencimiento, monto }, client = pool) {
  const { rows } = await client.query(
    'UPDATE cargos SET fecha_vencimiento = $1, monto = $2 WHERE id = $3 RETURNING *',
    [fecha_vencimiento, monto, id]
  );
  return rows[0];
}

async function updateEstatus(id, estatus, client = pool) {
  const { rows } = await client.query(
    'UPDATE cargos SET estatus = $1 WHERE id = $2 RETURNING *',
    [estatus, id]
  );
  return rows[0];
}

async function sumPagosByCargoId(cargoId, client = pool) {
  const { rows } = await client.query(
    'SELECT COALESCE(SUM(monto), 0) AS total FROM pago_aplicaciones WHERE cargo_id = $1',
    [cargoId]
  );
  return Number(rows[0].total);
}

async function findPendientesByClienteId(clienteId) {
  const { rows } = await pool.query(
    `SELECT
      cg.id AS cargo_id,
      cg.fecha_vencimiento,
      cg.monto,
      cg.estatus,
      c.id AS contrato_id,
      c.modalidad_facturacion,
      cs.nombre AS tipo_servicio,
      COALESCE((SELECT SUM(monto) FROM pago_aplicaciones WHERE cargo_id = cg.id), 0) AS total_pagado
    FROM cargos cg
    JOIN contratos c ON c.id = cg.contrato_id
    JOIN catalogo_servicios cs ON cs.id = c.tipo_servicio_id
    WHERE c.cliente_id = $1 AND cg.estatus IN ('pendiente', 'parcial')
    ORDER BY cg.fecha_vencimiento`,
    [clienteId]
  );
  return rows;
}

async function findPendientesConDetalle() {
  const { rows } = await pool.query(`
    SELECT
      cg.id AS cargo_id,
      cg.fecha_vencimiento,
      cg.monto,
      cg.estatus AS estatus_cargo,
      c.id AS contrato_id,
      c.numero_contrato,
      c.estatus AS estatus_contrato,
      c.modalidad_facturacion,
      cs.nombre AS tipo_servicio,
      cl.id AS cliente_id,
      cl.nombre AS cliente_nombre,
      cl.email AS cliente_email,
      COALESCE((SELECT SUM(monto) FROM pago_aplicaciones WHERE cargo_id = cg.id), 0) AS total_pagado
    FROM cargos cg
    JOIN contratos c ON c.id = cg.contrato_id
    JOIN catalogo_servicios cs ON cs.id = c.tipo_servicio_id
    JOIN clientes cl ON cl.id = c.cliente_id
    WHERE cg.estatus IN ('pendiente', 'parcial')
    ORDER BY cg.fecha_vencimiento
  `);
  return rows;
}

module.exports = {
  findByContratoId,
  findPendienteActual,
  findPendientesByClienteId,
  create,
  actualizarPendiente,
  updateEstatus,
  sumPagosByCargoId,
  findPendientesConDetalle,
};
