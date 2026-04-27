type AutomationEventType =
  | "lead.created"
  | "booking.created"
  | "booking.confirmed"
  | "booking.paid"
  | "tour_booking.created"
  | "tour_booking.confirmed"
  | "tour_booking.paid";

function envKeyForEvent(prefix: string, type: AutomationEventType) {
  // booking.created -> MAKE_WEBHOOK_URL_BOOKING_CREATED
  return `${prefix}_${type.toUpperCase().replace(/\./g, "_")}`;
}

function pickAutomationWebhookUrl(type: AutomationEventType) {
  const makeByEvent = process.env[envKeyForEvent("MAKE_WEBHOOK_URL", type)];
  const zapierByEvent = process.env[envKeyForEvent("ZAPIER_WEBHOOK_URL", type)];
  return (
    makeByEvent ||
    process.env.MAKE_WEBHOOK_URL ||
    zapierByEvent ||
    process.env.ZAPIER_WEBHOOK_URL ||
    ""
  );
}

export function getAutomationInboundSecret() {
  return (
    process.env.MAKE_INBOUND_SECRET ||
    process.env.AUTOMATION_INBOUND_SECRET ||
    process.env.ZAPIER_INBOUND_SECRET ||
    process.env.ZAPIER_SECRET ||
    ""
  );
}

export async function emitAutomationEvent(type: AutomationEventType, payload: unknown) {
  const url = pickAutomationWebhookUrl(type);
  if (!url) return;

  const body = {
    type,
    occurredAt: new Date().toISOString(),
    payload,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // ayuda a evitar duplicados en Zapier (si lo soporta del lado de ellos)
        "x-idempotency-key": `${type}:${(payload as any)?.id ?? ""}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error(`[automation] ${type} failed: ${res.status} ${txt}`.slice(0, 500));
    }
  } catch (e: any) {
    console.error(`[automation] ${type} error:`, e?.message || e);
  }
}

// Backward compatibility while old imports still exist.
export const emitZapierEvent = emitAutomationEvent;
export const getZapierInboundSecret = getAutomationInboundSecret;

