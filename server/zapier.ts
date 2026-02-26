type ZapierEventType =
  | "lead.created"
  | "booking.created"
  | "booking.confirmed"
  | "booking.paid"
  | "tour_booking.created"
  | "tour_booking.confirmed"
  | "tour_booking.paid";

function envKeyForEvent(type: ZapierEventType) {
  // booking.created -> ZAPIER_WEBHOOK_URL_BOOKING_CREATED
  return `ZAPIER_WEBHOOK_URL_${type.toUpperCase().replace(/\./g, "_")}`;
}

function pickZapierWebhookUrl(type: ZapierEventType) {
  return process.env[envKeyForEvent(type)] || process.env.ZAPIER_WEBHOOK_URL || "";
}

export function getZapierInboundSecret() {
  return process.env.ZAPIER_INBOUND_SECRET || process.env.ZAPIER_SECRET || "";
}

export async function emitZapierEvent(type: ZapierEventType, payload: unknown) {
  const url = pickZapierWebhookUrl(type);
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
      console.error(`[zapier] ${type} failed: ${res.status} ${txt}`.slice(0, 500));
    }
  } catch (e: any) {
    console.error(`[zapier] ${type} error:`, e?.message || e);
  }
}

