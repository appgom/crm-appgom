CREATE TYPE metodo_pago_enum AS ENUM ('transferencia', 'efectivo', 'tarjeta', 'stripe');

CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  contrato_id INTEGER NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  monto NUMERIC(12, 2) NOT NULL,
  metodo metodo_pago_enum NOT NULL,
  referencia TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pagos_contrato_id ON pagos(contrato_id);
