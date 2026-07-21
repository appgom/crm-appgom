-- Facturas que el administrador sube por contrato para que el cliente las
-- consulte y descargue desde el portal.
CREATE TABLE facturas (
  id SERIAL PRIMARY KEY,
  contrato_id INTEGER NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  nombre_original TEXT NOT NULL,
  nombre_archivo TEXT NOT NULL,
  monto NUMERIC(12, 2),
  fecha_emision DATE,
  subido_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_facturas_contrato_id ON facturas(contrato_id);
