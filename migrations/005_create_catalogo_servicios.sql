CREATE TABLE catalogo_servicios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO catalogo_servicios (nombre) VALUES
  ('Desarrollo web'),
  ('Aplicación móvil'),
  ('Hosting'),
  ('Dominio'),
  ('Campaña de marketing'),
  ('Mantenimiento'),
  ('Diseño'),
  ('Bolsa de horas de programación'),
  ('Ticket de servicio');
