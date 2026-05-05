# CocoLuxe - Prioridades de Implementacion

## Decision base (bloqueante)
- Estandar oficial: usar `navigator.geolocation + Supabase Realtime + Google Maps + Make`.
- HyperTrack queda como opcional/fase 2 para flota propia, no como dependencia del cliente final.

## Prioridad 0 (hoy mismo)
- Cerrar contradicciones de documentos y dejar una sola fuente de verdad tecnica.
- Congelar el alcance de fase 1: tracking cliente, compartir seguimiento, cierre de viaje, encuesta post-viaje.
- Definir tablas minimas obligatorias: `bookings`, `trips`, `feedback` (o `live_tracking` si se separa).

## Prioridad 1 (alto impacto negocio)
- Flujo cliente `/reserva/:id` con 4 estados:
  - Reserva confirmada sin vehiculo.
  - Vehiculo asignado.
  - Tracking activo.
  - Viaje completado.
- Regla UX critica: no mostrar "Iniciar mi viaje" sin vehiculo/placa asignados.
- Actualizacion en tiempo real por cambios de reserva/trip sin recargar pagina.

## Prioridad 2 (operacion y conversion)
- Flujo Make "Vehiculo Asignado":
  - Trigger: update en reserva cuando cambia de sin vehiculo a vehiculo asignado.
  - Accion: email + WhatsApp/SMS con placa y enlace de reserva.
- Flujo Make "Trip Completed":
  - Trigger: cierre de viaje.
  - Delay: 2 horas.
  - Accion: email + SMS con Google, TripAdvisor y encuesta interna.

## Prioridad 3 (reputacion y CRM)
- Pagina `/feedback/:id` con 3 preguntas maximo.
- Endpoint de recepcion de feedback y persistencia.
- Regla de escalamiento:
  - rating 1-2 -> alerta inmediata.
  - rating 4-5 -> agradecimiento y empuje a review publica.

## Prioridad 4 (dashboard operativo)
- Dashboard conectado a datos reales (no mock):
  - Reservas activas.
  - Estado de pagos.
  - Estado de flota.
  - Leads/CRM.
- KPIs diarios y mensuales con filtros de fecha.

## Prioridad 5 (SEO y crecimiento)
- Hreflang EN/ES/FR/PT en layout global.
- Modulo blog con datos SEO reales y job nocturno.
- Schema markup y contenido multiidioma.

## Lo que ya se avanzo en este chat
- `client/src/pages/tracking.tsx`:
  - Se elimino el requisito obligatorio de `deviceId` para iniciar viaje.
  - Se actualizo el copy para que el identificador sea opcional.
  - Se alinea el frontend con el backend actual (que ya acepta `deviceId` opcional).

## Checklist de ejecucion rapida (proximas 48h)
- Implementar pagina de feedback y endpoint (`/feedback/:id` + `POST /api/feedback`).
- Vincular trigger de encuesta 2h despues de completar viaje.
- Crear QA de 2 telefonos para validar tracking compartido.
- Correr prueba completa end-to-end con una reserva real de bajo monto.
