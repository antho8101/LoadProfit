import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/google/geocoding";
import {
  getGeocodingApiKey,
  getRoutesApiKey,
  hasRouteDistanceKeys,
} from "@/lib/google/env-keys";
import { computeDrivingRoute } from "@/lib/google/routes";

export const dynamic = "force-dynamic";

type PostBody = {
  origin?: unknown;
  destination?: unknown;
};

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON body.",
        manualFallbackAllowed: true,
      },
      { status: 400 },
    );
  }

  const origin = str(body.origin);
  const destination = str(body.destination);

  if (!origin || !destination) {
    return NextResponse.json(
      {
        error: "Origin and destination are required.",
        manualFallbackAllowed: true,
      },
      { status: 400 },
    );
  }

  if (!hasRouteDistanceKeys()) {
    return NextResponse.json(
      {
        error:
          "Distance service is not configured. Set GOOGLE_MAPS_API_KEY (or GOOGLE_MAPS_GEOCODING_API_KEY and GOOGLE_MAPS_ROUTES_API_KEY) in .env, then restart the dev server.",
        manualFallbackAllowed: true,
      },
      { status: 503 },
    );
  }

  const geoKey = getGeocodingApiKey();
  const routesKey = getRoutesApiKey();

  const from = await geocodeAddress(origin, geoKey);
  const to = await geocodeAddress(destination, geoKey);

  if (!from || !to) {
    return NextResponse.json(
      {
        error:
          "Could not find both locations. Check spelling or enter distance manually.",
        manualFallbackAllowed: true,
      },
      { status: 422 },
    );
  }

  const route = await computeDrivingRoute(
    { lat: from.lat, lng: from.lng },
    { lat: to.lat, lng: to.lng },
    routesKey,
  );

  if (!route) {
    return NextResponse.json(
      {
        error:
          "Could not calculate a driving route. Try again or enter distance manually.",
        manualFallbackAllowed: true,
      },
      { status: 422 },
    );
  }

  const durationMinutes =
    route.durationSeconds !== null
      ? Math.round(route.durationSeconds / 60)
      : null;

  return NextResponse.json({
    origin: from.formattedAddress,
    destination: to.formattedAddress,
    distanceKm: route.distanceKm,
    durationMinutes,
    source: "google_routes" as const,
    manualFallbackAllowed: true as const,
  });
}
