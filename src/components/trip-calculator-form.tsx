"use client";

import { useEffect, useState, type FormEvent } from "react";
import { calculateTrip } from "@/lib/calc/trip";
import { formatCostPerKmInput, parseDecimal } from "@/lib/format";
import type { SavedTrip, TripCalculationResult, TripInputs } from "@/types/trip";
import type { VehicleProfile } from "@/types/vehicle";
import { appendTrip } from "@/lib/storage/trip-history";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TripResults } from "@/components/trip-results";

type FormErrors = Partial<Record<string, string>>;

function validate(
  departure: string,
  arrival: string,
  offered: number,
  distance: number,
  costPerKm: number,
): FormErrors {
  const e: FormErrors = {};
  if (!departure.trim()) e.departure = "Enter a departure city.";
  if (!arrival.trim()) e.arrival = "Enter a destination city.";
  if (!Number.isFinite(offered) || offered <= 0)
    e.offered = "Offered price must be greater than zero.";
  if (!Number.isFinite(distance) || distance <= 0)
    e.distance = "Distance must be greater than zero.";
  if (!Number.isFinite(costPerKm) || costPerKm < 0)
    e.costPerKm = "Cost per km cannot be negative.";
  return e;
}

function buildInputKey(
  departure: string,
  arrival: string,
  offeredStr: string,
  distanceStr: string,
  costStr: string,
  emptyReturn: boolean,
  selectedVehicleId: string,
): string {
  return [
    departure.trim(),
    arrival.trim(),
    offeredStr.trim(),
    distanceStr.trim(),
    costStr.trim(),
    String(emptyReturn),
    selectedVehicleId,
  ].join("|");
}

export function TripCalculatorForm({
  vehicles,
  onSaved,
}: {
  vehicles: VehicleProfile[];
  onSaved: (trips: SavedTrip[]) => void;
}) {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [offeredStr, setOfferedStr] = useState("");
  const [distanceStr, setDistanceStr] = useState("");
  const [costStr, setCostStr] = useState("");
  const [emptyReturn, setEmptyReturn] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [result, setResult] = useState<TripCalculationResult | null>(null);
  const [resultInputKey, setResultInputKey] = useState<string | null>(null);
  const [inputsAtCalc, setInputsAtCalc] = useState<TripInputs | null>(null);
  const [savedInputKey, setSavedInputKey] = useState<string | null>(null);

  useEffect(() => {
    if (
      selectedVehicleId &&
      !vehicles.some((v) => v.id === selectedVehicleId)
    ) {
      setSelectedVehicleId("");
    }
  }, [vehicles, selectedVehicleId]);

  const currentKey = buildInputKey(
    departure,
    arrival,
    offeredStr,
    distanceStr,
    costStr,
    emptyReturn,
    selectedVehicleId,
  );

  useEffect(() => {
    if (result === null || resultInputKey === null) return;
    if (currentKey !== resultInputKey) {
      setResult(null);
      setResultInputKey(null);
      setInputsAtCalc(null);
      setSavedInputKey(null);
    }
  }, [currentKey, result, resultInputKey]);

  function applyVehicleSelection(nextId: string) {
    setSelectedVehicleId(nextId);
    if (!nextId) return;
    const v = vehicles.find((x) => x.id === nextId);
    if (v) setCostStr(formatCostPerKmInput(v.totalCostPerKm));
  }

  function handleCalculate(ev: FormEvent) {
    ev.preventDefault();
    const offered = parseDecimal(offeredStr);
    const distance = parseDecimal(distanceStr);
    const costPerKm = parseDecimal(costStr);

    const nextErrors = validate(
      departure,
      arrival,
      offered,
      distance,
      costPerKm,
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setResult(null);
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
    );

    setResult(calc);
    setResultInputKey(key);
    setInputsAtCalc(inputs);
    setSavedInputKey(null);
  }

  function handleSave() {
    if (!result || !inputsAtCalc || resultInputKey === null) return;
    if (savedInputKey === resultInputKey) return;

    const saved: SavedTrip = {
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
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
    };

    const trips = appendTrip(saved);
    onSaved(trips);
    setSavedInputKey(resultInputKey);
  }

  const canSave =
    Boolean(result && inputsAtCalc && resultInputKey !== null) &&
    savedInputKey !== resultInputKey;

  const saveHint = !result
    ? undefined
    : savedInputKey === resultInputKey
      ? "This estimate is saved in your history."
      : undefined;

  const costHelper = selectedVehicleId
    ? "Auto-filled from the selected vehicle profile. You can still adjust it manually."
    : "Enter your blended rate, or pick a saved vehicle to fill this automatically.";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>New trip</CardTitle>
          <CardDescription>
            Enter the job details to estimate profit before you accept.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculate} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="departure">Departure city</Label>
                <Input
                  id="departure"
                  name="departure"
                  autoComplete="address-level2"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  placeholder="e.g. Lyon"
                  aria-invalid={!!errors.departure}
                />
                {errors.departure ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.departure}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrival">Destination city</Label>
                <Input
                  id="arrival"
                  name="arrival"
                  autoComplete="address-level2"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                  placeholder="e.g. Marseille"
                  aria-invalid={!!errors.arrival}
                />
                {errors.arrival ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.arrival}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="offered">Offered price (€)</Label>
                <Input
                  id="offered"
                  name="offered"
                  inputMode="decimal"
                  value={offeredStr}
                  onChange={(e) => setOfferedStr(e.target.value)}
                  placeholder="e.g. 850"
                  aria-invalid={!!errors.offered}
                />
                {errors.offered ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.offered}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (km, one way)</Label>
                <Input
                  id="distance"
                  name="distance"
                  inputMode="decimal"
                  value={distanceStr}
                  onChange={(e) => setDistanceStr(e.target.value)}
                  placeholder="e.g. 320"
                  aria-invalid={!!errors.distance}
                />
                {errors.distance ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.distance}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle (optional)</Label>
              <select
                id="vehicle"
                value={selectedVehicleId}
                onChange={(e) => applyVehicleSelection(e.target.value)}
                className={cn(inputClassName, "cursor-pointer")}
              >
                <option value="">Manual cost per km</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({formatCostPerKmInput(v.totalCostPerKm)} €/km)
                  </option>
                ))}
              </select>
              <p className="text-xs text-[var(--muted)]">
                Selecting a vehicle fills cost per km from your saved profile.{" "}
                <a
                  href="#vehicle-settings"
                  className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                >
                  Add or manage vehicles
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost per km (€ / km)</Label>
              <Input
                id="cost"
                name="cost"
                inputMode="decimal"
                value={costStr}
                onChange={(e) => setCostStr(e.target.value)}
                placeholder="e.g. 0.45"
                aria-invalid={!!errors.costPerKm}
              />
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
                <span className="font-medium">Empty return</span>
                <span className="mt-0.5 block text-sm text-[var(--muted)]">
                  Doubles distance for cost (outbound + unpaid return leg).
                </span>
              </span>
            </label>

            <Button className="w-full sm:w-auto" type="submit" variant="default">
              Calculate Profit
            </Button>
          </form>
        </CardContent>
      </Card>

      <TripResults
        result={result}
        showSave={Boolean(result)}
        onSave={handleSave}
        saveDisabled={!canSave}
        saveHint={saveHint}
      />
    </div>
  );
}
