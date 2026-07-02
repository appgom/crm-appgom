CREATE TYPE periodicidad_enum AS ENUM ('semanal', 'quincenal', 'mensual', 'trimestral', 'anual');
CREATE TYPE estatus_contrato_enum AS ENUM ('activo', 'cancelado');

CREATE TABLE contratos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_servicio TEXT NOT NULL,
  descripcion TEXT,
  numero_contrato TEXT UNIQUE,
  monto NUMERIC(12, 2) NOT NULL,
  periodicidad periodicidad_enum NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_proximo_vencimiento DATE NOT NULL,
  estatus estatus_contrato_enum NOT NULL DEFAULT 'activo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contratos_cliente_id ON contratos(cliente_id);
