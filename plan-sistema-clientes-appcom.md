# Sistema de Gestión de Clientes, Cobros y Pagos — Appcom
## Plan de desarrollo por fases + prompt inicial para Claude Code

---

## 1. Resumen del sistema

Sistema para administrar:
- Clientes y los servicios tecnológicos que tienen contratados (web, apps, campañas, hosting, dominios, etc.)
- Contratos con periodicidad de cobro variable (semanal, trimestral, anual)
- Pagos recibidos (registro manual, con soporte futuro para Stripe)
- Recordatorios automáticos de vencimiento (a cliente y a ti) por correo, con WhatsApp en fase posterior
- Cuentas por pagar a proveedores/servicios internos (SiteGround, Canva, Anthropic, etc.)
- Portal de cliente (fase futura) para consulta y pago directo

**Stack:**
- Backend: Node.js + Express
- Base de datos: PostgreSQL
- Hosting: SiteGround Cloud (8GB RAM / 4 CPU / 140GB SSD) — soporta Node.js vía Site Tools (Node.js Selector) y acceso SSH
- Envío de correo: Resend o Postmark (no usar SMTP nativo de SiteGround — problemas de entregabilidad)
- Control de versiones: GitHub (workflow ya establecido)
- Cron: cron job nativo de Linux en SiteGround

---

## 2. Flujo de trabajo local → SiteGround

Puedes trabajar en local con Claude Code y subir a SiteGround así:

1. **Desarrollo local:** Node.js + PostgreSQL corriendo en tu máquina (Docker opcional solo para la base de datos, no es obligatorio — puedes instalar Postgres nativo).
2. **Repositorio:** GitHub, como ya trabajas. Rama `main` = producción, ramas de feature para cada módulo/fase.
3. **Deploy a SiteGround:** dos opciones:
   - **Manual/simple:** SSH a SiteGround, `git pull`, `npm install`, reiniciar el proceso Node vía Site Tools.
   - **Automatizado:** GitHub Actions que haga SSH deploy en cada push a `main` (te lo puedo configurar cuando lleguemos a esa fase; no es bloqueante ahora).
4. **Variables de entorno:** `.env` distinto en local vs. SiteGround (igual que ya documentas en tu README para otros proyectos).

No necesitas Vercel aquí — Vercel no soporta bien procesos de backend persistentes con cron + Postgres self-hosted de la forma en que lo necesitas; SiteGround Cloud sí, porque es una VM real.

---

## 3. Plan de desarrollo por fases

### Fase 1 — Núcleo (MVP funcional)
**Objetivo:** saber qué tiene cada cliente, cuánto debe, cuándo vence, y que se manden recordatorios por correo.

**Incluye:**
- CRUD de clientes
- CRUD de contratos/servicios (tipo, descripción, monto, periodicidad, fecha inicio, próximo vencimiento)
- Registro manual de pagos (transferencia/efectivo/tarjeta, con campo `referencia`)
- Cálculo automático de saldo/atraso por contrato
- Vista de "quién me debe / qué vence pronto"
- Cron diario que revisa vencimientos y dispara correos (a ti y al cliente)
- Diseño de base de datos ya preparado para Stripe y cuentas por pagar (sin implementarlos aún)

**Costo/tiempo estimado:** este es el módulo de mayor prioridad y el que define la arquitectura base. Con Claude Code trabajando de forma dirigida, es razonable tenerlo funcional en un rango de 2-3 semanas de trabajo efectivo, dependiendo de cuánto tiempo puedas dedicar a revisar y probar cada entrega.

---

### Fase 2 — Integración con Stripe
**Objetivo:** que los clientes que lo pidan puedan pagar con tarjeta, incluyendo cargos recurrentes.

**Incluye:**
- Checkout de Stripe para pago único o Payment Links
- Stripe Subscriptions para clientes con cobro recurrente automático
- Webhook que registra el pago en la tabla `pagos` automáticamente (mismo modelo que el registro manual)
- Manejo de pagos fallidos/reintentos

**Costo/tiempo estimado:** esto es una integración de complejidad media-alta por el manejo de webhooks, reintentos y sincronización de estados. Se estima como un bloque independiente de desarrollo, separado del núcleo, una vez que el núcleo esté estable.

---

### Fase 3 — Portal de cliente
**Objetivo:** que el cliente entre y vea sus contratos, saldo, historial de pagos, y pueda pagar directo.

**Incluye:**
- Autenticación de clientes (JWT o sesiones)
- Vista de solo lectura de sus contratos y pagos
- Botón de pago (usa la integración de Stripe de la Fase 2)

**Nota de costo:** requiere manejo serio de seguridad (control de acceso para que un cliente no vea datos de otro) — no es solo "una pantalla más".

---

### Fase 4 — Cuentas por pagar (proveedores internos)
**Objetivo:** controlar pagos a SiteGround, Canva, Anthropic y demás servicios de Appcom.

**Incluye:**
- Tablas separadas: `proveedores`, `pagos_proveedores` (no comparten tablas con clientes, por lógica de negocio distinta)
- Recordatorios de vencimiento de pago a proveedor (a ti)
- Reporte de gasto fijo mensual/anual de la empresa

**Nota:** módulo independiente, se puede desarrollar en paralelo a Fase 2 o 3 sin dependencias entre ellos.

---

### Fase 5 — WhatsApp
**Objetivo:** recordatorios por WhatsApp además de correo.

**Incluye:**
- Integración con WhatsApp Business API (requiere proceso de aprobación con Meta, y tiene costo por mensaje)
- Mismo motor de recordatorios de Fase 1, agregando el canal WhatsApp

---

## 4. Prompt inicial para Claude Code

Copia este bloque completo como primer mensaje al iniciar el proyecto con Claude Code (o Cursor/Antigravity — es agnóstico de herramienta):

```
Contexto del proyecto:

Voy a desarrollar un sistema de gestión de clientes, contratos y cobros para
Appcom, una empresa de servicios tecnológicos (desarrollo web, apps, campañas,
hosting, dominios). El sistema debe permitir:

1. Registrar clientes y los servicios/contratos que tienen activos
2. Calcular cuánto debe cada cliente y cuándo vence su próximo pago
3. Registrar pagos recibidos manualmente (transferencia, efectivo, tarjeta)
4. Enviar recordatorios automáticos por correo (a mí y al cliente) antes/al
   vencer un pago

Stack definido:
- Backend: Node.js + Express
- Base de datos: PostgreSQL
- Envío de correo: Resend (usar su SDK oficial, no SMTP genérico)
- Despliegue final: SiteGround Cloud (VM con soporte Node.js vía Site Tools),
  pero por ahora trabajamos en local
- Control de versiones: Git, con commits usando prefijo "wip:" antes de
  cerrar cada sesión de trabajo, y un README.md que documente el setup del
  entorno local

IMPORTANTE — diseño para escalabilidad futura (no implementar todavía, pero
dejar la estructura lista):
- La tabla de pagos debe soportar un campo `metodo` (transferencia | efectivo |
  tarjeta | stripe) y un campo `referencia` (folio o ID externo), para que en
  el futuro un webhook de Stripe pueda insertar pagos sin cambiar el esquema
- No implementar autenticación de clientes ni portal todavía — el sistema es
  de uso interno (solo yo lo voy a operar) en esta fase
- No implementar Stripe todavía — solo dejar el campo `metodo` listo

Modelo de datos inicial (Fase 1):

    clientes
      id, nombre, email, telefono, created_at

    contratos
      id, cliente_id (FK), tipo_servicio, descripcion, numero_contrato,
      monto, periodicidad (enum: semanal, quincenal, mensual, trimestral, anual),
      fecha_inicio, fecha_proximo_vencimiento, estatus (activo, cancelado),
      created_at

    pagos
      id, contrato_id (FK), fecha, monto,
      metodo (enum: transferencia, efectivo, tarjeta, stripe),
      referencia, created_at

    notificaciones_log
      id, contrato_id (FK), tipo (recordatorio_cliente, alerta_admin),
      fecha_envio, canal (email, whatsapp), estatus_envio, created_at

Tareas para esta primera sesión:

1. Inicializar el proyecto Node.js + Express con estructura de carpetas clara
   (routes, controllers, models, config, migrations)
2. Configurar conexión a PostgreSQL usando variables de entorno (.env,
   con .env.example documentado)
3. Crear las migraciones SQL para las 4 tablas del modelo de datos anterior
4. Crear endpoints CRUD básicos para clientes y contratos (sin autenticación
   por ahora, esto es uso interno local)
5. Crear un endpoint que calcule, para un contrato dado, el saldo pendiente
   y días de atraso (comparando fecha_proximo_vencimiento y periodicidad
   contra los pagos registrados)
6. Documentar en README.md cómo levantar el proyecto en una máquina nueva
   (instalación de dependencias, variables de entorno, cómo correr las
   migraciones)

No implementes frontend todavía — primero backend y modelo de datos
funcionando y probado con Postman/Thunder Client o similar.

Pregúntame si necesitas aclarar algo del modelo de datos antes de empezar
a escribir código.
```

---

## 5. Notas para cuando avances de fase

- Cuando llegues a Fase 2 (Stripe), dímelo y te doy el prompt específico de esa integración — no lo incluyo ahora para no saturar el alcance de la Fase 1.
- Lo mismo para Fase 3 (portal) y Fase 4 (proveedores): cada uno con su propio prompt cuando el núcleo esté probado.
- Guarda este documento como referencia — el modelo de datos de Fase 1 es la base sobre la que se construyen todas las fases siguientes sin necesidad de rehacer nada.
