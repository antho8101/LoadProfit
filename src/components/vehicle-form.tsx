"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useLocale } from "@/contexts/locale-context";
import type { FuelPriceSource, FuelType, VehicleStored } from "@/types/vehicle";
import { FRANCE_FUEL_FALLBACK, type FranceFuelResult } from "@/lib/fuel/france-average";
import type { LocalBenchmarkResult } from "@/lib/fuel/local-benchmark";
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

export function VehicleForm({
  persistVehicle,
  userCoords,
}: {
  persistVehicle: (v: VehicleStored) => Promise<void>;
  userCoords: { lat: number; lng: number } | null;
}) {
  const { t } = useLocale();

  function validateVehicleForm(
    values: {
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
    },
    fuelPriceSource: FuelPriceSource,
  ): FieldErrors {
    const e: FieldErrors = {};
    if (!values.name.trim()) e.name = t("vehicle_err_name");
    if (!values.vehicleType.trim()) e.vehicleType = t("vehicle_err_type");
    if (!Number.isFinite(values.monthlyKm) || values.monthlyKm <= 0)
      e.monthlyKm = t("vehicle_err_monthlyKm");
    if (!Number.isFinite(values.consumption) || values.consumption < 0)
      e.consumption = t("vehicle_err_consumption");
    if (fuelPriceSource === "manual") {
      if (!Number.isFinite(values.fuelPrice) || values.fuelPrice <= 0)
        e.fuelPrice = t("vehicle_err_fuelPrice");
    }
    if (!Number.isFinite(values.fuelAdjustment))
      e.fuelAdjustment = t("vehicle_err_adj");
    const baseForEffective =
      fuelPriceSource === "manual" ? values.fuelPrice : 0;
    const effective = baseForEffective + values.fuelAdjustment;
    if (effective < 0) e.fuelAdjustment = t("vehicle_err_adjNegative");
    if (!Number.isFinite(values.insurance) || values.insurance < 0)
      e.insurance = t("vehicle_err_insurance");
    if (!Number.isFinite(values.maintenance) || values.maintenance < 0)
      e.maintenance = t("vehicle_err_maintenance");
    if (!Number.isFinite(values.tires) || values.tires < 0)
      e.tires = t("vehicle_err_tires");
    if (!Number.isFinite(values.otherFixed) || values.otherFixed < 0)
      e.otherFixed = t("vehicle_err_other");
    return e;
  }

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
  const [fuelHelpText, setFuelHelpText] = useState("");
  const [fuelSourceLine, setFuelSourceLine] = useState("");

  useEffect(() => {
    if (fuelPriceSource === "manual") {
      setFuelHelpText(t("vehicle_help_manual"));
      setFuelSourceLine(t("vehicle_line_manual"));
      return;
    }

    if (fuelPriceSource === "france_average") {
      let cancelled = false;
      async function loadFranceAverage() {
        setFuelHelpText(t("vehicle_loading_france"));
        try {
          const res = await fetch("/api/fuel/france-average", {
            cache: "no-store",
          });
          const j = (await res.json()) as FranceFuelResult;
          if (cancelled) return;
          const price = fuelType === "diesel" ? j.diesel : j.petrol;
          setFuelPriceStr(formatFuelPriceForInput(price));
          const ok = j.source === "official_france_dataset";
          setFuelSourceLine(
            ok ? t("vehicle_line_france_ok") : t("vehicle_line_france_fb"),
          );
          setFuelHelpText(
            ok ? t("vehicle_help_france_ok") : t("vehicle_help_france_fb"),
          );
        } catch {
          if (cancelled) return;
          const price =
            fuelType === "diesel"
              ? FRANCE_FUEL_FALLBACK.diesel
              : FRANCE_FUEL_FALLBACK.petrol;
          setFuelPriceStr(formatFuelPriceForInput(price));
          setFuelSourceLine(t("vehicle_line_france_fb"));
          setFuelHelpText(t("vehicle_help_france_fb"));
        }
      }
      void loadFranceAverage();
      return () => {
        cancelled = true;
      };
    }

    if (fuelPriceSource === "near_my_location") {
      let cancelled = false;
      async function loadNear() {
        if (!userCoords) {
          setFuelHelpText(t("vehicle_help_near_noLoc"));
          setFuelSourceLine(t("vehicle_line_france_ok"));
          try {
            const res = await fetch("/api/fuel/france-average", {
              cache: "no-store",
            });
            const j = (await res.json()) as FranceFuelResult;
            if (cancelled) return;
            const price = fuelType === "diesel" ? j.diesel : j.petrol;
            setFuelPriceStr(formatFuelPriceForInput(price));
          } catch {
            if (cancelled) return;
            const price =
              fuelType === "diesel"
                ? FRANCE_FUEL_FALLBACK.diesel
                : FRANCE_FUEL_FALLBACK.petrol;
            setFuelPriceStr(formatFuelPriceForInput(price));
          }
          return;
        }

        setFuelHelpText(t("vehicle_loading_near"));
        try {
          const url = `/api/fuel/local-benchmark?lat=${encodeURIComponent(String(userCoords.lat))}&lng=${encodeURIComponent(String(userCoords.lng))}`;
          const res = await fetch(url, { cache: "no-store" });
          const j = (await res.json()) as LocalBenchmarkResult;
          if (cancelled) return;
          const price = fuelType === "diesel" ? j.diesel : j.petrol;
          setFuelPriceStr(formatFuelPriceForInput(price));

          if (j.scope === "local") {
            setFuelSourceLine(t("vehicle_line_near"));
            setFuelHelpText(t("vehicle_help_near_local"));
          } else if (j.scope === "national_fallback") {
            setFuelSourceLine(t("vehicle_line_france_ok"));
            setFuelHelpText(t("vehicle_help_near_national"));
          } else {
            setFuelSourceLine(t("vehicle_line_fallback_est"));
            setFuelHelpText(t("vehicle_help_fallback"));
          }
        } catch {
          if (cancelled) return;
          try {
            const res = await fetch("/api/fuel/france-average", {
              cache: "no-store",
            });
            const j = (await res.json()) as FranceFuelResult;
            const price = fuelType === "diesel" ? j.diesel : j.petrol;
            setFuelPriceStr(formatFuelPriceForInput(price));
            setFuelSourceLine(t("vehicle_line_france_ok"));
            setFuelHelpText(t("vehicle_help_near_error"));
          } catch {
            const price =
              fuelType === "diesel"
                ? FRANCE_FUEL_FALLBACK.diesel
                : FRANCE_FUEL_FALLBACK.petrol;
            setFuelPriceStr(formatFuelPriceForInput(price));
            setFuelSourceLine(t("vehicle_line_fallback_est"));
            setFuelHelpText(t("vehicle_help_values_fallback"));
          }
        }
      }
      void loadNear();
      return () => {
        cancelled = true;
      };
    }
  }, [fuelPriceSource, fuelType, userCoords, t]);

  const [saving, setSaving] = useState(false);

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const consumption = parseDecimal(consumptionStr);
    const fuelPrice =
      fuelPriceSource === "manual" ? parseDecimal(fuelPriceStr) : 0;
    const fuelAdjustmentRaw = parseDecimal(fuelAdjustmentStr);
    const fuelAdjustment = Number.isFinite(fuelAdjustmentRaw)
      ? fuelAdjustmentRaw
      : 0;
    const insurance = parseDecimal(insuranceStr);
    const maintenance = parseDecimal(maintenanceStr);
    const tires = parseDecimal(tiresStr);
    const otherFixed = parseDecimal(otherFixedStr);
    const monthlyKm = parseDecimal(monthlyKmStr);

    const nextErrors = validateVehicleForm(
      {
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
      },
      fuelPriceSource,
    );
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

    setSaving(true);
    try {
      await persistVehicle(stored);
    } finally {
      setSaving(false);
    }
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
    setFuelHelpText(t("vehicle_help_manual"));
    setFuelSourceLine(t("vehicle_line_manual"));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("vehicle_addTitle")}</CardTitle>
        <CardDescription>{t("vehicle_addDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="v-name">{t("vehicle_name")}</Label>
              <Input
                id="v-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("vehicle_placeholder_name")}
                aria-invalid={!!errors.name}
              />
              {errors.name ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-type">{t("vehicle_type")}</Label>
              <Input
                id="v-type"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                placeholder={t("vehicle_placeholder_type")}
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
              <Label htmlFor="v-fuel-type">{t("vehicle_fuelType")}</Label>
              <select
                id="v-fuel-type"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className={cn(inputClassName, "cursor-pointer")}
              >
                <option value="diesel">{t("trip_diesel")}</option>
                <option value="petrol">{t("trip_petrol")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-monthly-km">{t("vehicle_monthlyKm")}</Label>
              <Input
                id="v-monthly-km"
                inputMode="decimal"
                value={monthlyKmStr}
                onChange={(e) => setMonthlyKmStr(e.target.value)}
                placeholder={t("vehicle_ph_monthlyKm")}
                aria-invalid={!!errors.monthlyKm}
              />
              {errors.monthlyKm ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.monthlyKm}
                </p>
              ) : (
                <p className="text-xs text-[var(--muted)]">
                  {t("vehicle_monthlyKmHint")}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">{t("vehicle_fuelSection")}</p>
            <div className="mb-4 space-y-2">
              <Label htmlFor="v-fuel-source">{t("vehicle_fuelSource")}</Label>
              <select
                id="v-fuel-source"
                value={fuelPriceSource}
                onChange={(e) =>
                  setFuelPriceSource(e.target.value as FuelPriceSource)
                }
                className={cn(inputClassName, "cursor-pointer")}
              >
                <option value="manual">{t("vehicle_opt_manual")}</option>
                <option value="france_average">{t("vehicle_opt_france")}</option>
                <option value="near_my_location">{t("vehicle_opt_near")}</option>
              </select>
              <p className="text-xs text-[var(--muted)]">{fuelSourceLine}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="v-cons">{t("vehicle_cons")}</Label>
                <Input
                  id="v-cons"
                  inputMode="decimal"
                  value={consumptionStr}
                  onChange={(e) => setConsumptionStr(e.target.value)}
                  placeholder={t("vehicle_ph_cons")}
                  aria-invalid={!!errors.consumption}
                />
                {errors.consumption ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.consumption}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                {fuelPriceSource === "manual" ? (
                  <>
                    <Label htmlFor="v-fuel-price">{t("vehicle_basePrice")}</Label>
                    <Input
                      id="v-fuel-price"
                      inputMode="decimal"
                      value={fuelPriceStr}
                      onChange={(e) => setFuelPriceStr(e.target.value)}
                      placeholder={t("vehicle_ph_fuelPrice")}
                      aria-invalid={!!errors.fuelPrice}
                    />
                    {errors.fuelPrice ? (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors.fuelPrice}
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--muted)]">
                        {fuelHelpText}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Label>{t("vehicle_benchmarkLabel")}</Label>
                    <div className="rounded-md border border-[var(--border)] bg-neutral-50 px-3 py-2 text-sm dark:bg-neutral-950">
                      <p className="font-medium tabular-nums text-[var(--foreground)]">
                        {fuelPriceStr.trim() &&
                        Number.isFinite(parseDecimal(fuelPriceStr)) &&
                        parseDecimal(fuelPriceStr) >= 0
                          ? `${formatFuelPriceForInput(parseDecimal(fuelPriceStr))} €/L`
                          : "…"}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {fuelHelpText}
                      </p>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      {t("vehicle_benchmarkNote")}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 max-w-md space-y-2">
              <Label htmlFor="v-fuel-adj">{t("vehicle_fuelAdj")}</Label>
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
                  {fuelPriceSource === "manual"
                    ? t("vehicle_fuelAdjManual")
                    : t("vehicle_fuelAdjBench")}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">{t("vehicle_monthlyFixed")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="v-ins">{t("vehicle_insurance")}</Label>
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
                <Label htmlFor="v-maint">{t("vehicle_maintenance")}</Label>
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
                <Label htmlFor="v-tires">{t("vehicle_tires")}</Label>
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
                <Label htmlFor="v-other">{t("vehicle_other")}</Label>
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

          <Button type="submit" variant="default" disabled={saving}>
            {t("vehicle_save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
