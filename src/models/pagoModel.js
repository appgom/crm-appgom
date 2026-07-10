const pool = require('../config/db');
const cargoModel = require('./cargoModel');
const contratoModel = require('./contratoModel');
const { sumarPeriodicidad } = require('../utils/periodicidad');

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM pagos WHERE id = $1', [id]);
  return rows[0];
}

async function findByContratoId(contratoId) {
  const { rows } = await pool.query(
    `SELECT
      p.id AS pago_id,
      p.fecha,
      p.monto AS monto_total,
      p.metodo,
      p.referencia,
      p.comprobante_nombre_original,
      pa.monto AS monto_aplicado,
      pa.cargo_id,
      CASE
        WHEN pa.cargo_id IS NULL THEN NULL
        WHEN SUM(pa.monto) OVER (PARTITION BY pa.cargo_id ORDER BY p.fecha, p.id, pa.id) < cg.monto THEN 'anticipo'
        WHEN ROW_NUMBER() OVER (PARTITION BY pa.cargo_id ORDER BY p.fecha, p.id, pa.id) = 1 THEN 'pago_total'
        ELSE 'resto'
      END AS tipo_aplicacion,
      (
        SELECT json_agg(json_build_object('contrato_id', c2.id, 'tipo_servicio', cs2.nombre, 'monto', pa2.monto))
        FROM pago_aplicaciones pa2
        JOIN contratos c2 ON c2.id = pa2.contrato_id
        JOIN catalogo_servicios cs2 ON cs2.id = c2.tipo_servicio_id
        WHERE pa2.pago_id = p.id AND pa2.contrato_id != $1
      ) AS otros_servicios
    FROM pago_aplicaciones pa
    JOIN pagos p ON p.id = pa.pago_id
    LEFT JOIN cargos cg ON cg.id = pa.cargo_id
    WHERE pa.contrato_id = $1
    ORDER BY p.fecha DESC`,
    [contratoId]
  );
  return rows;
}

async function findByClienteId(clienteId) {
  const { rows } = await pool.query(
    `SELECT
      p.id AS pago_id,
      p.fecha,
      p.monto AS monto_total,
      p.metodo,
      p.referencia,
      p.comprobante_nombre_original,
      pa.monto AS monto_aplicado,
      pa.contrato_id,
      cs.nombre AS tipo_servicio,
      CASE
        WHEN pa.cargo_id IS NULL THEN NULL
        WHEN SUM(pa.monto) OVER (PARTITION BY pa.cargo_id ORDER BY p.fecha, p.id, pa.id) < cg.monto THEN 'anticipo'
        WHEN ROW_NUMBER() OVER (PARTITION BY pa.cargo_id ORDER BY p.fecha, p.id, pa.id) = 1 THEN 'pago_total'
        ELSE 'resto'
      END AS tipo_aplicacion,
      (
        SELECT json_agg(json_build_object('contrato_id', c2.id, 'tipo_servicio', cs2.nombre, 'monto', pa2.monto))
        FROM pago_aplicaciones pa2
        JOIN contratos c2 ON c2.id = pa2.contrato_id
        JOIN catalogo_servicios cs2 ON cs2.id = c2.tipo_servicio_id
        WHERE pa2.pago_id = p.id AND pa2.contrato_id != pa.contrato_id
      ) AS otros_servicios
    FROM pago_aplicaciones pa
    JOIN pagos p ON p.id = pa.pago_id
    JOIN contratos c ON c.id = pa.contrato_id
    JOIN catalogo_servicios cs ON cs.id = c.tipo_servicio_id
    LEFT JOIN cargos cg ON cg.id = pa.cargo_id
    WHERE c.cliente_id = $1
    ORDER BY p.fecha DESC`,
    [clienteId]
  );
  return rows;
}

async function create({ fecha, metodo, referencia, comprobante_nombre_original, comprobante_nombre_archivo, aplicaciones }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const montoTotal = aplicaciones.reduce((sum, a) => sum + Number(a.monto), 0);

    const { rows: pagoRows } = await client.query(
      `INSERT INTO pagos (fecha, monto, metodo, referencia, comprobante_nombre_original, comprobante_nombre_archivo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [fecha, montoTotal, metodo, referencia, comprobante_nombre_original || null, comprobante_nombre_archivo || null]
    );
    const pago = pagoRows[0];

    for (const aplicacion of aplicaciones) {
      await client.query(
        `INSERT INTO pago_aplicaciones (pago_id, contrato_id, cargo_id, monto)
         VALUES ($1, $2, $3, $4)`,
        [pago.id, aplicacion.contrato_id, aplicacion.cargo_id || null, aplicacion.monto]
      );

      if (aplicacion.cargo_id) {
        await liquidarCargoSiCorresponde(aplicacion.cargo_id, client);
      }
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

module.exports = { findById, findByContratoId, findByClienteId, create };
