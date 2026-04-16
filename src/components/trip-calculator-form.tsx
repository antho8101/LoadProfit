"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { calculateTrip } from "@/lib/calc/trip";
import { computeTotalCostPerKmWithEffectiveFuel } from "@/lib/calc/vehicle";
import { interpolate, translate } from "@/lib/i18n/catalog";
import { useLocale } from "@/contexts/locale-context";
import { formatCostPerKmInput, formatEur, parseDecimal } from "@/lib/format";
import type { SavedTrip, TripCalculationResult, TripInputs } from "@/types/trip";
import type { VehicleProfile } from "@/types/vehicle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagicAccentSubmit } from "@/components/ui/magic-accent-submit";
import { inputClassName } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { MessageId } from "@/lib/i18n/catalog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { TripResults } from "@/components/trip-results";
import { CityAutocompleteInput } from "@/components/city-autocomplete-input";

type FormErrors = Partial<Record<string, string>>;

export type RouteReusePrefill = {
  departure: string;
  arrival: string;
  vehicleId: string;
} | null;

function effectiveFuelPerLiterFromProfile(v: VehicleProfile): number | null {
  const litersPerKm = v.averageConsumptionLPer100Km / 100;
  if (!Number.isFinite(litersPerKm) || litersPerKm <= 0) return null;
  const eff = v.fuelCostPerKm / litersPerKm;
  return Number.isFinite(eff) ? eff : null;
}

const ROUTE_CACHE_KEY = "loadprofit-route-distance-v1";

type RouteCachePayload = {
  key: string;
  distanceKm: number;
  durationMinutes: number | null;
};

function routePairKey(origin: string, destination: string): string {
  return `${origin.trim().toLowerCase()}|${destination.trim().toLowerCase()}`;
}

function readRouteCache(
  origin: string,
  destination: string,
): { distanceKm: number; durationMinutes: number | null } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ROUTE_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as RouteCachePayload;
    if (!data || typeof data.key !== "string") return null;
    if (data.key !== routePairKey(origin, destination)) return null;
    const km = Number(data.distanceKm);
    if (!Number.isFinite(km) || km <= 0) return null;
    const dm =
      data.durationMinutes === null || data.durationMinutes === undefined
        ? null
        : Number(data.durationMinutes);
    const durationMinutes =
      dm !== null && Number.isFinite(dm) ? dm : null;
    return { distanceKm: km, durationMinutes };
  } catch {
    return null;
  }
}

function writeRouteCache(
  origin: string,
  destination: string,
  distanceKm: number,
  durationMinutes: number | null,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: RouteCachePayload = {
      key: routePairKey(origin, destination),
      distanceKm,
      durationMinutes,
    };
    sessionStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function buildInputKey(
  departure: string,
  arrival: string,
  offeredStr: string,
  distanceStr: string,
  costStr: string,
  emptyReturn: boolean,
  selectedVehicleId: string,
  manualDistanceMode: boolean,
): string {
  return [
    departure.trim(),
    arrival.trim(),
    offeredStr.trim(),
    distanceStr.trim(),
    costStr.trim(),
    String(emptyReturn),
    selectedVehicleId,
    String(manualDistanceMode),
  ].join("|");
}

export function TripCalculatorForm({
  vehicles,
  vehiclesFuelLoading,
  persistTrip,
  routeReuse = null,
  productiveAllowed = true,
  readOnlyMessageId = "billing_readonly_calculator",
}: {
  vehicles: VehicleProfile[];
  vehiclesFuelLoading: boolean;
  persistTrip: (trip: SavedTrip) => Promise<void>;
  /** From URL: quick reuse of a past route (see TripHistory). */
  routeReuse?: RouteReusePrefill;
  /** When false, blocks new calculations and saving decisions. */
  productiveAllowed?: boolean;
  /** i18n key for the notice above the form when read-only. */
  readOnlyMessageId?: MessageId;
}) {
  const { t, effectiveLocale } = useLocale();

  function collectBaseErrors(
    dep: string,
    arr: string,
    offered: number,
    costPerKm: number,
  ): FormErrors {
    const e: FormErrors = {};
    if (!dep.trim()) e.departure = t("error_departure");
    if (!arr.trim()) e.arrival = t("error_arrival");
    if (!Number.isFinite(offered) || offered <= 0)
      e.offered = t("error_offered");
    if (!Number.isFinite(costPerKm) || costPerKm < 0)
      e.costPerKm = t("error_costPerKm");
    return e;
  }

  function collectManualDistanceErrors(distance: number): FormErrors {
    const e: FormErrors = {};
    if (!Number.isFinite(distance) || distance <= 0)
      e.distance = t("error_distance");
    return e;
  }

  function profileFuelCaption(v: VehicleProfile): string {
    switch (v.fuelPriceSource) {
      case "manual":
        return t("trip_fuelCaption_manual");
      case "france_average":
        return t("trip_fuelCaption_france");
      case "near_my_location":
        return t("trip_fuelCaption_near");
      default:
        return "";
    }
  }

  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [offeredStr, setOfferedStr] = useState("");
  const [distanceStr, setDistanceStr] = useState("");
  const [manualDistanceMode, setManualDistanceMode] = useState(false);
  const [routeFetchError, setRouteFetchError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [costStr, setCostStr] = useState("");
  const [emptyReturn, setEmptyReturn] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [result, setResult] = useState<TripCalculationResult | null>(null);
  const [resultInputKey, setResultInputKey] = useState<string | null>(null);
  const [inputsAtCalc, setInputsAtCalc] = useState<TripInputs | null>(null);
  const [savedInputKey, setSavedInputKey] = useState<string | null>(null);
  const [resultComputedAt, setResultComputedAt] = useState<number | null>(null);

  const [tripFuelOverrideStr, setTripFuelOverrideStr] = useState("");
  const prevVehiclesFuelLoading = useRef(vehiclesFuelLoading);
  const reuseAppliedRef = useRef(false);
  const reuseSignature = routeReuse
    ? `${routeReuse.departure}\0${routeReuse.arrival}\0${routeReuse.vehicleId}`
    : "";

  useEffect(() => {
    reuseAppliedRef.current = false;
  }, [reuseSignature]);

  useEffect(() => {
    if (
      selectedVehicleId &&
      !vehicles.some((v) => v.id === selectedVehicleId)
    ) {
      setSelectedVehicleId("");
    }
  }, [vehicles, selectedVehicleId]);

  useEffect(() => {
    setRouteFetchError(null);
  }, [departure, arrival]);

  const currentKey = buildInputKey(
    departure,
    arrival,
    offeredStr,
    distanceStr,
    costStr,
    emptyReturn,
    selectedVehicleId,
    manualDistanceMode,
  );

  useEffect(() => {
    if (result === null || resultInputKey === null) return;
    if (currentKey !== resultInputKey) {
      setResult(null);
      setResultComputedAt(null);
      setResultInputKey(null);
      setInputsAtCalc(null);
      setSavedInputKey(null);
    }
  }, [currentKey, result, resultInputKey]);

  const selectedVehicle = selectedVehicleId
    ? vehicles.find((x) => x.id === selectedVehicleId)
    : undefined;

  const applyVehicleSelection = useCallback((nextId: string) => {
    setSelectedVehicleId(nextId);
    setTripFuelOverrideStr("");
    if (!nextId) return;
    const v = vehicles.find((x) => x.id === nextId);
    if (v) setCostStr(formatCostPerKmInput(v.totalCostPerKm));
  }, [vehicles]);

  useEffect(() => {
    if (
      prevVehiclesFuelLoading.current &&
      !vehiclesFuelLoading &&
      selectedVehicleId &&
      !tripFuelOverrideStr.trim()
    ) {
      const v = vehicles.find((x) => x.id === selectedVehicleId);
      if (v) setCostStr(formatCostPerKmInput(v.totalCostPerKm));
    }
    prevVehiclesFuelLoading.current = vehiclesFuelLoading;
  }, [
    vehiclesFuelLoading,
    vehicles,
    selectedVehicleId,
    tripFuelOverrideStr,
  ]);

  useEffect(() => {
    if (!routeReuse) return;
    const has =
      routeReuse.departure.trim() ||
      routeReuse.arrival.trim() ||
      routeReuse.vehicleId.trim();
    if (!has) return;
    if (reuseAppliedRef.current) return;
    if (routeReuse.vehicleId && vehicles.length === 0) return;

    if (routeReuse.departure.trim()) setDeparture(routeReuse.departure.trim());
    if (routeReuse.arrival.trim()) setArrival(routeReuse.arrival.trim());
    if (routeReuse.vehicleId.trim()) {
      const id = routeReuse.vehicleId.trim();
      if (vehicles.some((v) => v.id === id)) {
        applyVehicleSelection(id);
      }
    }

    reuseAppliedRef.current = true;
    try {
      const u = new URL(window.location.href);
      u.searchParams.delete("reuseFrom");
      u.searchParams.delete("reuseTo");
      u.searchParams.delete("reuseVehicle");
      window.history.replaceState(null, "", `${u.pathname}${u.search}${u.hash}`);
    } catch {
      /* ignore */
    }
  }, [routeReuse, vehicles, applyVehicleSelection]);

  function handleCostStrChange(value: string) {
    setTripFuelOverrideStr("");
    setCostStr(value);
  }

  function handleTripFuelOverrideChange(value: string) {
    setTripFuelOverrideStr(value);
    const trimmed = value.trim();
    const v = vehicles.find((x) => x.id === selectedVehicleId);
    if (!v) return;
    if (!trimmed) {
      setCostStr(formatCostPerKmInput(v.totalCostPerKm));
      return;
    }
    const price = parseDecimal(trimmed);
    if (!Number.isFinite(price) || price < 0) return;
    setCostStr(
      formatCostPerKmInput(computeTotalCostPerKmWithEffectiveFuel(v, price)),
    );
  }

  async function performProfitCheck(
    ev: FormEvent | null,
    forceAutomaticDistance?: boolean,
  ) {
    if (ev) ev.preventDefault();
    if (!productiveAllowed) return;
    const useManualDistance = forceAutomaticDistance ? false : manualDistanceMode;

    const offered = parseDecimal(offeredStr);
    const costPerKm = parseDecimal(costStr);

    const baseErrors = collectBaseErrors(departure, arrival, offered, costPerKm);
    setRouteFetchError(null);

    if (useManualDistance) {
      const distance = parseDecimal(distanceStr);
      const distErrors = collectManualDistanceErrors(distance);
      const nextErrors = { ...baseErrors, ...distErrors };
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        setResult(null);
        setResultComputedAt(null);
        setResultInputKey(null);
        setInputsAtCalc(null);
        setSavedInputKey(null);
        return;
      }

      const selected = selectedVehicleId
        ? vehicles.find((v) => v.id === selectedVehicleId)
        : undefined;

      const inputs: TripInputs = {
        departureCity: departure.trim(),
        arrivalCity: arrival.trim(),
        offeredPrice: offered,
        distanceKm: distance,
        costPerKm,
        emptyReturn,
        vehicleId: selected ? selected.id : null,
        vehicleName: selected ? selected.name : null,
        distanceSource: "manual",
        routeDurationMinutes: null,
      };

      const calc = calculateTrip(inputs);
      const key = buildInputKey(
        departure,
        arrival,
        offeredStr,
        distanceStr,
        costStr,
        emptyReturn,
        selectedVehicleId,
        manualDistanceMode,
      );

      setResult(calc);
      setResultComputedAt(Date.now());
      setResultInputKey(key);
      setInputsAtCalc(inputs);
      setSavedInputKey(null);
      return;
    }

    setErrors(baseErrors);
    if (Object.keys(baseErrors).length > 0) {
      setResult(null);
      setResultComputedAt(null);
      setResultInputKey(null);
      setInputsAtCalc(null);
      setSavedInputKey(null);
      return;
    }

    setCalculating(true);
    let distanceKm = 0;
    let routeDurationMinutes: number | null = null;

    try {
      const cached = readRouteCache(departure, arrival);
      if (cached) {
        distanceKm = cached.distanceKm;
        routeDurationMinutes = cached.durationMinutes;
      } else {
        const res = await fetch("/api/route-distance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: departure.trim(),
            destination: arrival.trim(),
          }),
        });

        const payload: unknown = await res.json().catch(() => null);
        const rec =
          payload && typeof payload === "object"
            ? (payload as Record<string, unknown>)
            : null;

        if (!res.ok) {
          setRouteFetchError(t("trip_routeError"));
          setManualDistanceMode(true);
          setCalculating(false);
          return;
        }

        const km = Number(rec?.distanceKm);
        if (!Number.isFinite(km) || km <= 0) {
          setRouteFetchError(t("trip_routeError"));
          setManualDistanceMode(true);
          setCalculating(false);
          return;
        }

        distanceKm = km;
        const dm = rec?.durationMinutes;
        if (dm === null || dm === undefined) {
          routeDurationMinutes = null;
        } else {
          const n = Number(dm);
          routeDurationMinutes = Number.isFinite(n) ? n : null;
        }

        writeRouteCache(
          departure,
          arrival,
          distanceKm,
          routeDurationMinutes,
        );
      }
    } catch {
      setRouteFetchError(t("trip_routeError"));
      setManualDistanceMode(true);
      setCalculating(false);
      return;
    }

    setCalculating(false);

    const selected = selectedVehicleId
      ? vehicles.find((v) => v.id === selectedVehicleId)
      : undefined;

    const inputs: TripInputs = {
      departureCity: departure.trim(),
      arrivalCity: arrival.trim(),
      offeredPrice: offered,
      distanceKm,
      costPerKm,
      emptyReturn,
      vehicleId: selected ? selected.id : null,
      vehicleName: selected ? selected.name : null,
      distanceSource: "google_routes",
      routeDurationMinutes,
    };

    const calc = calculateTrip(inputs);
    const key = buildInputKey(
      departure,
      arrival,
      offeredStr,
      distanceStr,
      costStr,
      emptyReturn,
      selectedVehicleId,
      manualDistanceMode,
    );

    setResult(calc);
    setResultComputedAt(Date.now());
    setResultInputKey(key);
    setInputsAtCalc(inputs);
    setSavedInputKey(null);
  }

  async function handleDecision(decision: "accepted" | "declined") {
    if (!productiveAllowed) return;
    if (!result || !inputsAtCalc || resultInputKey === null) return;
    if (savedInputKey === resultInputKey) return;

    const now = new Date().toISOString();
    const saved: SavedTrip = {
      id: crypto.randomUUID(),
      createdAt: now,
      savedAt: now,
      departureCity: inputsAtCalc.departureCity,
      arrivalCity: inputsAtCalc.arrivalCity,
      offeredPrice: inputsAtCalc.offeredPrice,
      totalCost: result.totalCost,
      profit: result.profit,
      status: result.status,
      distanceKm: inputsAtCalc.distanceKm,
      emptyReturn: inputsAtCalc.emptyReturn,
      marginPercent: result.marginPercent,
      vehicleName: inputsAtCalc.vehicleName,
      vehicleId: inputsAtCalc.vehicleId,
      decision,
      calcKey: resultInputKey,
    };

    await persistTrip(saved);
    setSavedInputKey(resultInputKey);
  }

  const canRecordDecision =
    productiveAllowed &&
    Boolean(result && inputsAtCalc && resultInputKey !== null) &&
    savedInputKey !== resultInputKey;

  const decisionHint = !result
    ? undefined
    : savedInputKey === resultInputKey
      ? t("trip_recordedHint")
      : undefined;

  const profileCostStr = selectedVehicle
    ? formatCostPerKmInput(selectedVehicle.totalCostPerKm)
    : null;
  const costMatchesVehicleProfile =
    Boolean(selectedVehicle && profileCostStr !== null && costStr === profileCostStr);

  let costSourceHint: string | null = null;
  if (tripFuelOverrideStr.trim()) {
    costSourceHint = t("trip_costHint_override");
  } else if (selectedVehicle && costMatchesVehicleProfile) {
    costSourceHint = t("trip_costHint_profile");
  } else {
    costSourceHint = t("trip_costHint_custom");
  }

  const costHelper = selectedVehicleId
    ? tripFuelOverrideStr.trim()
      ? t("trip_costHelper_vehicle")
      : t("trip_costHelper_vehicle2")
    : t("trip_costHelper_noVehicle");

  const selectedEffectiveFuelPerLiter = selectedVehicle
    ? effectiveFuelPerLiterFromProfile(selectedVehicle)
    : null;

  const egPrefix = effectiveLocale === "fr" ? "ex." : "e.g.";
  const tripFuelPlaceholder =
    selectedEffectiveFuelPerLiter !== null
      ? `${egPrefix} ${selectedEffectiveFuelPerLiter.toFixed(2)}`
      : t("trip_ph_fuelOverride");

  function openManualDistanceEditor() {
    setManualDistanceMode(true);
    setRouteFetchError(null);
    if (inputsAtCalc?.distanceKm) {
      setDistanceStr(String(inputsAtCalc.distanceKm));
    }
  }

  function useAutomaticDistance() {
    setManualDistanceMode(false);
    setDistanceStr("");
    setRouteFetchError(null);
  }

  return (
    <div id="trip-calculator" className="grid gap-6 scroll-mt-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">{t("trip_newTitle")}</CardTitle>
          <CardDescription className="leading-relaxed">
            {t("trip_newDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!productiveAllowed ? (
            <div className="mb-4 rounded-md border border-[var(--border)] bg-neutral-50 px-3 py-2 text-sm text-[var(--foreground)] dark:bg-neutral-950">
              {t(readOnlyMessageId)}
            </div>
          ) : null}
          <form
            onSubmit={(e) => void performProfitCheck(e)}
            className="space-y-4"
            noValidate
          >
            <fieldset
              disabled={!productiveAllowed}
              className="min-w-0 space-y-4 border-0 p-0"
            >
            <div className="grid gap-4 sm:grid-cols-2">
              <CityAutocompleteInput
                id="departure"
                name="departure"
                label={t("trip_label_departure")}
                value={departure}
                onChange={setDeparture}
                placeholder={t("trip_ph_departure")}
                error={errors.departure}
              />
              <CityAutocompleteInput
                id="arrival"
                name="arrival"
                label={t("trip_label_arrival")}
                value={arrival}
                onChange={setArrival}
                placeholder={t("trip_ph_arrival")}
                error={errors.arrival}
              />
            </div>
            <p className="text-xs text-[var(--muted)]">{t("trip_placesHint")}</p>

            <div className="space-y-2">
              <Label htmlFor="offered">{t("trip_offeredLabel")}</Label>
              <Input
                id="offered"
                name="offered"
                inputMode="decimal"
                value={offeredStr}
                onChange={(e) => setOfferedStr(e.target.value)}
                placeholder={t("trip_ph_offered")}
                aria-invalid={!!errors.offered}
              />
              {errors.offered ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.offered}
                </p>
              ) : null}
            </div>

            {routeFetchError ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                {routeFetchError}
              </div>
            ) : null}

            {manualDistanceMode ? (
              <div className="space-y-2">
                <Label htmlFor="distance">{t("trip_distanceLabel")}</Label>
                <Input
                  id="distance"
                  name="distance"
                  inputMode="decimal"
                  value={distanceStr}
                  onChange={(e) => setDistanceStr(e.target.value)}
                  placeholder={t("trip_ph_distance")}
                  aria-invalid={!!errors.distance}
                />
                {errors.distance ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.distance}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--muted)]">
                    {t("trip_distanceManualHint")}
                  </p>
                )}
                <button
                  type="button"
                  className="text-xs font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                  onClick={useAutomaticDistance}
                >
                  {t("trip_useAutoDistance")}
                </button>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)]">
                <button
                  type="button"
                  className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                  onClick={openManualDistanceEditor}
                >
                  {t("trip_editDistanceManual")}
                </button>
                <span className="text-[var(--muted)]">
                  {" "}
                  {t("trip_editDistanceOptional")}
                </span>
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="vehicle">{t("trip_vehicleLabel")}</Label>
              <select
                id="vehicle"
                value={selectedVehicleId}
                onChange={(e) => applyVehicleSelection(e.target.value)}
                className={cn(inputClassName, "cursor-pointer")}
              >
                <option value="">{t("trip_vehicleManual")}</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {interpolate(translate(effectiveLocale, "trip_vehicleOption"), {
                      name: v.name,
                      cost: formatCostPerKmInput(v.totalCostPerKm),
                    })}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[var(--muted)]">
                {t("trip_vehicleHelp")}{" "}
                <Link
                  href="/app?section=vehicles"
                  className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                >
                  {t("trip_addVehicles")}
                </Link>
              </p>
              {selectedVehicle ? (
                <div className="rounded-md border border-[var(--border)] bg-neutral-50 px-3 py-2 text-xs dark:bg-neutral-950">
                  <p className="font-medium capitalize text-[var(--foreground)]">
                    {selectedVehicle.fuelType === "diesel"
                      ? t("trip_diesel")
                      : t("trip_petrol")}{" "}
                    {t("trip_effectiveFuel")}
                  </p>
                  {vehiclesFuelLoading ? (
                    <p className="mt-1 text-[var(--muted)]">
                      {t("trip_updatingFuel")}
                    </p>
                  ) : (
                    <>
                      <p className="mt-1 text-base font-semibold tabular-nums text-[var(--foreground)]">
                        {selectedEffectiveFuelPerLiter !== null
                          ? `${formatEur(selectedEffectiveFuelPerLiter)} / L`
                          : "—"}
                      </p>
                      <p className="mt-1 text-[var(--muted)]">
                        {profileFuelCaption(selectedVehicle)}
                      </p>
                    </>
                  )}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">{t("trip_costPerKm")}</Label>
              {costSourceHint ? (
                <p className="text-xs text-[var(--muted)]">{costSourceHint}</p>
              ) : null}
              <Input
                id="cost"
                name="cost"
                inputMode="decimal"
                value={costStr}
                onChange={(e) => handleCostStrChange(e.target.value)}
                placeholder={t("trip_ph_cost")}
                aria-invalid={!!errors.costPerKm}
              />

              {selectedVehicle ? (
                <details className="group rounded-md border border-dashed border-[var(--border)] bg-transparent px-3 py-2 text-xs">
                  <summary className="cursor-pointer list-none text-[var(--muted)] marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="underline-offset-2 group-open:underline">
                      {t("trip_fuelOverrideSummary")}
                    </span>
                  </summary>
                  <div className="mt-2 space-y-1.5">
                    <Label
                      htmlFor="trip-fuel-override"
                      className="text-xs font-normal text-[var(--muted)]"
                    >
                      {t("trip_fuelOverrideLabel")}
                    </Label>
                    <Input
                      id="trip-fuel-override"
                      name="tripFuelOverride"
                      inputMode="decimal"
                      value={tripFuelOverrideStr}
                      onChange={(e) => handleTripFuelOverrideChange(e.target.value)}
                      placeholder={tripFuelPlaceholder}
                      className="h-9 max-w-[12rem] text-sm"
                    />
                    <p className="text-[var(--muted)]">{t("trip_fuelOverrideHelp")}</p>
                  </div>
                </details>
              ) : null}

              {errors.costPerKm ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.costPerKm}
                </p>
              ) : (
                <p className="text-xs text-[var(--muted)]">{costHelper}</p>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] p-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-[var(--border)]"
                checked={emptyReturn}
                onChange={(e) => setEmptyReturn(e.target.checked)}
              />
              <span>
                <span className="font-medium">{t("trip_emptyReturnTitle")}</span>
                <span className="mt-0.5 block text-sm text-[var(--muted)]">
                  {t("trip_emptyReturnHelp")}
                </span>
              </span>
            </label>

            <MagicAccentSubmit
              className="w-full sm:w-auto"
              type="submit"
              disabled={calculating || !productiveAllowed}
            >
              {calculating ? t("trip_checking") : t("trip_checkCta")}
            </MagicAccentSubmit>
            </fieldset>
          </form>
        </CardContent>
      </Card>

      <TripResults
        result={result}
        showDecisionActions={Boolean(result)}
        onAccept={() => void handleDecision("accepted")}
        onDecline={() => void handleDecision("declined")}
        decisionDisabled={!canRecordDecision}
        decisionHint={decisionHint}
        computedAtMs={resultComputedAt}
        readOnlyMessage={
          !productiveAllowed && result ? t("billing_readonly_decision") : undefined
        }
      />
    </div>
  );
}
