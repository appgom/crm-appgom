const pool = require('../config/db');
const cargoModel = require('./cargoModel');
const contratoModel = require('./contratoModel');
const { sumarPeriodicidad } = require('../utils/periodicidad');

async function findByContratoId(contratoId) {
  const { rows } = await pool.query(
    'SELECT * FROM pagos WHERE contrato_id = $1 ORDER BY fecha',
    [contratoId]
  );
  return rows;
}

async function findByClienteId(clienteId) {
  const { rows } = await pool.query(
    `SELECT p.*, c.tipo_servicio_id, cs.nombre AS tipo_servicio
     FROM pagos p
     JOIN contratos c ON c.id = p.contrato_id
     JOIN catalogo_servicios cs ON cs.id = c.tipo_servicio_id
     WHERE c.cliente_id = $1
     ORDER BY p.fecha DESC`,
    [clienteId]
  );
  return rows;
}

async function create({ contrato_id, cargo_id, fecha, monto, metodo, referencia }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO pagos (contrato_id, cargo_id, fecha, monto, metodo, referencia)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [contrato_id, cargo_id, fecha, monto, metodo, referencia]
    );
    const pago = rows[0];

    if (cargo_id) {
      await liquidarCargoSiCorresponde(cargo_id, client);
    }

    await client.query('COMMIT');
    return pago;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function liquidarCargoSiCorresponde(cargoId, client) {
  const { rows: cargoRows } = await client.query('SELECT * FROM cargos WHERE id = $1', [cargoId]);
  const cargo = cargoRows[0];
  if (!cargo) return;

  const totalPagado = await cargoModel.sumPagosByCargoId(cargoId, client);

  if (totalPagado >= Number(cargo.monto)) {
    await cargoModel.updateEstatus(cargoId, 'pagado', client);

    const { rows: contratoRows } = await client.query('SELECT * FROM contratos WHERE id = $1', [cargo.contrato_id]);
    const contrato = contratoRows[0];

    if (contrato && contrato.modalidad_facturacion === 'recurrente' && contrato.estatus === 'activo') {
      const siguienteVencimiento = sumarPeriodicidad(cargo.fecha_vencimiento, contrato.periodicidad);
      await contratoModel.actualizarProximoVencimiento(contrato.id, siguienteVencimiento, client);
      await cargoModel.create(
        { contrato_id: contrato.id, fecha_vencimiento: siguienteVencimiento, monto: contrato.monto },
        client
      );
    }
  } else if (totalPagado > 0) {
    await cargoModel.updateEstatus(cargoId, 'parcial', client);
  }
}

module.exports = { findByContratoId, findByClienteId, create };
