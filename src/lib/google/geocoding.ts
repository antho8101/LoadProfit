/**
 * Server-side Geocoding API (Google Maps Platform).
 * https://developers.google.com/maps/documentation/geocoding
 */

export type GeocodeResult = {
  lat: number;
  lng: number;
  formattedAddress: string;
};

function parseLatLng(raw: unknown): { lat: number; lng: number } | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const lat = o.lat;
  const lng = o.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

/**
 * Geocode a free-text address. Returns null if the API reports no usable result.
 */
export async function geocodeAddress(
  address: string,
  apiKey: string,
): Promise<GeocodeResult | null> {
  const q = address.trim();
  if (!q) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", q);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data: unknown = await res.json();
  if (!data || typeof data !== "object") return null;
  const doc = data as Record<string, unknown>;
  if (doc.status !== "OK") return null;

  const results = doc.results;
  if (!Array.isArray(results) || results.length === 0) return null;

  const first = results[0];
  if (!first || typeof first !== "object") return null;
  const r = first as Record<string, unknown>;
  const geometry = r.geometry;
  if (!geometry || typeof geometry !== "object") return null;
  const loc = (geometry as Record<string, unknown>).location;
  const coords = parseLatLng(loc);
  if (!coords) return null;

  const formatted =
    typeof r.formatted_address === "string" && r.formatted_address.trim()
      ? r.formatted_address.trim()
      : q;

  return {
    lat: coords.lat,
    lng: coords.lng,
    formattedAddress: formatted,
  };
}
