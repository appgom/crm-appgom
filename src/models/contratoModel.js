const pool = require('../config/db');
const cargoModel = require('./cargoModel');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM contratos ORDER BY id');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM contratos WHERE id = $1', [id]);
  return rows[0];
}

async function findByClienteId(clienteId) {
  const { rows } = await pool.query('SELECT * FROM contratos WHERE cliente_id = $1 ORDER BY id', [clienteId]);
  return rows;
}

async function create({
  cliente_id,
  tipo_servicio_id,
  descripcion,
  notas_internas,
  monto,
  periodicidad,
  fecha_inicio,
  fecha_proximo_vencimiento,
  fecha_limite_pago,
  estatus,
  modalidad_facturacion,
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO contratos
        (cliente_id, tipo_servicio_id, descripcion, notas_internas, numero_contrato, monto, periodicidad, fecha_inicio, fecha_proximo_vencimiento, fecha_limite_pago, estatus, modalidad_facturacion)
       VALUES ($1, $2, $3, $4, 'CT-' || LPAD(nextval('contrato_numero_seq')::text, 5, '0'), $5, $6, $7, $8, $9, COALESCE($10, 'activo')::estatus_contrato_enum, COALESCE($11, 'recurrente')::modalidad_facturacion_enum)
       RETURNING *`,
      [
        cliente_id,
        tipo_servicio_id,
        descripcion,
        notas_internas,
        monto,
        periodicidad,
        fecha_inicio,
        fecha_proximo_vencimiento,
        fecha_limite_pago || null,
        estatus,
        modalidad_facturacion,
      ]
    );
    const contrato = rows[0];

    await cargoModel.create(
      {
        contrato_id: contrato.id,
        fecha_vencimiento: contrato.fecha_proximo_vencimiento,
        monto: contrato.monto,
      },
      client
    );

    await client.query('COMMIT');
    return contrato;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function update(id, {
  tipo_servicio_id,
  descripcion,
  notas_internas,
  monto,
  periodicidad,
  fecha_inicio,
  fecha_proximo_vencimiento,
  fecha_limite_pago,
  estatus,
  modalidad_facturacion,
}) {
  const { rows } = await pool.query(
    `UPDATE contratos SET
      tipo_servicio_id = $1,
      descripcion = $2,
      notas_internas = $3,
      monto = $4,
      periodicidad = $5,
      fecha_inicio = $6,
      fecha_proximo_vencimiento = $7,
      fecha_limite_pago = $8,
      estatus = $9,
      modalidad_facturacion = $10
     WHERE id = $11
     RETURNING *`,
    [
      tipo_servicio_id,
      descripcion,
      notas_internas,
      monto,
      periodicidad,
      fecha_inicio,
      fecha_proximo_vencimiento,
      fecha_limite_pago || null,
      estatus,
      modalidad_facturacion,
      id,
    ]
  );
  return rows[0];
}

async function actualizarProximoVencimiento(id, fecha, client = pool) {
  const { rows } = await client.query(
    'UPDATE contratos SET fecha_proximo_vencimiento = $1 WHERE id = $2 RETURNING *',
    [fecha, id]
  );
  return rows[0];
}

async function remove(id) {
  const { rows } = await pool.query('DELETE FROM contratos WHERE id = $1 RETURNING *', [id]);
  return rows[0];
}

module.exports = { findAll, findById, findByClienteId, create, update, remove, actualizarProximoVencimiento };
