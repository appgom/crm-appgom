const pool = require('../config/db');

async function findByContratoId(contratoId) {
  const { rows } = await pool.query(
    'SELECT * FROM pagos WHERE contrato_id = $1 ORDER BY fecha',
    [contratoId]
  );
  return rows;
}

async function sumByContratoId(contratoId) {
  const { rows } = await pool.query(
    'SELECT COALESCE(SUM(monto), 0) AS total FROM pagos WHERE contrato_id = $1',
    [contratoId]
  );
  return Number(rows[0].total);
}

async function create({ contrato_id, fecha, monto, metodo, referencia }) {
  const { rows } = await pool.query(
    `INSERT INTO pagos (contrato_id, fecha, monto, metodo, referencia)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [contrato_id, fecha, monto, metodo, referencia]
  );
  return rows[0];
}

module.exports = { findByContratoId, sumByContratoId, create };
