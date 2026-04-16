import type {
  ProfitabilityStatus,
  TripCalculationResult,
  TripInputs,
} from "@/types/trip";

function operationalDistanceKm(oneWayKm: number, emptyReturn: boolean): number {
  return emptyReturn ? oneWayKm * 2 : oneWayKm;
}

function profitabilityStatus(
  profit: number,
  offeredPrice: number,
  marginPercent: number | null,
): ProfitabilityStatus {
  if (profit <= 0) return "loss";
  if (offeredPrice <= 0 || marginPercent === null) return "low_margin";
  if (marginPercent >= 15) return "profitable";
  return "low_margin";
}

/** Margin % = profit / offered price × 100. Caller must supply offeredPrice > 0 for a meaningful ratio. */
function marginPercent(profit: number, offeredPrice: number): number | null {
  if (offeredPrice <= 0 || !Number.isFinite(offeredPrice)) return null;
  return (profit / offeredPrice) * 100;
}

/**
 * V1 formulas — inputs are expected to be validated (positive distance & price, non-negative cost/km).
 */
export function calculateTrip(inputs: TripInputs): TripCalculationResult {
  const oneWay = inputs.distanceKm;
  const opDist = operationalDistanceKm(oneWay, inputs.emptyReturn);
  const costPerKm = inputs.costPerKm;

  const totalCost = opDist * costPerKm;
  const totalRevenue = inputs.offeredPrice;
  const profit = totalRevenue - totalCost;
  const minimumProfitablePrice = totalCost;

  const m = marginPercent(profit, inputs.offeredPrice);
  const status = profitabilityStatus(profit, inputs.offeredPrice, m);

  const withReturnDist = oneWay * 2;
  const extraKm = inputs.emptyReturn ? withReturnDist - oneWay : 0;
  const extraCost = extraKm * costPerKm;

  return {
    operationalDistanceKm: opDist,
    oneWayDistanceKm: oneWay,
    totalRevenue,
    totalCost,
    profit,
    minimumProfitablePrice,
    marginPercent: m !== null && Number.isFinite(m) ? m : null,
    status,
    distanceSource: inputs.distanceSource,
    routeDurationMinutes:
      inputs.routeDurationMinutes === undefined
        ? null
        : inputs.routeDurationMinutes,
    emptyReturnImpact: {
      extraKm,
      extraCost,
    },
  };
}
