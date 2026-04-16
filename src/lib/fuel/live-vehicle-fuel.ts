/**
 * Resolves current benchmark €/L for a saved vehicle (France average or near-you),
 * for use when applying live fuel prices on each load. Manual profiles use stored €/L only.
 */

import type { VehicleProfile, VehicleStored } from "@/types/vehicle";
import { computeVehicleCosts } from "@/lib/calc/vehicle";
import { FRANCE_FUEL_FALLBACK } from "@/lib/fuel/france-average";
import type { FranceFuelResult } from "@/lib/fuel/france-average";
import type { LocalBenchmarkResult } from "@/lib/fuel/local-benchmark";

function pickPriceForFuelType(
  fuelType: VehicleStored["fuelType"],
  diesel: number,
  petrol: number,
): number {
  return fuelType === "diesel" ? diesel : petrol;
}

async function fetchFrancePrices(): Promise<FranceFuelResult | null> {
  try {
    const res = await fetch("/api/fuel/france-average", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as FranceFuelResult;
  } catch {
    return null;
  }
}

async function fetchLocalPrices(
  lat: number,
  lng: number,
): Promise<LocalBenchmarkResult | null> {
  try {
    const url = `/api/fuel/local-benchmark?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as LocalBenchmarkResult;
  } catch {
    return null;
  }
}

function fallbackByFuelType(fuelType: VehicleStored["fuelType"]): number {
  return fuelType === "diesel"
    ? FRANCE_FUEL_FALLBACK.diesel
    : FRANCE_FUEL_FALLBACK.petrol;
}

/**
 * Live benchmark €/L (before per-vehicle adjustment). Manual → stored value.
 */
export async function resolveLiveFuelBasePerLiter(
  stored: VehicleStored,
  userCoords: { lat: number; lng: number } | null,
): Promise<number> {
  if (stored.fuelPriceSource === "manual") {
    return stored.fuelPricePerLiter;
  }

  if (stored.fuelPriceSource === "france_average") {
    const j = await fetchFrancePrices();
    if (j) {
      return pickPriceForFuelType(
        stored.fuelType,
        j.diesel,
        j.petrol,
      );
    }
    return stored.fuelPricePerLiter > 0
      ? stored.fuelPricePerLiter
      : fallbackByFuelType(stored.fuelType);
  }

  if (stored.fuelPriceSource === "near_my_location") {
    if (userCoords) {
      const j = await fetchLocalPrices(userCoords.lat, userCoords.lng);
      if (j) {
        return pickPriceForFuelType(stored.fuelType, j.diesel, j.petrol);
      }
    }
    const j = await fetchFrancePrices();
    if (j) {
      return pickPriceForFuelType(stored.fuelType, j.diesel, j.petrol);
    }
    return stored.fuelPricePerLiter > 0
      ? stored.fuelPricePerLiter
      : fallbackByFuelType(stored.fuelType);
  }

  return stored.fuelPricePerLiter;
}

function toProfile(stored: VehicleStored, baseFuelPerLiter: number): VehicleProfile {
  const effectiveFuelPricePerLiter =
    baseFuelPerLiter + stored.fuelAdjustmentPerLiter;
  const { fuelCostPerKm, fixedCostPerKm, totalCostPerKm } = computeVehicleCosts(
    {
      averageConsumptionLPer100Km: stored.averageConsumptionLPer100Km,
      fuelPricePerLiter: effectiveFuelPricePerLiter,
      monthlyInsurance: stored.monthlyInsurance,
      monthlyMaintenance: stored.monthlyMaintenance,
      monthlyTires: stored.monthlyTires,
      monthlyOtherFixedCosts: stored.monthlyOtherFixedCosts,
      estimatedMonthlyKm: stored.estimatedMonthlyKm,
    },
  );
  return {
    ...stored,
    fuelPricePerLiter:
      stored.fuelPriceSource === "manual"
        ? stored.fuelPricePerLiter
        : baseFuelPerLiter,
    fuelCostPerKm,
    fixedCostPerKm,
    totalCostPerKm,
  };
}

export async function enrichVehicleWithLiveFuel(
  stored: VehicleStored,
  userCoords: { lat: number; lng: number } | null,
): Promise<VehicleProfile> {
  const base = await resolveLiveFuelBasePerLiter(stored, userCoords);
  return toProfile(stored, base);
}

export async function enrichAllVehiclesWithLiveFuel(
  list: VehicleStored[],
  userCoords: { lat: number; lng: number } | null,
): Promise<VehicleProfile[]> {
  return Promise.all(
    list.map((s) => enrichVehicleWithLiveFuel(s, userCoords)),
  );
}
