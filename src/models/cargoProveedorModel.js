const pool = require('../config/db');

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM cargos_proveedor WHERE id = $1', [id]);
  return rows[0];
}

async function findByProveedorId(proveedorId) {
  const { rows } = await pool.query(
    'SELECT * FROM cargos_proveedor WHERE proveedor_id = $1 ORDER BY fecha_vencimiento',
    [proveedorId]
  );
  return rows;
}

async function findPendienteActual(proveedorId) {
  const { rows } = await pool.query(
    `SELECT * FROM cargos_proveedor
     WHERE proveedor_id = $1 AND estatus IN ('pendiente', 'parcial')
     ORDER BY fecha_vencimiento
     LIMIT 1`,
    [proveedorId]
  );
  return rows[0];
}

async function create({ proveedor_id, fecha_vencimiento, monto }, client = pool) {
  const { rows } = await client.query(
    `INSERT INTO cargos_proveedor (proveedor_id, fecha_vencimiento, monto)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [proveedor_id, fecha_vencimiento, monto]
  );
  return rows[0];
}

async function updateEstatus(id, estatus, client = pool) {
  const { rows } = await client.query(
    'UPDATE cargos_proveedor SET estatus = $1 WHERE id = $2 RETURNING *',
    [estatus, id]
  );
  return rows[0];
}

async function sumPagosByCargoId(cargoId, client = pool) {
  const { rows } = await client.query(
    'SELECT COALESCE(SUM(monto), 0) AS total FROM pagos_proveedores WHERE cargo_proveedor_id = $1',
    [cargoId]
  );
  return Number(rows[0].total);
}

async function findPendientesConDetalle() {
  const { rows } = await pool.query(`
    SELECT
      cg.id AS cargo_id,
      cg.fecha_vencimiento,
      cg.monto,
      cg.estatus AS estatus_cargo,
      p.id AS proveedor_id,
      p.nombre AS proveedor_nombre,
      p.servicio,
      p.estatus AS estatus_proveedor,
      COALESCE((SELECT SUM(monto) FROM pagos_proveedores WHERE cargo_proveedor_id = cg.id), 0) AS total_pagado
    FROM cargos_proveedor cg
    JOIN proveedores p ON p.id = cg.proveedor_id
    WHERE cg.estatus IN ('pendiente', 'parcial')
    ORDER BY cg.fecha_vencimiento
  `);
  return rows;
}

module.exports = {
  findById,
  findByProveedorId,
  findPendienteActual,
  create,
  updateEstatus,
  sumPagosByCargoId,
  findPendientesConDetalle,
};
