import type { VehicleProfile, VehicleStored } from "@/types/vehicle";
import { computeVehicleCosts } from "@/lib/calc/vehicle";
import { FRANCE_FUEL_FALLBACK } from "@/lib/fuel/france-average";

const STORAGE_KEY = "loadprofit-vehicles-v1";

function isFuelType(x: unknown): x is VehicleStored["fuelType"] {
  return x === "diesel" || x === "petrol";
}

function isFuelPriceSource(x: unknown): x is VehicleStored["fuelPriceSource"] {
  return (
    x === "manual" ||
    x === "france_average" ||
    x === "near_my_location"
  );
}

function isFiniteNonNeg(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

function normalizeVehicleStored(o: Record<string, unknown>): VehicleStored | null {
  if (
    typeof o.id !== "string" ||
    typeof o.createdAt !== "string" ||
    typeof o.name !== "string" ||
    typeof o.vehicleType !== "string" ||
    !isFuelType(o.fuelType) ||
    !isFiniteNonNeg(o.averageConsumptionLPer100Km) ||
    !isFiniteNonNeg(o.fuelPricePerLiter) ||
    !isFiniteNonNeg(o.monthlyInsurance) ||
    !isFiniteNonNeg(o.monthlyMaintenance) ||
    !isFiniteNonNeg(o.monthlyTires) ||
    !isFiniteNonNeg(o.monthlyOtherFixedCosts) ||
    typeof o.estimatedMonthlyKm !== "number" ||
    !Number.isFinite(o.estimatedMonthlyKm) ||
    o.estimatedMonthlyKm <= 0
  ) {
    return null;
  }

  const fuelPriceSource =
    isFuelPriceSource(o.fuelPriceSource) ? o.fuelPriceSource : "manual";
  const fuelAdjustmentPerLiter =
    typeof o.fuelAdjustmentPerLiter === "number" &&
    Number.isFinite(o.fuelAdjustmentPerLiter)
      ? o.fuelAdjustmentPerLiter
      : 0;

  return {
    id: o.id,
    createdAt: o.createdAt,
    name: o.name,
    vehicleType: o.vehicleType,
    fuelType: o.fuelType,
    averageConsumptionLPer100Km: o.averageConsumptionLPer100Km,
    fuelPricePerLiter: o.fuelPricePerLiter,
    fuelPriceSource,
    fuelAdjustmentPerLiter,
    monthlyInsurance: o.monthlyInsurance,
    monthlyMaintenance: o.monthlyMaintenance,
    monthlyTires: o.monthlyTires,
    monthlyOtherFixedCosts: o.monthlyOtherFixedCosts,
    estimatedMonthlyKm: o.estimatedMonthlyKm,
  };
}

/**
 * Synchronous enrichment for first paint / localStorage round-trip.
 * Automatic sources ignore any old snapshot in storage — use a static fallback
 * until `enrichAllVehiclesWithLiveFuel` returns current benchmarks.
 */
export function enrichVehicle(stored: VehicleStored): VehicleProfile {
  let baseFuel: number;
  if (stored.fuelPriceSource === "manual") {
    baseFuel = stored.fuelPricePerLiter;
  } else {
    baseFuel =
      stored.fuelType === "diesel"
        ? FRANCE_FUEL_FALLBACK.diesel
        : FRANCE_FUEL_FALLBACK.petrol;
  }

  const effectiveFuelPricePerLiter =
    baseFuel + stored.fuelAdjustmentPerLiter;
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
        : baseFuel,
    fuelCostPerKm,
    fixedCostPerKm,
    totalCostPerKm,
  };
}

function parseStoredList(raw: string | null): VehicleStored[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: VehicleStored[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const row = normalizeVehicleStored(rec);
      if (row) out.push(row);
    }
    return out;
  } catch {
    return [];
  }
}

export function loadVehiclesStored(): VehicleStored[] {
  if (typeof window === "undefined") return [];
  return parseStoredList(window.localStorage.getItem(STORAGE_KEY));
}

export function loadVehicles(): VehicleProfile[] {
  return loadVehiclesStored().map(enrichVehicle);
}

function saveStoredList(list: VehicleStored[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // quota / private mode
  }
}

export function appendVehicle(stored: VehicleStored): VehicleProfile[] {
  if (typeof window === "undefined") return [];
  const list = parseStoredList(window.localStorage.getItem(STORAGE_KEY));
  const next = [stored, ...list];
  saveStoredList(next);
  return next.map(enrichVehicle);
}

export function deleteVehicle(id: string): VehicleProfile[] {
  if (typeof window === "undefined") return [];
  const list = parseStoredList(window.localStorage.getItem(STORAGE_KEY)).filter(
    (v) => v.id !== id,
  );
  saveStoredList(list);
  return list.map(enrichVehicle);
}
