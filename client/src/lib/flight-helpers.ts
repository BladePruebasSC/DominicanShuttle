import { format } from "date-fns";
import { es } from "date-fns/locale";

/** Extrae YYYY-MM-DD de un valor de formulario o ISO. */
export function normalizeYmd(value: string | null | undefined): string | null {
  if (!value) return null;
  const m = String(value).trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

/** Parsea YYYY-MM-DD en mediodía local (evita saltos de día por UTC). */
export function parseYmdLocal(ymd: string | null | undefined): Date | null {
  const n = normalizeYmd(ymd);
  if (!n) return null;
  const [y, mo, d] = n.split("-").map(Number);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, mo - 1, d, 12, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatYmdLongEs(ymd: string | null | undefined): string {
  const n = normalizeYmd(ymd);
  if (!n) return "";
  const d = parseYmdLocal(n);
  if (!d) return n;
  try {
    return format(d, "EEEE d MMMM yyyy", { locale: es });
  } catch {
    return n;
  }
}

export function formatYmdShortEs(ymd: string | null | undefined): string {
  const n = normalizeYmd(ymd);
  if (!n) return "";
  const d = parseYmdLocal(n);
  if (!d) return n;
  try {
    return format(d, "PPP", { locale: es });
  } catch {
    return n;
  }
}

/** Valor de pickupDate del formulario (Date o ISO) → Date segura para calendario. */
export function parsePickupFieldDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }
  const ymd = normalizeYmd(String(value));
  if (ymd) return parseYmdLocal(ymd) ?? undefined;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function formatPickupDisplay(value: unknown): string {
  const d = parsePickupFieldDate(value);
  if (!d) return "";
  try {
    return format(d, "PPP", { locale: es });
  } catch {
    return "";
  }
}

/** Primer ISO válido entre candidatos (AviationStack suele mandar scheduled/estimated/actual). */
export function firstValidDate(...candidates: Array<string | null | undefined>): Date | null {
  for (const c of candidates) {
    if (!c) continue;
    const d = new Date(c);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

/** Minutos después de la llegada del vuelo para sugerir recogida en aeropuerto → hotel. */
export const PICKUP_AFTER_ARRIVAL_MINUTES = 15;

function formatLocalYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatLocalHhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Redondea hacia arriba al cuarto de hora (selectores 00/15/30/45). */
export function roundTimeUpToQuarterHour(hhmm: string): string {
  const parts = hhmm.split(":");
  const h = Number(parts[0]) || 0;
  const m = Number(parts[1]) || 0;
  let total = h * 60 + m;
  total = Math.ceil(total / 15) * 15;
  if (total >= 24 * 60) total = 23 * 60 + 45;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export type FlightArrivalLeg = {
  scheduled?: string | null;
  estimated?: string | null;
  actual?: string | null;
};

export function arrivalDateTimeFromVerification(verification: {
  arrival?: FlightArrivalLeg | null;
} | null | undefined): Date | null {
  return firstValidDate(
    verification?.arrival?.actual,
    verification?.arrival?.estimated,
    verification?.arrival?.scheduled,
  );
}

/** Fecha del vuelo (YYYY-MM-DD) priorizando la llegada reportada por la API. */
export function flightDateYmdFromVerification(verification: {
  raw?: { flightDate?: unknown };
  arrival?: FlightArrivalLeg | null;
} | null | undefined): string | null {
  const iso =
    verification?.arrival?.actual ||
    verification?.arrival?.estimated ||
    verification?.arrival?.scheduled;
  if (iso) {
    const match = String(iso).trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const raw = verification?.raw?.flightDate;
  if (raw) {
    const s = String(raw).trim();
    if (s.length >= 10) return s.slice(0, 10);
  }
  const arrival = arrivalDateTimeFromVerification(verification);
  if (arrival) return formatLocalYmd(arrival);
  return null;
}

/** Suma minutos a YYYY-MM-DD + HH:mm sin cambiar de día salvo desborde de medianoche. */
function addMinutesToYmdAndTime(
  ymd: string,
  hhmm: string,
  minutes: number,
): { pickupDateYmd: string; pickupTimeHHmm: string; pickupAt: Date } {
  const [y, mo, d] = ymd.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  const pickupAt = new Date(y, mo - 1, d, h, mi + minutes, 0, 0);
  return {
    pickupDateYmd: formatLocalYmd(pickupAt),
    pickupTimeHHmm: formatLocalHhmm(pickupAt),
    pickupAt,
  };
}

function pickupFromIsoLiteral(
  iso: string,
  minutesAfterArrival: number,
): { pickupDateYmd: string; pickupTimeHHmm: string; pickupAt: Date } | null {
  const match = String(iso).trim().match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/);
  if (!match) return null;
  return addMinutesToYmdAndTime(match[1], `${match[2]}:${match[3]}`, minutesAfterArrival);
}

/** Recogida sugerida: fecha/hora de llegada de la API + 15 min (misma fecha que muestra el vuelo). */
export function pickupSuggestionFromFlightArrival(
  verification: { arrival?: FlightArrivalLeg | null } | null | undefined,
  minutesAfterArrival: number = PICKUP_AFTER_ARRIVAL_MINUTES,
): { pickupDateYmd: string; pickupTimeHHmm: string; pickupAt: Date } | null {
  const iso =
    verification?.arrival?.actual ||
    verification?.arrival?.estimated ||
    verification?.arrival?.scheduled;
  if (iso) {
    const fromLiteral = pickupFromIsoLiteral(iso, minutesAfterArrival);
    if (fromLiteral) return fromLiteral;
  }

  const arrival = arrivalDateTimeFromVerification(verification);
  if (!arrival) return null;

  const pickupAt = new Date(arrival.getTime() + minutesAfterArrival * 60 * 1000);
  return {
    pickupDateYmd: formatLocalYmd(pickupAt),
    pickupTimeHHmm: formatLocalHhmm(pickupAt),
    pickupAt,
  };
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
