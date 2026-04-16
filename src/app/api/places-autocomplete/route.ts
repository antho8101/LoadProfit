import { NextResponse } from "next/server";
import { fetchPlaceAutocompleteSuggestions } from "@/lib/google/places-autocomplete";
import {
  getPlacesApiKey,
  hasPlacesAutocompleteKey,
} from "@/lib/google/env-keys";

export const dynamic = "force-dynamic";

type PostBody = {
  input?: unknown;
  languageCode?: unknown;
};

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function lang(v: unknown): string {
  const s = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (/^[a-z]{2}$/.test(s)) return s;
  return "en";
}

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = str(body.input);
  if (input.length < 2) {
    return NextResponse.json({ suggestions: [] as const });
  }

  if (!hasPlacesAutocompleteKey()) {
    return NextResponse.json(
      {
        error:
          "Places autocomplete is not configured. Set GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_PLACES_API_KEY in .env and enable Places API (New) for that key.",
        suggestions: [] as const,
      },
      { status: 503 },
    );
  }

  const suggestions = await fetchPlaceAutocompleteSuggestions(
    input,
    getPlacesApiKey(),
    lang(body.languageCode),
  );

  return NextResponse.json({ suggestions });
}
