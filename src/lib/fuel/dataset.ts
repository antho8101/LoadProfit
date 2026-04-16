/**
 * Shared fetch + in-memory cache for the official fuel price dataset records.
 * Used by national and local benchmark logic (server-side only).
 */

const DATASET_RECORDS_URL =
  "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?limit=10000";

const CACHE_TTL_MS = 15 * 60 * 1000;

let cache: { results: unknown[]; expires: number } | null = null;

export async function getFuelDatasetResults(): Promise<unknown[] | null> {
  const now = Date.now();
  if (cache && cache.expires > now) {
    return cache.results;
  }

  try {
    const res = await fetch(DATASET_RECORDS_URL, {
      signal: AbortSignal.timeout(45_000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    if (!json || typeof json !== "object") return null;
    const results = (json as Record<string, unknown>).results;
    if (!Array.isArray(results)) return null;
    cache = { results, expires: now + CACHE_TTL_MS };
    return results;
  } catch {
    return null;
  }
}
