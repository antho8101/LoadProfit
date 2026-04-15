import type { SavedTrip } from "@/types/trip";

export type DashboardStats = {
  totalTrips: number;
  profitableCount: number;
  lossCount: number;
  averageProfit: number | null;
  totalProfitSum: number;
};

export function computeDashboardStats(trips: SavedTrip[]): DashboardStats {
  const totalTrips = trips.length;
  let profitableCount = 0;
  let lossCount = 0;
  let totalProfitSum = 0;

  for (const t of trips) {
    totalProfitSum += t.profit;
    if (t.status === "profitable") profitableCount += 1;
    if (t.status === "loss") lossCount += 1;
  }

  const averageProfit =
    totalTrips > 0 ? totalProfitSum / totalTrips : null;

  return {
    totalTrips,
    profitableCount,
    lossCount,
    averageProfit,
    totalProfitSum,
  };
}
