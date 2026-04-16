import { NextResponse } from "next/server";
import { fetchLocalFuelBenchmark } from "@/lib/fuel/local-benchmark";

const CACHE_TTL_MS = 15 * 60 * 1000;

type CacheEntry = { payload: Awaited<ReturnType<typeof fetchLocalFuelBenchmark>>; expires: number };
const cacheByKey = new Map<string, CacheEntry>();

function roundCoord(n: number): string {
  return String(Math.round(n * 200) / 200);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lng query parameters." },
      { status: 400 },
    );
  }

  const key = `${roundCoord(lat)},${roundCoord(lng)}`;
  const now = Date.now();
  const hit = cacheByKey.get(key);
  if (hit && hit.expires > now) {
    return NextResponse.json(hit.payload, {
      headers: { "Cache-Control": "private, max-age=120" },
    });
  }

  const payload = await fetchLocalFuelBenchmark(lat, lng);
  cacheByKey.set(key, { payload, expires: now + CACHE_TTL_MS });

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "private, max-age=120" },
  });
}
