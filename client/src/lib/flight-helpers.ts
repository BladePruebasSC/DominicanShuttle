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
