CREATE TYPE modalidad_facturacion_enum AS ENUM ('recurrente', 'bolsa_horas', 'por_ticket');

ALTER TABLE contratos
  ADD COLUMN tipo_servicio_id INTEGER REFERENCES catalogo_servicios(id),
  ADD COLUMN modalidad_facturacion modalidad_facturacion_enum NOT NULL DEFAULT 'recurrente';

ALTER TABLE contratos DROP COLUMN tipo_servicio;

ALTER TABLE contratos ALTER COLUMN tipo_servicio_id SET NOT NULL;

CREATE INDEX idx_contratos_tipo_servicio_id ON contratos(tipo_servicio_id);
