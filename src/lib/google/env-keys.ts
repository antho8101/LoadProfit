/**
 * Google Maps API keys from env. Prefer dedicated keys; fall back to GOOGLE_MAPS_API_KEY.
 */

function trim(v: string | undefined): string {
  return v?.trim() ?? "";
}

/** Geocoding API — uses GOOGLE_MAPS_GEOCODING_API_KEY or GOOGLE_MAPS_API_KEY. */
export function getGeocodingApiKey(): string {
  return (
    trim(process.env.GOOGLE_MAPS_GEOCODING_API_KEY) ||
    trim(process.env.GOOGLE_MAPS_API_KEY)
  );
}

/** Routes API — uses GOOGLE_MAPS_ROUTES_API_KEY or GOOGLE_MAPS_API_KEY. */
export function getRoutesApiKey(): string {
  return (
    trim(process.env.GOOGLE_MAPS_ROUTES_API_KEY) ||
    trim(process.env.GOOGLE_MAPS_API_KEY)
  );
}

export function hasRouteDistanceKeys(): boolean {
  return Boolean(getGeocodingApiKey() && getRoutesApiKey());
}

/** Places API (Autocomplete) — uses GOOGLE_MAPS_PLACES_API_KEY or GOOGLE_MAPS_API_KEY. */
export function getPlacesApiKey(): string {
  return (
    trim(process.env.GOOGLE_MAPS_PLACES_API_KEY) ||
    trim(process.env.GOOGLE_MAPS_API_KEY)
  );
}

export function hasPlacesAutocompleteKey(): boolean {
  return Boolean(getPlacesApiKey());
}
