const pool = require('../config/db');

async function yaEnviada({ cargoId, momento, tipo }) {
  const { rows } = await pool.query(
    'SELECT 1 FROM notificaciones_log WHERE cargo_id = $1 AND momento = $2 AND tipo = $3',
    [cargoId, momento, tipo]
  );
  return rows.length > 0;
}

async function registrar({ contratoId, cargoId, momento, tipo, canal, estatusEnvio }) {
  await pool.query(
    `INSERT INTO notificaciones_log (contrato_id, cargo_id, momento, tipo, canal, estatus_envio)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT DO NOTHING`,
    [contratoId, cargoId, momento, tipo, canal, estatusEnvio]
  );
}

module.exports = { yaEnviada, registrar };
