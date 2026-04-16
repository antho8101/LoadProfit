export type FuelType = "diesel" | "petrol";

export type FuelPriceSource =
  | "manual"
  | "france_average"
  | "near_my_location";

/** Persisted vehicle row (inputs only; derived costs recomputed on load). */
export type VehicleStored = {
  id: string;
  createdAt: string;
  name: string;
  vehicleType: string;
  fuelType: FuelType;
  averageConsumptionLPer100Km: number;
  /**
   * Base pump price (€/L). Manual: your entry. Automatic sources: stored as 0 —
   * the app refreshes the benchmark from APIs when loading profiles.
   */
  fuelPricePerLiter: number;
  fuelPriceSource: FuelPriceSource;
  /** Added to base price (€/L); rebates, cards, or local tweaks — can be negative if base covers it. */
  fuelAdjustmentPerLiter: number;
  monthlyInsurance: number;
  monthlyMaintenance: number;
  monthlyTires: number;
  monthlyOtherFixedCosts: number;
  estimatedMonthlyKm: number;
};

/** Vehicle with operating cost breakdown (for UI and trip calculator). */
export type VehicleProfile = VehicleStored & {
  fuelCostPerKm: number;
  fixedCostPerKm: number;
  totalCostPerKm: number;
};
