CREATE TYPE tipo_notificacion_enum AS ENUM ('recordatorio_cliente', 'alerta_admin');
CREATE TYPE canal_notificacion_enum AS ENUM ('email', 'whatsapp');

CREATE TABLE notificaciones_log (
  id SERIAL PRIMARY KEY,
  contrato_id INTEGER NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  tipo tipo_notificacion_enum NOT NULL,
  fecha_envio TIMESTAMPTZ NOT NULL DEFAULT now(),
  canal canal_notificacion_enum NOT NULL,
  estatus_envio TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notificaciones_contrato_id ON notificaciones_log(contrato_id);
