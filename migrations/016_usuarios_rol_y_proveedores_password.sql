CREATE TYPE rol_usuario_enum AS ENUM ('admin', 'cuentas');
ALTER TABLE usuarios ADD COLUMN rol rol_usuario_enum NOT NULL DEFAULT 'admin';

ALTER TABLE proveedores ADD COLUMN password_suscripcion TEXT;
