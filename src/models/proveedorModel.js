const pool = require('../config/db');
const cargoProveedorModel = require('./cargoProveedorModel');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM proveedores ORDER BY id');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM proveedores WHERE id = $1', [id]);
  return rows[0];
}

async function create({
  nombre,
  servicio,
  contacto_email,
  password_suscripcion,
  monto,
  periodicidad,
  fecha_inicio,
  fecha_proximo_vencimiento,
  estatus,
  notas,
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO proveedores
        (nombre, servicio, contacto_email, password_suscripcion, monto, periodicidad, fecha_inicio, fecha_proximo_vencimiento, estatus, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'activo')::estatus_contrato_enum, $10)
       RETURNING *`,
      [nombre, servicio, contacto_email, password_suscripcion, monto, periodicidad, fecha_inicio, fecha_proximo_vencimiento, estatus, notas]
    );
    const proveedor = rows[0];

    await cargoProveedorModel.create(
      { proveedor_id: proveedor.id, fecha_vencimiento: proveedor.fecha_proximo_vencimiento, monto: proveedor.monto },
      client
    );

    await client.query('COMMIT');
    return proveedor;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function update(id, {
  nombre,
  servicio,
  contacto_email,
  password_suscripcion,
  monto,
  periodicidad,
  fecha_inicio,
  fecha_proximo_vencimiento,
  estatus,
  notas,
}) {
  const { rows } = await pool.query(
    `UPDATE proveedores SET
      nombre = $1,
      servicio = $2,
      contacto_email = $3,
      password_suscripcion = $4,
      monto = $5,
      periodicidad = $6,
      fecha_inicio = $7,
      fecha_proximo_vencimiento = $8,
      estatus = $9,
      notas = $10
     WHERE id = $11
     RETURNING *`,
    [nombre, servicio, contacto_email, password_suscripcion, monto, periodicidad, fecha_inicio, fecha_proximo_vencimiento, estatus, notas, id]
  );
  return rows[0];
}

async function actualizarProximoVencimiento(id, fecha, client = pool) {
  const { rows } = await client.query(
    'UPDATE proveedores SET fecha_proximo_vencimiento = $1 WHERE id = $2 RETURNING *',
    [fecha, id]
  );
  return rows[0];
}

async function remove(id) {
  const { rows } = await pool.query('DELETE FROM proveedores WHERE id = $1 RETURNING *', [id]);
  return rows[0];
}

module.exports = { findAll, findById, create, update, actualizarProximoVencimiento, remove };
