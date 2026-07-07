# Prompt para prediseño de frontend — CRM Appgom

Copia este bloque en Claude Design / Google Stitch para generar el prediseño visual.

```
Diseña la interfaz web de un panel administrativo interno (no orientado al
público) para gestionar clientes, contratos de servicios y cobros de una
empresa de servicios tecnológicos llamada Appcom (desarrollo web, apps,
campañas de marketing, hosting, dominios).

Uso: exclusivamente interno, lo opera una sola persona (dueño/administrador
de la empresa) desde escritorio, no requiere versión pública ni multiusuario
por ahora.

Estilo visual: profesional, limpio, tipo SaaS B2B (piensa en Stripe Dashboard,
Linear o Notion). Paleta de colores neutra con un color de acento (azul o
verde), tipografía sans-serif moderna. Nada infantil ni sobrecargado.

Estructura de navegación (sidebar izquierdo fijo):
- Dashboard / Inicio
- Clientes
- Contratos
- Pagos
- Cuentas por cobrar (vencimientos)
- Proveedores / Cuentas por pagar (fase futura, puede ir deshabilitado o con
  badge "próximamente")
- Configuración

Pantallas a diseñar:

1. **Dashboard / Inicio**
   - Tarjetas resumen arriba: total por cobrar este mes, clientes con pago
     vencido, próximos vencimientos (7 días), ingresos del mes.
   - Tabla o lista de "Vencimientos próximos" con cliente, contrato, monto,
     fecha de vencimiento, días de atraso (resaltar en rojo si está vencido).

2. **Listado de Clientes**
   - Tabla con nombre, email, teléfono, número de contratos activos, estatus
     general (al corriente / con adeudo).
   - Botón "Nuevo cliente" arriba a la derecha.
   - Buscador simple por nombre/email.

3. **Detalle de Cliente**
   - Datos del cliente arriba.
   - Lista de sus contratos (tipo de servicio, monto, periodicidad, próximo
     vencimiento, estatus) con opción de ver el historial de pagos de cada uno.

4. **Listado de Contratos**
   - Tabla con cliente, tipo de servicio, monto, periodicidad, fecha próximo
     vencimiento, estatus (activo/cancelado), saldo pendiente.
   - Filtros por estatus y por tipo de servicio.

5. **Detalle de Contrato**
   - Info del contrato.
   - Historial de pagos en tabla (fecha, monto, método, referencia).
   - Botón "Registrar pago" que abre un formulario/modal (fecha, monto,
     método: transferencia/efectivo/tarjeta, referencia).

6. **Formulario Nuevo Contrato / Nuevo Cliente**
   - Modal o vista dedicada, campos simples y claros, validación visible.

Componentes reutilizables que necesito ver definidos:
- Sidebar de navegación
- Tabla de datos con paginación
- Tarjeta de métrica (KPI card)
- Badge de estatus (activo/vencido/cancelado, con colores distintos)
- Modal/formulario genérico
- Botón primario y secundario

No incluyas login/autenticación en este prediseño — el sistema no lo requiere
todavía. Enfócate en que la información sea fácil de escanear rápidamente:
esta persona revisa el sistema varias veces por semana para saber quién le
debe y qué vence pronto.
```

## Una vez tengas el resultado

Pásame:
1. Capturas o el export del prediseño.
2. Cualquier ajuste que quieras hacerle antes de programarlo.
3. Si tienes logo/colores oficiales de Appcom, compártelos también — se
   pueden aplicar sobre el layout ya aprobado sin rehacer la estructura.

Con eso decidimos el framework definitivo (mi recomendación por defecto es
React + Vite + Tailwind, pero se ajusta según lo que el prediseño requiera)
y empezamos a maquetarlo sobre el backend ya construido.
