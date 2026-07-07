# CRM Appgom — Sistema de gestión de clientes, contratos y cobros

Sistema interno para administrar clientes, contratos de servicios, pagos y
recordatorios de vencimiento. Ver [plan-sistema-clientes-appcom.md](plan-sistema-clientes-appcom.md)
para el plan completo por fases.

Fase actual: **Fase 1 — Núcleo (MVP)**.

## Stack

- Backend: Node.js + Express + PostgreSQL (vía Docker), pg (driver nativo, sin ORM)
- Frontend: React + Vite + Tailwind CSS (carpeta `frontend/`), diseño basado en el
  prediseño de [Google Stitch](prompt-frontend-prediseno.md)

## Requisitos

- Node.js v20 o superior
- Docker Desktop (para levantar PostgreSQL localmente)

## Backend — Instalación en una máquina nueva

1. Clonar el repositorio:
   ```
   git clone <url-del-repo>
   cd CRM-APPGOM
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Copiar el archivo de variables de entorno de ejemplo:
   ```
   cp .env.example .env
   ```
   Ajustar valores si es necesario (por defecto ya funcionan con el `docker-compose.yml` incluido).

4. Levantar PostgreSQL con Docker:
   ```
   docker compose up -d
   ```

5. Correr las migraciones (crea las tablas `clientes`, `contratos`, `pagos`, `notificaciones_log`,
   `catalogo_servicios`, `cargos`):
   ```
   npm run migrate
   ```

6. Levantar el servidor:
   ```
   npm run dev
   ```
   El servidor queda disponible en `http://localhost:3000`. Puedes verificar que
   está vivo en `GET /health`.

## Variables de entorno

Ver [.env.example](.env.example). No se versiona el archivo `.env` real.

## Endpoints disponibles (Fase 1)

### Clientes
- `GET /api/clientes`
- `GET /api/clientes/:id`
- `POST /api/clientes` — body: `{ nombre, email, telefono }`
- `PUT /api/clientes/:id`
- `DELETE /api/clientes/:id`

### Catálogo de servicios
- `GET /api/catalogo-servicios`
- `POST /api/catalogo-servicios` — body: `{ nombre }`
- `PUT /api/catalogo-servicios/:id` — body: `{ nombre, activo }`

### Contratos
- `GET /api/contratos`
- `GET /api/contratos/:id`
- `POST /api/contratos` — body: `{ cliente_id, tipo_servicio_id, descripcion, numero_contrato, monto, periodicidad, fecha_inicio, fecha_proximo_vencimiento, estatus, modalidad_facturacion }`
  - `modalidad_facturacion` acepta: `recurrente` (default), `bolsa_horas`, `por_ticket`. Solo `recurrente`
    genera cargos automáticos por ahora; las otras dos quedan reservadas en el modelo de datos para una
    fase posterior.
  - Al crear un contrato `recurrente` se genera automáticamente su primer `cargo` (el cobro del periodo
    actual), con `fecha_vencimiento = fecha_proximo_vencimiento` y `monto = monto del contrato`.
- `PUT /api/contratos/:id`
- `DELETE /api/contratos/:id`
- `GET /api/contratos/:id/saldo` — saldo pendiente y días de atraso del cargo actual
- `GET /api/contratos/:id/cargos` — historial de cargos (periodos de cobro) del contrato
- `GET /api/contratos/:contratoId/pagos` — lista pagos de un contrato

### Pagos
- `POST /api/pagos` — body: `{ contrato_id | cargo_id, fecha, monto, metodo, referencia }`
  - Se requiere `contrato_id` o `cargo_id` (si solo se manda `cargo_id`, el `contrato_id` se resuelve solo).
  - `metodo` acepta: `transferencia`, `efectivo`, `tarjeta`, `stripe` (este último queda listo para la integración de Fase 2)
  - Al liquidar por completo un `cargo` de un contrato `recurrente` activo, el sistema avanza
    `fecha_proximo_vencimiento` según la `periodicidad` y genera el siguiente cargo automáticamente.

### Vencimientos
- `GET /api/vencimientos` — "quién me debe / qué vence pronto": lista todos los cargos pendientes o
  parciales con datos del cliente y del contrato, saldo pendiente y días de atraso.

## Frontend — Instalación

1. Instalar dependencias:
   ```
   cd frontend
   npm install
   ```
2. Levantar el servidor de desarrollo (requiere el backend corriendo en `http://localhost:3000`):
   ```
   npm run dev
   ```
   Queda disponible en `http://localhost:5173`.

Por defecto el frontend consume la API en `http://localhost:3000/api`. Para apuntar a otra URL,
crea `frontend/.env` con `VITE_API_URL=http://tu-host/api`.

### Páginas implementadas
- Dashboard (KPIs + vencimientos próximos)
- Clientes (listado + alta)
- Detalle de cliente (info + contratos asociados)
- Contratos (listado con filtros + alta)
- Detalle de contrato (saldo, historial de pagos, registrar pago)
- Cuentas por cobrar (todos los cargos pendientes)
- Configuración (catálogo de servicios editable)

## Pendiente (siguientes pasos de Fase 1)

- Cron diario de recordatorios de vencimiento (correo vía Resend): 3 avisos al cliente (7 días antes,
  el día del vencimiento, y ya vencido) y alerta al admin en cada uno de esos casos. Pendiente de la
  API key de Resend.
- Lógica de consumo para `bolsa_horas` y `por_ticket` (fase posterior).

## Despliegue a SiteGround

No implementado todavía — se documentará cuando el núcleo esté probado localmente.
