# Integración Zapier + HubSpot (Reservas / Leads)

Este proyecto ya incluye:

- **Eventos outbound hacia Zapier** (desde el backend Express)
- **Webhook inbound desde Zapier** (para actualizar IDs/estados en la BD)
- **Endpoint de métricas** para dashboard y reportes diarios

## 1) Migración de base de datos (Supabase)

Ejecuta la migración:

- `migrations/013_add_zapier_hubspot_fields.sql`

Esto agrega campos en:

- `bookings`: `lead_source`, `zapier_lead_id`, `hubspot_deal_id`, `hubspot_contact_id`, `confirmed_at`, `paid_at`
- `tour_bookings`: mismos campos
- `contact_messages`: `lead_source`, `zapier_lead_id`, `hubspot_deal_id`, `hubspot_contact_id`

## 2) Variables de entorno

En tu entorno (Netlify/Render/VPS), configura:

- **Supabase**
  - `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (solo backend)
- **Zapier**
  - `ZAPIER_WEBHOOK_URL` (fallback general) o por-evento:
    - `ZAPIER_WEBHOOK_URL_BOOKING_CREATED`
    - `ZAPIER_WEBHOOK_URL_BOOKING_CONFIRMED`
    - `ZAPIER_WEBHOOK_URL_BOOKING_PAID`
    - `ZAPIER_WEBHOOK_URL_TOUR_BOOKING_CREATED`
    - `ZAPIER_WEBHOOK_URL_TOUR_BOOKING_CONFIRMED`
    - `ZAPIER_WEBHOOK_URL_TOUR_BOOKING_PAID`
    - `ZAPIER_WEBHOOK_URL_LEAD_CREATED`
  - `ZAPIER_INBOUND_SECRET` (secreto compartido)

## 3) Endpoints disponibles

- **Crear reserva transporte**: `POST /api/bookings`
- **Marcar pago transporte**: `PATCH /api/bookings/:id/payment`
- **Cambiar status transporte**: `PATCH /api/bookings/:id/status`

- **Crear reserva tour**: `POST /api/tour-bookings`
- **Marcar pago tour**: `PATCH /api/tour-bookings/:id/payment`
- **Cambiar status tour**: `PATCH /api/tour-bookings/:id/status`

- **Webhook inbound Zapier → app**: `POST /api/zapier/inbound`
  - Header requerido: `x-zapier-secret: <ZAPIER_INBOUND_SECRET>` (o `?secret=...`)
  - Body ejemplo:
    ```json
    {
      "entityType": "booking",
      "entityId": "uuid",
      "hubspotDealId": "12345",
      "hubspotContactId": "67890",
      "status": "confirmed",
      "paymentStatus": "paid"
    }
    ```

- **Métricas para dashboard/reportes**: `GET /api/dashboard/stats?from=YYYY-MM-DD&to=YYYY-MM-DD`

## 4) Zaps recomendados (flujo 5 pasos)

### Paso 1 — Captura (Tidio / Dashboard)

- **Dashboard reservas (web)**: ya dispara eventos:
  - `booking.created`
  - `tour_booking.created`
  - `lead.created` (por `/api/contact`)

- **Tidio** (opción recomendada):
  - Configura un webhook de Tidio → Zapier
  - En Zapier, llama a `POST /api/contact` con `leadSource: "tidio"`

### Paso 2 — Sync Tidio → HubSpot (Zapier)

Trigger en Zapier:

- **Webhooks by Zapier – Catch Hook** (URL = `ZAPIER_WEBHOOK_URL_*`)

Acciones típicas en Zapier:

- HubSpot: **Create/Update Contact**
- HubSpot: **Create Deal**
  - Nombre sugerido: `Lead Transfer #<id>`
  - Guardar el `booking.id` / `tour_booking.id` en una propiedad del deal (o en el nombre)

Luego (misma automatización):

- Webhooks by Zapier – **POST** a `POST /api/zapier/inbound` para guardar:
  - `hubspotDealId`
  - `hubspotContactId`

### Paso 3 — Confirmación / Pago

Cuando tu app marque una reserva:

- `booking.confirmed` / `tour_booking.confirmed`
- `booking.paid` / `tour_booking.paid`

Zapier recibe esos eventos y:

- HubSpot: **Update Deal stage** a “Confirmada” / “Pagada”

### Paso 4 — Notificaciones siempre (admins/dueños)

En Zapier:

- Slack: enviar mensaje a canal admins
- Email: resumen a dueños
- Reporte diario:
  - Trigger: **Schedule by Zapier**
  - Action: **GET** a `/api/dashboard/stats` (rango “hoy”)
  - Action: enviar Slack/Email con métricas

### Paso 5 — Opcional suplidor (IF transporte)

En Zapier, si el evento es `booking.*`:

- Router / Filter:
  - Si aplica “transporte”, enviar WhatsApp (Twilio / WhatsApp Cloud / proveedor)
  - Mensaje: “Preparar renta [detalles]”

## 5) Nota importante (seguridad)

- El frontend **ya no debe** crear reservas directo en Supabase para los flujos críticos.
- El backend usa `SUPABASE_SERVICE_ROLE_KEY` para escribir y emitir eventos a Zapier sin exponer secretos.

