/**
 * Google Routes API — computeRoutes (driving distance & duration).
 * https://developers.google.com/maps/documentation/routes/compute_route_directions
 */

export type ComputeRouteResult = {
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number | null;
  source: "google_routes";
};

function parseDurationSeconds(raw: unknown): number | null {
  if (typeof raw === "string") {
    const s = raw.trim();
    if (s.endsWith("s")) {
      const n = Number(s.slice(0, -1));
      return Number.isFinite(n) && n >= 0 ? n : null;
    }
    const n = Number(s);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }
  if (raw && typeof raw === "object") {
    const sec = (raw as Record<string, unknown>).seconds;
    if (typeof sec === "string") {
      const n = Number(sec);
      return Number.isFinite(n) && n >= 0 ? n : null;
    }
    if (typeof sec === "number" && Number.isFinite(sec) && sec >= 0) return sec;
  }
  return null;
}

function parseDistanceMeters(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return raw;
  if (typeof raw === "string") {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/**
 * Minimal driving route: TRAFFIC_UNAWARE, no polylines, no alternatives.
 */
export async function computeDrivingRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  apiKey: string,
): Promise<ComputeRouteResult | null> {
  const body = {
    origin: {
      location: {
        latLng: {
          latitude: origin.lat,
          longitude: origin.lng,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: destination.lat,
          longitude: destination.lng,
        },
      },
    },
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_UNAWARE",
  };

  const res = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) return null;

  const data: unknown = await res.json();
  if (!data || typeof data !== "object") return null;
  const top = data as Record<string, unknown>;
  if (top.error && typeof top.error === "object") return null;

  const routes = top.routes;
  if (!Array.isArray(routes) || routes.length === 0) return null;

  const route = routes[0];
  if (!route || typeof route !== "object") return null;
  const r = route as Record<string, unknown>;

  const distanceMeters = parseDistanceMeters(r.distanceMeters);
  if (distanceMeters === null) return null;

  const durationSeconds = parseDurationSeconds(r.duration);

  const distanceKm = Math.round((distanceMeters / 1000) * 1000) / 1000;

  return {
    distanceMeters,
    distanceKm,
    durationSeconds,
    source: "google_routes",
  };
}
