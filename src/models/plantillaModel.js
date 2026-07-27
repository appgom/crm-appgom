const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM plantillas_notificacion ORDER BY tipo, canal');
  return rows;
}

async function findByTipoYCanal(tipo, canal) {
  const { rows } = await pool.query(
    'SELECT * FROM plantillas_notificacion WHERE tipo = $1 AND canal = $2',
    [tipo, canal]
  );
  return rows[0];
}

async function actualizar(tipo, canal, { asunto, cuerpo, activo }, usuarioId) {
  const { rows } = await pool.query(
    `UPDATE plantillas_notificacion
     SET asunto = $1, cuerpo = $2, activo = $3, updated_at = now(), updated_by = $4
     WHERE tipo = $5 AND canal = $6
     RETURNING *`,
    [asunto || null, cuerpo, activo, usuarioId, tipo, canal]
  );
  return rows[0];
}

module.exports = { findAll, findByTipoYCanal, actualizar };
