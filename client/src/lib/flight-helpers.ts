/** Primer ISO válido entre candidatos (AviationStack suele mandar scheduled/estimated/actual). */
export function firstValidDate(...candidates: Array<string | null | undefined>): Date | null {
  for (const c of candidates) {
    if (!c) continue;
    const d = new Date(c);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

/**
 * Buffer antes del despegue para recogida hotel → aeropuerto (ida de vuelta).
 * Base 2h 30m + extra por zona (tráfico / distancia típica al aeropuerto).
 */
export function pickupBufferMinutesBeforeDeparture(origin: string, destination: string): number {
  const hay = `${origin} ${destination}`.toLowerCase();
  let extra = 0;
  if (hay.includes("uvero") || hay.includes("miches") || hay.includes("bayahíbe") || hay.includes("bayahibe")) {
    extra = 45;
  } else if (hay.includes("cap cana") || hay.includes("capcana")) {
    extra = 25;
  } else if (hay.includes("bávaro") || hay.includes("bavaro")) {
    extra = 15;
  } else if (hay.includes("jarabacoa") || hay.includes("constanza")) {
    extra = 40;
  } else if (hay.includes("santo domingo") || hay.includes("malecón") || hay.includes("malecon")) {
    extra = 30;
  }
  return 150 + extra;
}

export function flightVerifyCacheKey(leg: "inbound" | "outbound", flightNumber: string, flightDate?: string) {
  return `flightVerify:${leg}:${flightNumber}|${flightDate || ""}`;
}

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

function pushIsoYmd(out: string[], iso: string | null | undefined) {
  if (!iso) return;
  const s = String(iso).trim();
  if (s.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(s)) out.push(s.slice(0, 10));
}

/** Fechas de calendario (YYYY-MM-DD) que el proveedor asocia al vuelo (útil para comparar con la fecha que elige el usuario). */
export function flightVerificationCalendarDates(verification: {
  raw?: { flightDate?: unknown };
  departure?: { scheduled?: string; estimated?: string; actual?: string };
  arrival?: { scheduled?: string; estimated?: string; actual?: string };
} | null | undefined): string[] {
  if (!verification) return [];
  const out: string[] = [];
  const raw = verification.raw?.flightDate;
  if (raw) pushIsoYmd(out, String(raw));
  for (const leg of [verification.departure, verification.arrival]) {
    if (!leg) continue;
    pushIsoYmd(out, leg.scheduled);
    pushIsoYmd(out, leg.estimated);
    pushIsoYmd(out, leg.actual);
  }
  return Array.from(new Set(out));
}

/**
 * Si el usuario eligió una fecha de vuelo (YYYY-MM-DD) y la verificación trae otra fecha de calendario
 * en `flight_date` o en horarios ISO, a veces difieren por UTC aunque sea el mismo vuelo.
 * Devuelve true solo cuando conviene **invalidar** la verificación guardada en UI.
 */
export function shouldClearFlightVerificationForDateMismatch(
  verification: {
    raw?: { flightDate?: unknown };
    departure?: { scheduled?: string; estimated?: string; actual?: string };
    arrival?: { scheduled?: string; estimated?: string; actual?: string };
  } | null | undefined,
  userFlightDate: string | undefined,
): boolean {
  if (!verification) return false;
  const ymd = userFlightDate ? String(userFlightDate).slice(0, 10) : "";
  if (!ymd || !YMD_RE.test(ymd)) return false;

  const fromApi = flightVerificationCalendarDates(verification);
  if (fromApi.length === 0) return false;

  return !fromApi.includes(ymd);
}
