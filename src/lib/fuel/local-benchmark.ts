/**
 * Local fuel benchmark: average prices from dataset stations within increasing
 * radii of the user's position (Haversine), then fall back to national average
 * from the same dataset if too few points.
 */

import { getFuelDatasetResults } from "@/lib/fuel/dataset";
import {
  computeFranceFuelFromRecords,
  FRANCE_FUEL_FALLBACK,
  type FranceFuelResult,
} from "@/lib/fuel/france-average";

export type LocalBenchmarkScope = "local" | "national_fallback" | "fallback";

export type LocalBenchmarkResult = FranceFuelResult & {
  scope: LocalBenchmarkScope;
};

function toPositivePrice(x: unknown): number | null {
  if (typeof x !== "number" || !Number.isFinite(x) || x <= 0) return null;
  return x;
}

function petrolStationIndex(row: Record<string, unknown>): number | null {
  const vals = [
    toPositivePrice(row.sp95_prix),
    toPositivePrice(row.e10_prix),
    toPositivePrice(row.sp98_prix),
  ].filter((v): v is number => v !== null);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function stationCoords(row: Record<string, unknown>): { lat: number; lon: number } | null {
  const g = row.geom;
  if (!g || typeof g !== "object") return null;
  const o = g as Record<string, unknown>;
  const lat = o.lat;
  const lon = o.lon;
  if (typeof lat !== "number" || typeof lon !== "number") return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

const MIN_LOCAL_SAMPLES = 12;
const RADII_KM = [80, 150, 250, 400];

function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}

function mean(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function computeLocalFromResults(
  results: unknown[],
  userLat: number,
  userLon: number,
): { diesel: number; petrol: number } | null {
  for (const radiusKm of RADII_KM) {
    const dieselSamples: number[] = [];
    const petrolSamples: number[] = [];

    for (const row of results) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const coords = stationCoords(r);
      if (!coords) continue;
      if (
        haversineKm(userLat, userLon, coords.lat, coords.lon) > radiusKm
      ) {
        continue;
      }
      const g = toPositivePrice(r.gazole_prix);
      if (g !== null) dieselSamples.push(g);
      const p = petrolStationIndex(r);
      if (p !== null) petrolSamples.push(p);
    }

    const d = mean(dieselSamples);
    const p = mean(petrolSamples);
    if (
      d !== null &&
      p !== null &&
      dieselSamples.length >= MIN_LOCAL_SAMPLES &&
      petrolSamples.length >= MIN_LOCAL_SAMPLES
    ) {
      return { diesel: round4(d), petrol: round4(p) };
    }
  }

  return null;
}

export async function fetchLocalFuelBenchmark(
  userLat: number,
  userLon: number,
): Promise<LocalBenchmarkResult> {
  const updatedAt = new Date().toISOString();

  const results = await getFuelDatasetResults();
  if (!results) {
    return {
      diesel: FRANCE_FUEL_FALLBACK.diesel,
      petrol: FRANCE_FUEL_FALLBACK.petrol,
      source: "fallback",
      scope: "fallback",
      updatedAt,
    };
  }

  const local = computeLocalFromResults(results, userLat, userLon);
  if (local) {
    return {
      diesel: local.diesel,
      petrol: local.petrol,
      source: "official_france_dataset",
      scope: "local",
      updatedAt,
    };
  }

  const national = computeFranceFuelFromRecords(results);
  if (national) {
    return {
      diesel: national.diesel,
      petrol: national.petrol,
      source: "official_france_dataset",
      scope: "national_fallback",
      updatedAt,
    };
  }

  return {
    diesel: FRANCE_FUEL_FALLBACK.diesel,
    petrol: FRANCE_FUEL_FALLBACK.petrol,
    source: "fallback",
    scope: "fallback",
    updatedAt,
  };
}
