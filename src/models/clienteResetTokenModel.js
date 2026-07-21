const pool = require('../config/db');

async function create({ cliente_id, token_hash, expira_en }) {
  const { rows } = await pool.query(
    'INSERT INTO clientes_reset_tokens (cliente_id, token_hash, expira_en) VALUES ($1, $2, $3) RETURNING *',
    [cliente_id, token_hash, expira_en]
  );
  return rows[0];
}

async function findValidoPorHash(tokenHash) {
  const { rows } = await pool.query(
    `SELECT * FROM clientes_reset_tokens
     WHERE token_hash = $1 AND usado = false AND expira_en > now()`,
    [tokenHash]
  );
  return rows[0];
}

async function marcarUsado(id) {
  await pool.query('UPDATE clientes_reset_tokens SET usado = true WHERE id = $1', [id]);
}

module.exports = { create, findValidoPorHash, marcarUsado };
