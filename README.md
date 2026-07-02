# CRM Appgom — Sistema de gestión de clientes, contratos y cobros

Sistema interno para administrar clientes, contratos de servicios, pagos y
recordatorios de vencimiento. Ver [plan-sistema-clientes-appcom.md](plan-sistema-clientes-appcom.md)
para el plan completo por fases.

Fase actual: **Fase 1 — Núcleo (MVP)**.

## Stack

- Node.js + Express
- PostgreSQL (vía Docker)
- pg (driver nativo, sin ORM)

## Requisitos

- Node.js v20 o superior
- Docker Desktop (para levantar PostgreSQL localmente)

## Instalación en una máquina nueva

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

5. Correr las migraciones (crea las tablas `clientes`, `contratos`, `pagos`, `notificaciones_log`):
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

### Contratos
- `GET /api/contratos`
- `GET /api/contratos/:id`
- `POST /api/contratos` — body: `{ cliente_id, tipo_servicio, descripcion, numero_contrato, monto, periodicidad, fecha_inicio, fecha_proximo_vencimiento, estatus }`
- `PUT /api/contratos/:id`
- `DELETE /api/contratos/:id`
- `GET /api/contratos/:id/saldo` — calcula saldo pendiente y días de atraso
- `GET /api/contratos/:contratoId/pagos` — lista pagos de un contrato

### Pagos
- `POST /api/pagos` — body: `{ contrato_id, fecha, monto, metodo, referencia }`
  - `metodo` acepta: `transferencia`, `efectivo`, `tarjeta`, `stripe` (este último queda listo para la integración de Fase 2)

## Pendiente (siguientes pasos de Fase 1)

- Cron diario de recordatorios de vencimiento (correo vía Resend)
- Vista de "quién me debe / qué vence pronto"

## Despliegue a SiteGround

No implementado todavía — se documentará cuando el núcleo esté probado localmente.
