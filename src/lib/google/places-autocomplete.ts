/**
 * Places API (New) — Autocomplete
 * https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
 */

export type PlaceAutocompleteSuggestion = {
  placeId: string;
  label: string;
};

type AutocompleteResponse = {
  suggestions?: unknown;
};

function pickText(placePrediction: Record<string, unknown>): string | null {
  const text = placePrediction.text;
  if (!text || typeof text !== "object") return null;
  const t = (text as Record<string, unknown>).text;
  return typeof t === "string" && t.trim() ? t.trim() : null;
}

/**
 * Returns up to five place suggestions for the given input (server-side).
 */
export async function fetchPlaceAutocompleteSuggestions(
  input: string,
  apiKey: string,
  languageCode: string,
): Promise<PlaceAutocompleteSuggestion[]> {
  const q = input.trim();
  if (q.length < 2) return [];

  const res = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text",
      },
      body: JSON.stringify({
        input: q,
        languageCode: languageCode || "en",
      }),
    },
  );

  if (!res.ok) return [];

  const data = (await res.json()) as AutocompleteResponse;
  const suggestions = data.suggestions;
  if (!Array.isArray(suggestions)) return [];

  const out: PlaceAutocompleteSuggestion[] = [];
  for (const item of suggestions) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const pp = row.placePrediction;
    if (!pp || typeof pp !== "object") continue;
    const pred = pp as Record<string, unknown>;
    const placeId = pred.placeId;
    const label = pickText(pred);
    if (typeof placeId !== "string" || !label) continue;
    out.push({ placeId, label });
    if (out.length >= 8) break;
  }

  return out;
}
