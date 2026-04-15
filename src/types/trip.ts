/** Profitability label used in UI and stored history */
export type ProfitabilityStatus = "profitable" | "low_margin" | "loss";

/** Validated trip inputs passed to the calculator */
export type TripInputs = {
  departureCity: string;
  arrivalCity: string;
  offeredPrice: number;
  distanceKm: number;
  costPerKm: number;
  emptyReturn: boolean;
  /** Set when a saved vehicle was selected at calculation time */
  vehicleId: string | null;
  vehicleName: string | null;
};

/** Pure calculation output (not persisted) */
export type TripCalculationResult = {
  operationalDistanceKm: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  minimumProfitablePrice: number;
  marginPercent: number | null;
  status: ProfitabilityStatus;
  emptyReturnImpact: {
    extraKm: number;
    extraCost: number;
  };
};

/** One saved row in local history (may include legacy rows normalized on load) */
export type SavedTrip = {
  id: string;
  savedAt: string;
  departureCity: string;
  arrivalCity: string;
  offeredPrice: number;
  totalCost: number;
  profit: number;
  status: ProfitabilityStatus;
  /** One-way distance (km) used for the calculation */
  distanceKm: number;
  emptyReturn: boolean;
  /** Margin on offered price; null if not stored (legacy) or undefined */
  marginPercent: number | null;
  /** Vehicle display name when a profile was used; null for manual cost only */
  vehicleName: string | null;
};
