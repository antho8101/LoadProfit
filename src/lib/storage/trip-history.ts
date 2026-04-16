import type { SavedTrip, TripDecision } from "@/types/trip";

const STORAGE_KEY = "loadprofit-trips-v1";
const MAX_TRIPS = 100;

function hasCoreSavedFields(o: Record<string, unknown>): boolean {
  if (
    typeof o.id !== "string" ||
    typeof o.departureCity !== "string" ||
    typeof o.arrivalCity !== "string" ||
    typeof o.offeredPrice !== "number" ||
    typeof o.totalCost !== "number" ||
    typeof o.profit !== "number" ||
    !(
      o.status === "profitable" ||
      o.status === "low_margin" ||
      o.status === "loss"
    )
  ) {
    return false;
  }
  const hasCreated =
    typeof o.createdAt === "string" || typeof o.savedAt === "string";
  if (!hasCreated) return false;
  if (o.decision !== undefined) {
    if (
      o.decision !== "accepted" &&
      o.decision !== "declined" &&
      o.decision !== "pending"
    ) {
      return false;
    }
  }
  return true;
}

/** Normalize legacy rows missing V1.1 fields */
function normalizeSavedTrip(o: Record<string, unknown>): SavedTrip | null {
  if (!hasCoreSavedFields(o)) return null;

  const marginRaw = o.marginPercent;
  let marginPercent: number | null = null;
  if (typeof marginRaw === "number" && Number.isFinite(marginRaw)) {
    marginPercent = marginRaw;
  } else if (marginRaw === null) {
    marginPercent = null;
  }

  const vehicleName =
    typeof o.vehicleName === "string" ? o.vehicleName : null;

  const createdAtRaw = o.createdAt ?? o.savedAt;
  const createdAt =
    typeof createdAtRaw === "string" ? createdAtRaw : new Date(0).toISOString();

  let decision: TripDecision = "pending";
  if (
    o.decision === "accepted" ||
    o.decision === "declined" ||
    o.decision === "pending"
  ) {
    decision = o.decision;
  }

  const calcKey = typeof o.calcKey === "string" ? o.calcKey : undefined;

  const vehicleIdRaw = o.vehicleId;
  const vehicleId =
    typeof vehicleIdRaw === "string" ? vehicleIdRaw : null;

  return {
    id: o.id as string,
    createdAt,
    savedAt: typeof o.savedAt === "string" ? o.savedAt : undefined,
    departureCity: o.departureCity as string,
    arrivalCity: o.arrivalCity as string,
    offeredPrice: o.offeredPrice as number,
    totalCost: o.totalCost as number,
    profit: o.profit as number,
    status: o.status as SavedTrip["status"],
    distanceKm: typeof o.distanceKm === "number" ? o.distanceKm : 0,
    emptyReturn: typeof o.emptyReturn === "boolean" ? o.emptyReturn : false,
    marginPercent,
    vehicleName,
    vehicleId,
    decision,
    calcKey,
  };
}

export function loadTrips(): SavedTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: SavedTrip[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const row = normalizeSavedTrip(item as Record<string, unknown>);
      if (row) out.push(row);
    }
    return out;
  } catch {
    return [];
  }
}

export function saveTrips(trips: SavedTrip[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch {
    // quota or private mode — ignore for MVP
  }
}

export function appendTrip(trip: SavedTrip): SavedTrip[] {
  const next = [trip, ...loadTrips()].slice(0, MAX_TRIPS);
  saveTrips(next);
  return next;
}

export function clearTrips(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
