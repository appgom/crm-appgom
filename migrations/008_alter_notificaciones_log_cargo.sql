CREATE TYPE momento_notificacion_enum AS ENUM ('7_dias_antes', 'vencimiento', 'vencido');

ALTER TABLE notificaciones_log
  ADD COLUMN cargo_id INTEGER REFERENCES cargos(id) ON DELETE CASCADE,
  ADD COLUMN momento momento_notificacion_enum;

CREATE INDEX idx_notificaciones_cargo_id ON notificaciones_log(cargo_id);

CREATE UNIQUE INDEX uniq_notificacion_por_cargo_momento_tipo
  ON notificaciones_log(cargo_id, momento, tipo)
  WHERE cargo_id IS NOT NULL;
