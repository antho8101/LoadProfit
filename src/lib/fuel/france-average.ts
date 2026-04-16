/**
 * France national fuel price averages from the official open dataset
 * "prix-des-carburants-en-france-flux-instantane-v2" (data.economie.gouv.fr).
 *
 * Petrol benchmark: for each station, we average the available SP95 / E10 / SP98
 * prices (€/L) that are present and valid — then take the mean across stations.
 * E85 is excluded (different product). This is a simple national convenience index,
 * not a route-level or rebate-adjusted price.
 */

import { getFuelDatasetResults } from "@/lib/fuel/dataset";

/** Used when the API is down, parsing fails, or too few valid samples. */
export const FRANCE_FUEL_FALLBACK = {
  diesel: 2.05,
  petrol: 1.95,
} as const;

const MIN_SAMPLES = 30;

export type FranceFuelResult = {
  diesel: number;
  petrol: number;
  source: "official_france_dataset" | "fallback";
  updatedAt: string;
};

function toPositivePrice(x: unknown): number | null {
  if (typeof x !== "number" || !Number.isFinite(x) || x <= 0) return null;
  return x;
}

/** Mean of SP95, E10, SP98 at this station (only grades that are reported). */
export function petrolStationIndex(row: Record<string, unknown>): number | null {
  const vals = [
    toPositivePrice(row.sp95_prix),
    toPositivePrice(row.e10_prix),
    toPositivePrice(row.sp98_prix),
  ].filter((v): v is number => v !== null);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function mean(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}

export function computeFranceFuelFromRecords(
  results: unknown[],
): { diesel: number; petrol: number } | null {
  const dieselSamples: number[] = [];
  const petrolSamples: number[] = [];

  for (const row of results) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const g = toPositivePrice(r.gazole_prix);
    if (g !== null) dieselSamples.push(g);
    const p = petrolStationIndex(r);
    if (p !== null) petrolSamples.push(p);
  }

  const dieselAvg = mean(dieselSamples);
  const petrolAvg = mean(petrolSamples);

  if (
    dieselAvg === null ||
    petrolAvg === null ||
    dieselSamples.length < MIN_SAMPLES ||
    petrolSamples.length < MIN_SAMPLES
  ) {
    return null;
  }

  return { diesel: round4(dieselAvg), petrol: round4(petrolAvg) };
}

export async function fetchFranceFuelAverages(): Promise<FranceFuelResult> {
  const updatedAt = new Date().toISOString();

  try {
    const results = await getFuelDatasetResults();
    if (!results) {
      return {
        diesel: FRANCE_FUEL_FALLBACK.diesel,
        petrol: FRANCE_FUEL_FALLBACK.petrol,
        source: "fallback",
        updatedAt,
      };
    }

    const computed = computeFranceFuelFromRecords(results);
    if (!computed) {
      return {
        diesel: FRANCE_FUEL_FALLBACK.diesel,
        petrol: FRANCE_FUEL_FALLBACK.petrol,
        source: "fallback",
        updatedAt,
      };
    }

    return {
      diesel: computed.diesel,
      petrol: computed.petrol,
      source: "official_france_dataset",
      updatedAt,
    };
  } catch {
    return {
      diesel: FRANCE_FUEL_FALLBACK.diesel,
      petrol: FRANCE_FUEL_FALLBACK.petrol,
      source: "fallback",
      updatedAt,
    };
  }
}
