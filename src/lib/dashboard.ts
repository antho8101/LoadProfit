import type { SavedTrip } from "@/types/trip";

export type TripInsightRow = {
  route: string;
  profit: number;
  createdAt: string;
};

/** Value story for upgrade / conversion UI — derived from {@link computeDashboardStats}. */
export type UserValueMetrics = {
  /** Total saved trips (analyzed). */
  tripsAnalyzed: number;
  /** Sum of `profit` for trips where `profit > 0`. */
  potentialProfitTotal: number;
  /** Declined trips with `profit < 0`: sum of `abs(profit)`. */
  lossesAvoidedTotal: number;
};

export type UserValueStoryKind = "empty" | "trips_only" | "rich";

/** Maps dashboard stats to upgrade metrics without recomputing aggregates. */
export function userValueMetricsFromStats(
  stats: DashboardStats,
): UserValueMetrics {
  return {
    tripsAnalyzed: stats.totalTrips,
    potentialProfitTotal: stats.totalPotentialProfit,
    lossesAvoidedTotal: stats.lossesAvoided,
  };
}

/**
 * - `empty`: no saved trips — show onboarding-style fallback.
 * - `trips_only`: trips saved but no positive-profit sum and no declined-loss avoidance yet.
 * - `rich`: at least one monetary insight to show without awkward zeros.
 */
export function userValueStoryKind(metrics: UserValueMetrics): UserValueStoryKind {
  if (metrics.tripsAnalyzed === 0) return "empty";
  if (metrics.potentialProfitTotal > 0 || metrics.lossesAvoidedTotal > 0) {
    return "rich";
  }
  return "trips_only";
}

export type DashboardStats = {
  totalTrips: number;
  acceptedCount: number;
  declinedCount: number;
  averageProfit: number | null;
  /** Sum of profit for trips where profit > 0 */
  totalPotentialProfit: number;
  /**
   * Sum of |profit| for declined trips where profit < 0
   * (value you did not realize as a loss by declining).
   */
  lossesAvoided: number;
  /** Same metric, declined negative estimates in the current calendar month. */
  lossesAvoidedThisMonth: number;
  /** Highest profit among saved trips */
  bestTrip: TripInsightRow | null;
  /** Lowest profit (largest loss) among saved trips */
  worstTrip: TripInsightRow | null;
  /** Mean of stored margins where present */
  averageMarginPercent: number | null;
  /**
   * True when several accepted trips were low-margin — nudge to review pricing discipline.
   */
  oftenLowMarginAccepted: boolean;
};

function routeLabel(t: SavedTrip): string {
  return `${t.departureCity} → ${t.arrivalCity}`;
}

function isInCurrentMonth(iso: string): boolean {
  try {
    const d = new Date(iso);
    const n = new Date();
    return (
      d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth()
    );
  } catch {
    return false;
  }
}

export function computeDashboardStats(trips: SavedTrip[]): DashboardStats {
  const totalTrips = trips.length;
  let acceptedCount = 0;
  let declinedCount = 0;
  let profitSum = 0;
  let totalPotentialProfit = 0;
  let lossesAvoided = 0;
  let lossesAvoidedThisMonth = 0;

  let bestTrip: TripInsightRow | null = null;
  let worstTrip: TripInsightRow | null = null;

  let marginSum = 0;
  let marginCount = 0;

  let acceptedLowMargin = 0;

  for (const t of trips) {
    profitSum += t.profit;
    if (t.decision === "accepted") {
      acceptedCount += 1;
      if (t.status === "low_margin") acceptedLowMargin += 1;
    }
    if (t.decision === "declined") declinedCount += 1;
    if (t.profit > 0) totalPotentialProfit += t.profit;
    if (t.decision === "declined" && t.profit < 0) {
      const absLoss = Math.abs(t.profit);
      lossesAvoided += absLoss;
      if (isInCurrentMonth(t.createdAt)) {
        lossesAvoidedThisMonth += absLoss;
      }
    }

    if (bestTrip === null || t.profit > bestTrip.profit) {
      bestTrip = {
        route: routeLabel(t),
        profit: t.profit,
        createdAt: t.createdAt,
      };
    }
    if (worstTrip === null || t.profit < worstTrip.profit) {
      worstTrip = {
        route: routeLabel(t),
        profit: t.profit,
        createdAt: t.createdAt,
      };
    }

    if (t.marginPercent !== null && t.marginPercent !== undefined) {
      marginSum += t.marginPercent;
      marginCount += 1;
    }
  }

  const averageProfit = totalTrips > 0 ? profitSum / totalTrips : null;
  const averageMarginPercent =
    marginCount > 0 ? marginSum / marginCount : null;

  const oftenLowMarginAccepted =
    acceptedCount >= 3 &&
    acceptedLowMargin >= 2 &&
    acceptedLowMargin / acceptedCount >= 0.35;

  return {
    totalTrips,
    acceptedCount,
    declinedCount,
    averageProfit,
    totalPotentialProfit,
    lossesAvoided,
    lossesAvoidedThisMonth,
    bestTrip,
    worstTrip,
    averageMarginPercent,
    oftenLowMarginAccepted,
  };
}
