-- Plantillas editables para los correos/mensajes que el sistema envia en
-- distintas situaciones. Cada situacion (tipo) puede tener una version por
-- canal (email ya funciona; whatsapp queda lista para cuando se conecte esa
-- integracion, sin necesidad de rediseñar esta tabla).
CREATE TYPE tipo_plantilla_enum AS ENUM (
  'recordatorio_cliente',
  'alerta_admin_vencimiento',
  'portal_acceso',
  'portal_reset',
  'bienvenida_cliente',
  'pago_confirmado',
  'reporte_pago_rechazado',
  'factura_subida',
  'alerta_admin_pago_stripe'
);
CREATE TYPE canal_plantilla_enum AS ENUM ('email', 'whatsapp');

CREATE TABLE plantillas_notificacion (
  id SERIAL PRIMARY KEY,
  tipo tipo_plantilla_enum NOT NULL,
  canal canal_plantilla_enum NOT NULL,
  asunto TEXT,
  cuerpo TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  UNIQUE(tipo, canal)
);

-- Semillas para email: mismo texto que ya se enviaba de forma fija en el
-- codigo, para que el comportamiento no cambie al activar este modulo.
INSERT INTO plantillas_notificacion (tipo, canal, asunto, cuerpo) VALUES
('recordatorio_cliente', 'email',
 'Recordatorio: tu pago de {{tipo_servicio}} {{situacion_texto}}',
 '<p>Hola {{cliente_nombre}},</p><p>Te recordamos que el pago de <strong>{{tipo_servicio}}</strong> por <strong>${{monto}}</strong> {{situacion_texto}} ({{fecha}}).</p>'),
('alerta_admin_vencimiento', 'email',
 '[Admin] Recordatorio: {{tipo_servicio}} de {{cliente_nombre}} {{situacion_texto}}',
 '<p>El contrato de {{tipo_servicio}} de {{cliente_nombre}} {{situacion_texto}} ({{fecha}}), monto ${{monto}}.</p>'),
('portal_acceso', 'email',
 'Acceso a tu portal de cliente — Appgom',
 '<p>Hola {{cliente_nombre}},</p><p>Ya puedes ingresar a tu portal de cliente en <a href="{{portal_url}}">{{portal_url}}</a> con estos datos:</p><p>Correo: {{cliente_email}}<br/>Contraseña temporal: <strong>{{password_temporal}}</strong></p><p>Te recomendamos cambiarla después de tu primer ingreso.</p>'),
('portal_reset', 'email',
 'Restablece tu contraseña — Portal Appgom',
 '<p>Hola {{cliente_nombre}},</p><p>Da clic en el siguiente enlace para restablecer tu contraseña (válido por 1 hora):</p><p><a href="{{reset_url}}">{{reset_url}}</a></p><p>Si tú no solicitaste esto, ignora este correo.</p>'),
('bienvenida_cliente', 'email',
 'Bienvenido a Appgom',
 '<p>Hola {{cliente_nombre}},</p><p>Gracias por confiar en Appgom. A partir de ahora estaremos en contacto para todo lo relacionado con tus servicios contratados.</p>'),
('pago_confirmado', 'email',
 'Pago confirmado — {{tipo_servicio}}',
 '<p>Hola {{cliente_nombre}},</p><p>Confirmamos tu pago de <strong>${{monto}}</strong> para <strong>{{tipo_servicio}}</strong> con fecha {{fecha}}. ¡Gracias!</p>'),
('reporte_pago_rechazado', 'email',
 'Tu comprobante de pago no pudo ser validado — {{tipo_servicio}}',
 '<p>Hola {{cliente_nombre}},</p><p>El comprobante de pago que reportaste por <strong>${{monto}}</strong> para <strong>{{tipo_servicio}}</strong> no pudo ser validado.</p><p>Motivo: {{motivo}}</p><p>Por favor ingresa a tu portal para reportarlo de nuevo o contáctanos si tienes dudas.</p>'),
('factura_subida', 'email',
 'Nueva factura disponible — {{tipo_servicio}}',
 '<p>Hola {{cliente_nombre}},</p><p>Ya está disponible una nueva factura de <strong>{{tipo_servicio}}</strong> ({{numero_contrato}}) en tu portal de cliente.</p>'),
('alerta_admin_pago_stripe', 'email',
 '[Admin] Pago con tarjeta recibido — {{tipo_servicio}}',
 '<p>{{cliente_nombre}} pagó ${{monto}} con tarjeta para {{tipo_servicio}} ({{fecha}}).</p>');

-- Semillas para whatsapp: version breve en texto plano (sin HTML), lista
-- para usarse en cuanto se conecte esa integracion.
INSERT INTO plantillas_notificacion (tipo, canal, cuerpo) VALUES
('recordatorio_cliente', 'whatsapp', 'Hola {{cliente_nombre}}, tu pago de {{tipo_servicio}} por ${{monto}} {{situacion_texto}} ({{fecha}}).'),
('alerta_admin_vencimiento', 'whatsapp', 'El contrato de {{tipo_servicio}} de {{cliente_nombre}} {{situacion_texto}} ({{fecha}}), monto ${{monto}}.'),
('portal_acceso', 'whatsapp', 'Hola {{cliente_nombre}}, ya puedes ingresar a tu portal en {{portal_url}}. Contraseña temporal: {{password_temporal}}'),
('portal_reset', 'whatsapp', 'Hola {{cliente_nombre}}, restablece tu contraseña aquí (valido 1 hora): {{reset_url}}'),
('bienvenida_cliente', 'whatsapp', 'Hola {{cliente_nombre}}, gracias por confiar en Appgom. Aquí te avisaremos sobre tus servicios.'),
('pago_confirmado', 'whatsapp', 'Hola {{cliente_nombre}}, confirmamos tu pago de ${{monto}} para {{tipo_servicio}} ({{fecha}}). ¡Gracias!'),
('reporte_pago_rechazado', 'whatsapp', 'Hola {{cliente_nombre}}, tu comprobante de ${{monto}} para {{tipo_servicio}} no pudo ser validado. Motivo: {{motivo}}'),
('factura_subida', 'whatsapp', 'Hola {{cliente_nombre}}, ya está disponible una nueva factura de {{tipo_servicio}} ({{numero_contrato}}) en tu portal.'),
('alerta_admin_pago_stripe', 'whatsapp', '{{cliente_nombre}} pagó ${{monto}} con tarjeta para {{tipo_servicio}} ({{fecha}}).');
