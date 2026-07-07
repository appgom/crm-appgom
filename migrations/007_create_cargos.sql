CREATE TYPE estatus_cargo_enum AS ENUM ('pendiente', 'parcial', 'pagado', 'cancelado');

CREATE TABLE cargos (
  id SERIAL PRIMARY KEY,
  contrato_id INTEGER NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  fecha_vencimiento DATE NOT NULL,
  monto NUMERIC(12, 2) NOT NULL,
  estatus estatus_cargo_enum NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cargos_contrato_id ON cargos(contrato_id);
CREATE INDEX idx_cargos_fecha_vencimiento ON cargos(fecha_vencimiento);

ALTER TABLE pagos ADD COLUMN cargo_id INTEGER REFERENCES cargos(id) ON DELETE SET NULL;
CREATE INDEX idx_pagos_cargo_id ON pagos(cargo_id);
