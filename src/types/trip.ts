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
  /** How one-way distance was obtained (Google route vs manual override). */
  distanceSource?: "google_routes" | "manual";
  /** Driving time from Routes API when distanceSource is google_routes. */
  routeDurationMinutes?: number | null;
};

/** Pure calculation output (not persisted) */
export type TripCalculationResult = {
  operationalDistanceKm: number;
  /** One-way route distance (km) before empty-return multiplier. */
  oneWayDistanceKm: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  minimumProfitablePrice: number;
  marginPercent: number | null;
  status: ProfitabilityStatus;
  distanceSource?: "google_routes" | "manual";
  routeDurationMinutes?: number | null;
  emptyReturnImpact: {
    extraKm: number;
    extraCost: number;
  };
};

/** User decision for a saved analysis (legacy rows normalize to "pending") */
export type TripDecision = "accepted" | "declined" | "pending";

/** One saved row in local history (may include legacy rows normalized on load) */
export type SavedTrip = {
  id: string;
  /** When this record was created (ISO). Legacy JSON may only have savedAt — normalized on load. */
  createdAt: string;
  /** @deprecated Same as createdAt; kept for older stored rows */
  savedAt?: string;
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
  /** When a saved vehicle was selected; used for “Use again” pre-fill. */
  vehicleId?: string | null;
  decision: TripDecision;
  /**
   * Fingerprint of the calculation inputs; used to prevent duplicate saves for the same estimate.
   */
  calcKey?: string;
};
