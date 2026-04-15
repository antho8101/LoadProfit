"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { FuelPriceSource, FuelType, VehicleProfile, VehicleStored } from "@/types/vehicle";
import { appendVehicle } from "@/lib/storage/vehicles";
import { FRANCE_FUEL_FALLBACK, type FranceFuelResult } from "@/lib/fuel/france-average";
import { parseDecimal } from "@/lib/format";
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

type FieldErrors = Partial<Record<string, string>>;

function formatFuelPriceForInput(value: number): string {
  if (!Number.isFinite(value)) return "";
  return String(Math.round(value * 1000) / 1000);
}

function validateVehicleForm(values: {
  name: string;
  vehicleType: string;
  consumption: number;
  fuelPrice: number;
  fuelAdjustment: number;
  insurance: number;
  maintenance: number;
  tires: number;
  otherFixed: number;
  monthlyKm: number;
}): FieldErrors {
  const e: FieldErrors = {};
  if (!values.name.trim()) e.name = "Enter a name for this vehicle.";
  if (!values.vehicleType.trim())
    e.vehicleType = "Enter a vehicle type (e.g. rigid truck).";
  if (!Number.isFinite(values.monthlyKm) || values.monthlyKm <= 0)
    e.monthlyKm = "Estimated monthly kilometers must be greater than zero.";
  if (!Number.isFinite(values.consumption) || values.consumption < 0)
    e.consumption = "Consumption cannot be negative.";
  if (!Number.isFinite(values.fuelPrice) || values.fuelPrice < 0)
    e.fuelPrice = "Base fuel price cannot be negative.";
  if (!Number.isFinite(values.fuelAdjustment))
    e.fuelAdjustment = "Enter a valid adjustment (use 0 if none).";
  const effective = values.fuelPrice + values.fuelAdjustment;
  if (effective < 0)
    e.fuelAdjustment =
      "Base price + adjustment cannot be negative overall.";
  if (!Number.isFinite(values.insurance) || values.insurance < 0)
    e.insurance = "Insurance cannot be negative.";
  if (!Number.isFinite(values.maintenance) || values.maintenance < 0)
    e.maintenance = "Maintenance cannot be negative.";
  if (!Number.isFinite(values.tires) || values.tires < 0)
    e.tires = "Tire budget cannot be negative.";
  if (!Number.isFinite(values.otherFixed) || values.otherFixed < 0)
    e.otherFixed = "Other fixed costs cannot be negative.";
  return e;
}

export function VehicleForm({
  onCreated,
}: {
  onCreated: (vehicles: VehicleProfile[]) => void;
}) {
  const [name, setName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("diesel");
  const [fuelPriceSource, setFuelPriceSource] =
    useState<FuelPriceSource>("manual");
  const [consumptionStr, setConsumptionStr] = useState("");
  const [fuelPriceStr, setFuelPriceStr] = useState("");
  const [fuelAdjustmentStr, setFuelAdjustmentStr] = useState("0");
  const [insuranceStr, setInsuranceStr] = useState("");
  const [maintenanceStr, setMaintenanceStr] = useState("");
  const [tiresStr, setTiresStr] = useState("");
  const [otherFixedStr, setOtherFixedStr] = useState("");
  const [monthlyKmStr, setMonthlyKmStr] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [franceFuelHint, setFranceFuelHint] = useState<
    "live" | "fallback" | null
  >(null);

  useEffect(() => {
    if (fuelPriceSource !== "france_average") {
      setFranceFuelHint(null);
      return;
    }

    let cancelled = false;

    async function loadFranceAverage() {
      setFranceFuelHint(null);
      try {
        const res = await fetch("/api/fuel/france-average", {
          cache: "no-store",
        });
        const j = (await res.json()) as FranceFuelResult;
        if (cancelled) return;
        const price =
          fuelType === "diesel" ? j.diesel : j.petrol;
        setFuelPriceStr(formatFuelPriceForInput(price));
        setFranceFuelHint(
          j.source === "official_france_dataset" ? "live" : "fallback",
        );
      } catch {
        if (cancelled) return;
        const price =
          fuelType === "diesel"
            ? FRANCE_FUEL_FALLBACK.diesel
            : FRANCE_FUEL_FALLBACK.petrol;
        setFuelPriceStr(formatFuelPriceForInput(price));
        setFranceFuelHint("fallback");
      }
    }

    void loadFranceAverage();
    return () => {
      cancelled = true;
    };
  }, [fuelPriceSource, fuelType]);

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const consumption = parseDecimal(consumptionStr);
    const fuelPrice = parseDecimal(fuelPriceStr);
    const fuelAdjustmentRaw = parseDecimal(fuelAdjustmentStr);
    const fuelAdjustment = Number.isFinite(fuelAdjustmentRaw)
      ? fuelAdjustmentRaw
      : 0;
    const insurance = parseDecimal(insuranceStr);
    const maintenance = parseDecimal(maintenanceStr);
    const tires = parseDecimal(tiresStr);
    const otherFixed = parseDecimal(otherFixedStr);
    const monthlyKm = parseDecimal(monthlyKmStr);

    const nextErrors = validateVehicleForm({
      name,
      vehicleType,
      consumption,
      fuelPrice,
      fuelAdjustment,
      insurance,
      maintenance,
      tires,
      otherFixed,
      monthlyKm,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const stored: VehicleStored = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name: name.trim(),
      vehicleType: vehicleType.trim(),
      fuelType,
      averageConsumptionLPer100Km: consumption,
      fuelPricePerLiter: fuelPrice,
      fuelPriceSource,
      fuelAdjustmentPerLiter: fuelAdjustment,
      monthlyInsurance: insurance,
      monthlyMaintenance: maintenance,
      monthlyTires: tires,
      monthlyOtherFixedCosts: otherFixed,
      estimatedMonthlyKm: monthlyKm,
    };

    const next = appendVehicle(stored);
    onCreated(next);
    setName("");
    setVehicleType("");
    setFuelType("diesel");
    setFuelPriceSource("manual");
    setConsumptionStr("");
    setFuelPriceStr("");
    setFuelAdjustmentStr("0");
    setInsuranceStr("");
    setMaintenanceStr("");
    setTiresStr("");
    setOtherFixedStr("");
    setMonthlyKmStr("");
    setErrors({});
    setFranceFuelHint(null);
  }

  const franceHelper =
    fuelPriceSource === "france_average"
      ? franceFuelHint === "live"
        ? "Auto-filled from current France average fuel price (official open dataset). You can still adjust this value manually."
        : franceFuelHint === "fallback"
          ? "Using fallback average fuel price. Check your connection or try again later — you can still edit the value."
          : "Loading France average…"
      : "Enter your current pump price, or use the France average as a benchmark.";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a vehicle</CardTitle>
        <CardDescription>
          Store fuel and fixed monthly costs. LoadProfit derives an operating
          cost per km you can reuse in the trip calculator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="v-name">Name</Label>
              <Input
                id="v-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Truck 01"
                aria-invalid={!!errors.name}
              />
              {errors.name ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-type">Vehicle type</Label>
              <Input
                id="v-type"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                placeholder="e.g. 19t rigid"
                aria-invalid={!!errors.vehicleType}
              />
              {errors.vehicleType ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.vehicleType}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="v-fuel-type">Fuel type</Label>
              <select
                id="v-fuel-type"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className={cn(inputClassName, "cursor-pointer")}
              >
                <option value="diesel">Diesel</option>
                <option value="petrol">Petrol</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-monthly-km">Estimated monthly km</Label>
              <Input
                id="v-monthly-km"
                inputMode="decimal"
                value={monthlyKmStr}
                onChange={(e) => setMonthlyKmStr(e.target.value)}
                placeholder="e.g. 8500"
                aria-invalid={!!errors.monthlyKm}
              />
              {errors.monthlyKm ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.monthlyKm}
                </p>
              ) : (
                <p className="text-xs text-[var(--muted)]">
                  Used to spread fixed costs per kilometer. Must be &gt; 0.
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Fuel</p>
            <div className="mb-4 space-y-2">
              <Label htmlFor="v-fuel-source">Fuel price source</Label>
              <select
                id="v-fuel-source"
                value={fuelPriceSource}
                onChange={(e) =>
                  setFuelPriceSource(e.target.value as FuelPriceSource)
                }
                className={cn(inputClassName, "cursor-pointer")}
              >
                <option value="manual">Manual (€ / L)</option>
                <option value="france_average">France average (official data)</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="v-cons">Avg. consumption (L / 100 km)</Label>
                <Input
                  id="v-cons"
                  inputMode="decimal"
                  value={consumptionStr}
                  onChange={(e) => setConsumptionStr(e.target.value)}
                  placeholder="e.g. 28"
                  aria-invalid={!!errors.consumption}
                />
                {errors.consumption ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.consumption}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-fuel-price">Base fuel price (€ / L)</Label>
                <Input
                  id="v-fuel-price"
                  inputMode="decimal"
                  value={fuelPriceStr}
                  onChange={(e) => setFuelPriceStr(e.target.value)}
                  placeholder="e.g. 1.65"
                  aria-invalid={!!errors.fuelPrice}
                />
                {errors.fuelPrice ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.fuelPrice}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--muted)]">{franceHelper}</p>
                )}
              </div>
            </div>
            <div className="mt-4 max-w-md space-y-2">
              <Label htmlFor="v-fuel-adj">
                Fuel adjustment (€ / L)
              </Label>
              <Input
                id="v-fuel-adj"
                inputMode="decimal"
                value={fuelAdjustmentStr}
                onChange={(e) => setFuelAdjustmentStr(e.target.value)}
                placeholder="0"
                aria-invalid={!!errors.fuelAdjustment}
              />
              {errors.fuelAdjustment ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.fuelAdjustment}
                </p>
              ) : (
                <p className="text-xs text-[var(--muted)]">
                  Applied on top of the base price (e.g. fuel card discount,
                  negotiated rebate). Effective fuel price = base + adjustment.
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Monthly fixed costs (€)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="v-ins">Insurance</Label>
                <Input
                  id="v-ins"
                  inputMode="decimal"
                  value={insuranceStr}
                  onChange={(e) => setInsuranceStr(e.target.value)}
                  placeholder="0"
                  aria-invalid={!!errors.insurance}
                />
                {errors.insurance ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.insurance}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-maint">Maintenance</Label>
                <Input
                  id="v-maint"
                  inputMode="decimal"
                  value={maintenanceStr}
                  onChange={(e) => setMaintenanceStr(e.target.value)}
                  placeholder="0"
                  aria-invalid={!!errors.maintenance}
                />
                {errors.maintenance ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.maintenance}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-tires">Tires (budget)</Label>
                <Input
                  id="v-tires"
                  inputMode="decimal"
                  value={tiresStr}
                  onChange={(e) => setTiresStr(e.target.value)}
                  placeholder="0"
                  aria-invalid={!!errors.tires}
                />
                {errors.tires ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.tires}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-other">Other fixed costs</Label>
                <Input
                  id="v-other"
                  inputMode="decimal"
                  value={otherFixedStr}
                  onChange={(e) => setOtherFixedStr(e.target.value)}
                  placeholder="0"
                  aria-invalid={!!errors.otherFixed}
                />
                {errors.otherFixed ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.otherFixed}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <Button type="submit" variant="default">
            Save vehicle
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
