/**
 * Operating cost model for a vehicle profile.
 * `fuelPricePerLiter` here is the effective price: base + adjustment (see enrichVehicle).
 */

export type VehicleCostInputs = {
  averageConsumptionLPer100Km: number;
  /** Effective €/L after base price and adjustment. */
  fuelPricePerLiter: number;
  monthlyInsurance: number;
  monthlyMaintenance: number;
  monthlyTires: number;
  monthlyOtherFixedCosts: number;
  estimatedMonthlyKm: number;
};

export type VehicleCostBreakdown = {
  fuelCostPerKm: number;
  fixedCostPerKm: number;
  totalCostPerKm: number;
};

/**
 * Total €/km for a saved vehicle if the **effective** fuel price (€/L) is replaced
 * (e.g. trip-level override) while keeping consumption and fixed costs unchanged.
 */
export function computeTotalCostPerKmWithEffectiveFuel(
  vehicle: Pick<
    VehicleCostInputs,
    | "averageConsumptionLPer100Km"
    | "monthlyInsurance"
    | "monthlyMaintenance"
    | "monthlyTires"
    | "monthlyOtherFixedCosts"
    | "estimatedMonthlyKm"
  >,
  effectiveFuelPricePerLiter: number,
): number {
  return computeVehicleCosts({
    ...vehicle,
    fuelPricePerLiter: effectiveFuelPricePerLiter,
  }).totalCostPerKm;
}

/**
 * Requires validated inputs: estimatedMonthlyKm > 0, non-negative amounts where applicable.
 */
export function computeVehicleCosts(
  v: VehicleCostInputs,
): VehicleCostBreakdown {
  const fuelCostPerKm =
    (v.averageConsumptionLPer100Km / 100) * v.fuelPricePerLiter;
  const monthlyFixedTotal =
    v.monthlyInsurance +
    v.monthlyMaintenance +
    v.monthlyTires +
    v.monthlyOtherFixedCosts;
  const fixedCostPerKm = monthlyFixedTotal / v.estimatedMonthlyKm;
  return {
    fuelCostPerKm,
    fixedCostPerKm,
    totalCostPerKm: fuelCostPerKm + fixedCostPerKm,
  };
}
