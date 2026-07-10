const pool = require('../config/db');
const cargoProveedorModel = require('./cargoProveedorModel');
const proveedorModel = require('./proveedorModel');
const { sumarPeriodicidad } = require('../utils/periodicidad');

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM pagos_proveedores WHERE id = $1', [id]);
  return rows[0];
}

async function findByProveedorId(proveedorId) {
  const { rows } = await pool.query(
    `SELECT pp.*
     FROM pagos_proveedores pp
     JOIN cargos_proveedor cg ON cg.id = pp.cargo_proveedor_id
     WHERE cg.proveedor_id = $1
     ORDER BY pp.fecha DESC`,
    [proveedorId]
  );
  return rows;
}

async function create({ cargo_proveedor_id, fecha, monto, metodo, referencia, comprobante_nombre_original, comprobante_nombre_archivo }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO pagos_proveedores (cargo_proveedor_id, fecha, monto, metodo, referencia, comprobante_nombre_original, comprobante_nombre_archivo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [cargo_proveedor_id, fecha, monto, metodo, referencia, comprobante_nombre_original || null, comprobante_nombre_archivo || null]
    );
    const pago = rows[0];

    await liquidarCargoSiCorresponde(cargo_proveedor_id, client);

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
  const { rows: cargoRows } = await client.query('SELECT * FROM cargos_proveedor WHERE id = $1', [cargoId]);
  const cargo = cargoRows[0];
  if (!cargo) return;

  const totalPagado = await cargoProveedorModel.sumPagosByCargoId(cargoId, client);

  if (totalPagado >= Number(cargo.monto)) {
    await cargoProveedorModel.updateEstatus(cargoId, 'pagado', client);

    const { rows: proveedorRows } = await client.query('SELECT * FROM proveedores WHERE id = $1', [cargo.proveedor_id]);
    const proveedor = proveedorRows[0];

    if (proveedor && proveedor.estatus === 'activo') {
      const siguienteVencimiento = sumarPeriodicidad(cargo.fecha_vencimiento, proveedor.periodicidad);
      await proveedorModel.actualizarProximoVencimiento(proveedor.id, siguienteVencimiento, client);
      await cargoProveedorModel.create(
        { proveedor_id: proveedor.id, fecha_vencimiento: siguienteVencimiento, monto: proveedor.monto },
        client
      );
    }
  } else if (totalPagado > 0) {
    await cargoProveedorModel.updateEstatus(cargoId, 'parcial', client);
  }
}

module.exports = { findById, findByProveedorId, create };
