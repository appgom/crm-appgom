-- Un pago es una sola transaccion (un comprobante); pago_aplicaciones registra
-- a que cargo(s)/contrato(s) se aplica, permitiendo dividir un pago entre varios
-- contratos (ej. el cliente paga hosting + dominio en una sola transferencia).

CREATE TABLE pago_aplicaciones (
  id SERIAL PRIMARY KEY,
  pago_id INTEGER NOT NULL REFERENCES pagos(id) ON DELETE CASCADE,
  contrato_id INTEGER NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  cargo_id INTEGER REFERENCES cargos(id) ON DELETE SET NULL,
  monto NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pago_aplicaciones_pago_id ON pago_aplicaciones(pago_id);
CREATE INDEX idx_pago_aplicaciones_contrato_id ON pago_aplicaciones(contrato_id);
CREATE INDEX idx_pago_aplicaciones_cargo_id ON pago_aplicaciones(cargo_id);

-- Migrar pagos existentes (un pago = una aplicacion, uno a uno)
INSERT INTO pago_aplicaciones (pago_id, contrato_id, cargo_id, monto)
SELECT id, contrato_id, cargo_id, monto FROM pagos;

ALTER TABLE pagos
  DROP COLUMN contrato_id,
  DROP COLUMN cargo_id,
  ADD COLUMN comprobante_nombre_original TEXT,
  ADD COLUMN comprobante_nombre_archivo TEXT;
