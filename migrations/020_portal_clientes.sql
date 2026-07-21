-- Metodo de cobro por contrato (transferencia manual vs Stripe automatico,
-- este ultimo llega en una fase posterior).
CREATE TYPE metodo_cobro_enum AS ENUM ('transferencia', 'stripe');
ALTER TABLE contratos ADD COLUMN metodo_cobro metodo_cobro_enum NOT NULL DEFAULT 'transferencia';

-- Acceso de clientes al portal. portal_habilitado se activa desde el CRM;
-- los clientes no se auto-registran.
ALTER TABLE clientes
  ADD COLUMN password_hash TEXT,
  ADD COLUMN portal_habilitado BOOLEAN NOT NULL DEFAULT false;

-- Tokens de restablecimiento de contraseña del portal: un solo uso, expirables,
-- se guardan hasheados (nunca el token en claro).
CREATE TABLE clientes_reset_tokens (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expira_en TIMESTAMPTZ NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clientes_reset_tokens_cliente_id ON clientes_reset_tokens(cliente_id);

-- Reportes de pago que el cliente sube desde el portal (transferencia +
-- comprobante), pendientes de que el administrador los confirme antes de
-- que afecten el saldo real del contrato.
CREATE TYPE estatus_reporte_pago_enum AS ENUM ('pendiente', 'confirmado', 'rechazado');

CREATE TABLE reportes_pago (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  contrato_id INTEGER NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  cargo_id INTEGER REFERENCES cargos(id) ON DELETE SET NULL,
  monto NUMERIC(12, 2) NOT NULL,
  fecha DATE NOT NULL,
  referencia TEXT,
  comprobante_nombre_original TEXT NOT NULL,
  comprobante_nombre_archivo TEXT NOT NULL,
  estatus estatus_reporte_pago_enum NOT NULL DEFAULT 'pendiente',
  pago_id INTEGER REFERENCES pagos(id) ON DELETE SET NULL,
  notas_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revisado_at TIMESTAMPTZ
);
CREATE INDEX idx_reportes_pago_cliente_id ON reportes_pago(cliente_id);
CREATE INDEX idx_reportes_pago_estatus ON reportes_pago(estatus);
