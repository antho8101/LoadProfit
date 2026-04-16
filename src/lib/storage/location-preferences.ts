export type LocationConsent = "unknown" | "granted" | "denied" | "skipped";

export type LocationPreferences = {
  consent: LocationConsent;
  /** User has completed the first-run location prompt (Allow or Skip). */
  promptSeen: boolean;
  lat?: number;
  lng?: number;
  updatedAt?: string;
};

const STORAGE_KEY = "loadprofit-location-v1";

const DEFAULT_PREFS: LocationPreferences = {
  consent: "unknown",
  promptSeen: false,
};

function parse(raw: string | null): LocationPreferences {
  if (!raw) return { ...DEFAULT_PREFS };
  try {
    const o: unknown = JSON.parse(raw);
    if (!o || typeof o !== "object") return { ...DEFAULT_PREFS };
    const r = o as Record<string, unknown>;
    const consent =
      r.consent === "granted" ||
      r.consent === "denied" ||
      r.consent === "skipped" ||
      r.consent === "unknown"
        ? r.consent
        : "unknown";
    const promptSeen = r.promptSeen === true;
    const lat = typeof r.lat === "number" && Number.isFinite(r.lat) ? r.lat : undefined;
    const lng = typeof r.lng === "number" && Number.isFinite(r.lng) ? r.lng : undefined;
    const updatedAt =
      typeof r.updatedAt === "string" ? r.updatedAt : undefined;
    return { consent, promptSeen, lat, lng, updatedAt };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function loadLocationPreferences(): LocationPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_PREFS };
  return parse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveLocationPreferences(prefs: LocationPreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}
