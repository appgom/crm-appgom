-- Reemplaza el texto de las plantillas semilla por una version mas
-- profesional, directa y amable, con el mismo tono que ya usa el negocio en
-- sus avisos manuales de renovacion (ver conversacion). No agrega variables
-- nuevas, solo mejora la redaccion sobre las mismas.

UPDATE plantillas_notificacion SET asunto = 'Recordatorio: tu servicio de {{tipo_servicio}} {{situacion_texto}}', cuerpo =
'<p>Hola {{cliente_nombre}}, buen día.</p><p>Te informamos que tu servicio de <strong>{{tipo_servicio}}</strong> {{situacion_texto}} ({{fecha}}).</p><p>Monto a pagar: <strong>${{monto}} MXN</strong></p><p>Te sugerimos realizar el pago antes de la fecha límite para evitar cualquier suspensión automática o interrupción en el servicio.</p><p>Cualquier duda, quedamos atentos.</p><p>Saludos,<br>Equipo Appgom</p>'
WHERE tipo = 'recordatorio_cliente' AND canal = 'email';

UPDATE plantillas_notificacion SET cuerpo =
'Hola {{cliente_nombre}}, buen día. Te informamos que tu servicio de {{tipo_servicio}} {{situacion_texto}} ({{fecha}}). Monto a pagar: ${{monto}} MXN. Te sugerimos realizar el pago antes de la fecha límite para evitar interrupciones. Saludos, equipo Appgom.'
WHERE tipo = 'recordatorio_cliente' AND canal = 'whatsapp';

UPDATE plantillas_notificacion SET asunto = '[Admin] {{tipo_servicio}} de {{cliente_nombre}} {{situacion_texto}}', cuerpo =
'<p>El contrato de <strong>{{tipo_servicio}}</strong> de <strong>{{cliente_nombre}}</strong> {{situacion_texto}} ({{fecha}}). Monto: ${{monto}} MXN.</p>'
WHERE tipo = 'alerta_admin_vencimiento' AND canal = 'email';

UPDATE plantillas_notificacion SET cuerpo =
'{{cliente_nombre}} — {{tipo_servicio}} {{situacion_texto}} ({{fecha}}). Monto: ${{monto}} MXN.'
WHERE tipo = 'alerta_admin_vencimiento' AND canal = 'whatsapp';

UPDATE plantillas_notificacion SET asunto = 'Acceso a tu portal de cliente — Appgom', cuerpo =
'<p>Hola {{cliente_nombre}}, buen día.</p><p>Ya tienes acceso a tu portal de cliente, donde puedes consultar tus contratos, saldos, pagos y facturas cuando lo necesites.</p><p>Ingresa aquí: <a href="{{portal_url}}">{{portal_url}}</a></p><p>Usuario: {{cliente_email}}<br>Contraseña temporal: <strong>{{password_temporal}}</strong></p><p>Te recomendamos cambiarla después de tu primer ingreso.</p><p>Saludos,<br>Equipo Appgom</p>'
WHERE tipo = 'portal_acceso' AND canal = 'email';

UPDATE plantillas_notificacion SET cuerpo =
'Hola {{cliente_nombre}}, buen día. Ya tienes acceso a tu portal de cliente: {{portal_url}}. Usuario: {{cliente_email}}. Contraseña temporal: {{password_temporal}}. Te recomendamos cambiarla al ingresar.'
WHERE tipo = 'portal_acceso' AND canal = 'whatsapp';

UPDATE plantillas_notificacion SET asunto = 'Restablece tu contraseña — Portal Appgom', cuerpo =
'<p>Hola {{cliente_nombre}}, buen día.</p><p>Recibimos una solicitud para restablecer tu contraseña del portal. Da clic en el siguiente enlace (válido por 1 hora):</p><p><a href="{{reset_url}}">{{reset_url}}</a></p><p>Si tú no solicitaste esto, puedes ignorar este correo con confianza.</p><p>Saludos,<br>Equipo Appgom</p>'
WHERE tipo = 'portal_reset' AND canal = 'email';

UPDATE plantillas_notificacion SET cuerpo =
'Hola {{cliente_nombre}}, buen día. Para restablecer tu contraseña entra aquí (válido 1 hora): {{reset_url}}. Si no lo solicitaste, ignora este mensaje.'
WHERE tipo = 'portal_reset' AND canal = 'whatsapp';

UPDATE plantillas_notificacion SET asunto = 'Bienvenido a Appgom, {{cliente_nombre}}', cuerpo =
'<p>Hola {{cliente_nombre}}, buen día.</p><p>Gracias por confiar en Appgom. A partir de ahora seremos tu punto de contacto para todo lo relacionado con tus servicios contratados: dudas, soporte, facturación y renovaciones.</p><p>Cualquier cosa que necesites, aquí estamos.</p><p>Saludos,<br>Equipo Appgom</p>'
WHERE tipo = 'bienvenida_cliente' AND canal = 'email';

UPDATE plantillas_notificacion SET cuerpo =
'Hola {{cliente_nombre}}, buen día. Gracias por confiar en Appgom. A partir de ahora seremos tu contacto para todo lo relacionado con tus servicios. Cualquier cosa que necesites, aquí estamos.'
WHERE tipo = 'bienvenida_cliente' AND canal = 'whatsapp';

UPDATE plantillas_notificacion SET asunto = 'Pago confirmado — {{tipo_servicio}}', cuerpo =
'<p>Hola {{cliente_nombre}}, buen día.</p><p>Confirmamos la recepción de tu pago de <strong>${{monto}} MXN</strong> correspondiente a <strong>{{tipo_servicio}}</strong>, con fecha {{fecha}}.</p><p>¡Gracias por tu puntualidad!</p><p>Saludos,<br>Equipo Appgom</p>'
WHERE tipo = 'pago_confirmado' AND canal = 'email';

UPDATE plantillas_notificacion SET cuerpo =
'Hola {{cliente_nombre}}, buen día. Confirmamos tu pago de ${{monto}} MXN para {{tipo_servicio}} (fecha {{fecha}}). ¡Gracias por tu puntualidad!'
WHERE tipo = 'pago_confirmado' AND canal = 'whatsapp';

UPDATE plantillas_notificacion SET asunto = 'Necesitamos revisar tu comprobante de pago — {{tipo_servicio}}', cuerpo =
'<p>Hola {{cliente_nombre}}, buen día.</p><p>Revisamos el comprobante que nos compartiste por <strong>${{monto}} MXN</strong> para <strong>{{tipo_servicio}}</strong>, pero no pudimos validarlo.</p><p>Motivo: {{motivo}}</p><p>Por favor ingresa a tu portal para volver a reportarlo, o contáctanos si tienes dudas.</p><p>Saludos,<br>Equipo Appgom</p>'
WHERE tipo = 'reporte_pago_rechazado' AND canal = 'email';

UPDATE plantillas_notificacion SET cuerpo =
'Hola {{cliente_nombre}}, buen día. Revisamos tu comprobante de ${{monto}} MXN para {{tipo_servicio}} pero no pudimos validarlo. Motivo: {{motivo}}. Por favor repórtalo de nuevo desde tu portal.'
WHERE tipo = 'reporte_pago_rechazado' AND canal = 'whatsapp';

UPDATE plantillas_notificacion SET asunto = 'Ya está disponible tu factura de {{tipo_servicio}}', cuerpo =
'<p>Hola {{cliente_nombre}}, buen día.</p><p>Ya está disponible una nueva factura de <strong>{{tipo_servicio}}</strong> ({{numero_contrato}}) en tu portal de cliente.</p><p>Puedes descargarla ingresando a tu portal.</p><p>Saludos,<br>Equipo Appgom</p>'
WHERE tipo = 'factura_subida' AND canal = 'email';

UPDATE plantillas_notificacion SET cuerpo =
'Hola {{cliente_nombre}}, buen día. Ya está disponible tu factura de {{tipo_servicio}} ({{numero_contrato}}) en tu portal de cliente.'
WHERE tipo = 'factura_subida' AND canal = 'whatsapp';

UPDATE plantillas_notificacion SET asunto = '[Admin] Pago con tarjeta recibido — {{tipo_servicio}}', cuerpo =
'<p>{{cliente_nombre}} pagó ${{monto}} MXN con tarjeta para {{tipo_servicio}} el {{fecha}}.</p>'
WHERE tipo = 'alerta_admin_pago_stripe' AND canal = 'email';

UPDATE plantillas_notificacion SET cuerpo =
'{{cliente_nombre}} pagó ${{monto}} MXN con tarjeta para {{tipo_servicio}} ({{fecha}}).'
WHERE tipo = 'alerta_admin_pago_stripe' AND canal = 'whatsapp';
