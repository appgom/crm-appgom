CREATE TABLE proveedores (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  servicio TEXT,
  contacto_email TEXT,
  monto NUMERIC(10,2) NOT NULL,
  periodicidad periodicidad_enum NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_proximo_vencimiento DATE NOT NULL,
  estatus estatus_contrato_enum NOT NULL DEFAULT 'activo',
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cargos_proveedor (
  id SERIAL PRIMARY KEY,
  proveedor_id INTEGER NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  fecha_vencimiento DATE NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  estatus estatus_cargo_enum NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pagos_proveedores (
  id SERIAL PRIMARY KEY,
  cargo_proveedor_id INTEGER NOT NULL REFERENCES cargos_proveedor(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  metodo metodo_pago_enum NOT NULL,
  referencia TEXT,
  comprobante_nombre_original TEXT,
  comprobante_nombre_archivo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cargos_proveedor_proveedor_id ON cargos_proveedor(proveedor_id);
CREATE INDEX idx_pagos_proveedores_cargo_id ON pagos_proveedores(cargo_proveedor_id);
