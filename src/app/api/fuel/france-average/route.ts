import { NextResponse } from "next/server";
import type { FranceFuelResult } from "@/lib/fuel/france-average";
import { fetchFranceFuelAverages } from "@/lib/fuel/france-average";

const CACHE_TTL_MS = 15 * 60 * 1000;

let cache: { payload: FranceFuelResult; expires: number } | null = null;

export async function GET() {
  const now = Date.now();
  if (cache && cache.expires > now) {
    return NextResponse.json(cache.payload, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  }

  const payload = await fetchFranceFuelAverages();
  cache = { payload, expires: now + CACHE_TTL_MS };

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "private, max-age=60" },
  });
}
