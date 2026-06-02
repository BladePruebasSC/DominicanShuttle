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

/** Solo cacheamos verificaciones exitosas para no “atascar” errores transitorios del proveedor. */
export function readFlightVerifyCache(key: string): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed?.verified) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeFlightVerifyCache(key: string, result: Record<string, unknown> | null | undefined) {
  try {
    if (result?.verified) {
      sessionStorage.setItem(key, JSON.stringify(result));
    }
  } catch {
    // ignore
  }
}

export type FlightBookingFields = {
  flightNumber: string | null;
  flightDate: string | null;
  flightVerified: boolean;
  flightStatus: string | null;
  flightAirline: string | null;
  flightDepartureIata: string | null;
  flightArrivalIata: string | null;
};

export function flightFieldsFromVerification(
  verification: {
    verified?: boolean;
    flightNumber?: string;
    status?: string | null;
    airline?: { name?: string } | null;
    departure?: { iata?: string } | null;
    arrival?: { iata?: string } | null;
    raw?: { flightDate?: unknown };
  } | null | undefined,
  fallbackFlightNumber?: string,
  fallbackFlightDate?: string,
): FlightBookingFields {
  const fn = String(verification?.flightNumber || fallbackFlightNumber || "")
    .replace(/\s+/g, "")
    .toUpperCase();
  const rawDate = verification?.raw?.flightDate;
  const flightDate =
    (fallbackFlightDate ? String(fallbackFlightDate).slice(0, 10) : null) ||
    (rawDate ? String(rawDate).slice(0, 10) : null);

  return {
    flightNumber: fn || null,
    flightDate,
    flightVerified: Boolean(verification?.verified),
    flightStatus: verification?.status ?? null,
    flightAirline: verification?.airline?.name ?? null,
    flightDepartureIata: verification?.departure?.iata ?? null,
    flightArrivalIata: verification?.arrival?.iata ?? null,
  };
}

/** Reservas antiguas que solo guardaron el vuelo en specialRequests. */
export function parseFlightHintFromText(text?: string | null): string | null {
  if (!text) return null;
  const m = text.match(
    /\[(?:Flight Verified|Flight Provided|FlightRecheck|Outbound Flight Verified|Outbound Flight Provided)\]\s*([A-Z]{2,3}\d{1,4})/i,
  );
  return m?.[1]?.toUpperCase() ?? null;
}

export function resolveBookingFlightNumber(booking: {
  flightNumber?: string | null;
  specialRequests?: string | null;
}): string | null {
  const direct = String(booking.flightNumber || "").trim();
  if (direct) return direct;
  return parseFlightHintFromText(booking.specialRequests);
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
