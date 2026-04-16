"use client";

import type { VehicleProfile } from "@/types/vehicle";
import { useLocale } from "@/contexts/locale-context";
import { formatEur } from "@/lib/format";
import {
  fuelPriceSourceDetail,
  fuelPriceSourceTitle,
} from "@/lib/fuel-labels";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatPerKm(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${formatEur(value)} / km`;
}

function formatProfileSince(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return "";
  }
}

function fuelFixedSplit(v: VehicleProfile): { fuelPct: number; fixedPct: number } {
  const t = v.totalCostPerKm;
  if (!Number.isFinite(t) || t <= 0) return { fuelPct: 0, fixedPct: 0 };
  const f = Math.max(0, v.fuelCostPerKm);
  const x = Math.max(0, v.fixedCostPerKm);
  const sum = f + x;
  if (sum <= 0) return { fuelPct: 0, fixedPct: 0 };
  return {
    fuelPct: Math.round((f / sum) * 100),
    fixedPct: Math.round((x / sum) * 100),
  };
}

/** Effective €/L used for operating cost (base benchmark + adjustment). */
function effectiveFuelPricePerLiter(v: VehicleProfile): number {
  return v.fuelPricePerLiter + v.fuelAdjustmentPerLiter;
}

export function VehicleList({
  vehicles,
  removeVehicle,
  productiveAllowed = true,
}: {
  vehicles: VehicleProfile[];
  removeVehicle: (id: string) => Promise<void>;
  productiveAllowed?: boolean;
}) {
  const { t, effectiveLocale } = useLocale();

  async function handleDelete(id: string) {
    if (!productiveAllowed) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(t("vehicle_confirmDelete"))
    ) {
      return;
    }
    await removeVehicle(id);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("vehicles_savedTitle")}</CardTitle>
        <CardDescription>{t("vehicles_savedDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <p className="rounded-md border border-dashed border-[var(--border)] bg-neutral-50 p-6 text-sm text-[var(--muted)] dark:bg-neutral-950">
            {t("vehicles_empty")}
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-3 md:hidden">
              {vehicles.map((v) => (
                <li
                  key={v.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold leading-tight">
                        {v.name}
                      </p>
                      <p className="mt-1 text-sm capitalize text-[var(--muted)]">
                        {v.vehicleType} · {v.fuelType}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      disabled={!productiveAllowed}
                      onClick={() => void handleDelete(v.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-[var(--border)] pt-4 text-sm sm:grid-cols-3">
                    <div className="sm:col-span-3">
                      <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">
                        {t("vehicles_totalPerKm")}
                      </dt>
                      <dd className="tabular-nums text-xl font-bold tracking-tight text-[var(--foreground)]">
                        {formatPerKm(v.totalCostPerKm)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">{t("vehicles_fuelPerKm")}</dt>
                      <dd className="tabular-nums">{formatPerKm(v.fuelCostPerKm)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">{t("vehicles_fixedPerKm")}</dt>
                      <dd className="tabular-nums">{formatPerKm(v.fixedCostPerKm)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">{t("vehicles_split")}</dt>
                      <dd className="tabular-nums">
                        {(() => {
                          const { fuelPct, fixedPct } = fuelFixedSplit(v);
                          return `${fuelPct}% · ${fixedPct}%`;
                        })()}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs leading-relaxed text-[var(--muted)]">
                    <span className="font-medium text-[var(--foreground)]">
                      {fuelPriceSourceTitle(v.fuelPriceSource, effectiveLocale)}
                    </span>
                    {" · "}
                    <span className="tabular-nums">
                      {formatEur(effectiveFuelPricePerLiter(v))}
                      {t("vehicles_effectivePerL")}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {fuelPriceSourceDetail(v.fuelPriceSource, effectiveLocale)}{" "}
                    {t("vehicles_profileSince")} {formatProfileSince(v.createdAt)}.
                  </p>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                    <th className="py-2 pr-3 font-medium">{t("vehicles_table_name")}</th>
                    <th className="py-2 pr-3 font-medium">{t("vehicles_table_typeFuel")}</th>
                    <th className="py-2 pr-3 font-medium">{t("vehicles_table_benchmark")}</th>
                    <th className="py-2 pr-3 font-medium">{t("vehicles_table_total")}</th>
                    <th className="py-2 pr-3 font-medium">{t("vehicles_fuelPerKm")}</th>
                    <th className="py-2 pr-3 font-medium">{t("vehicles_fixedPerKm")}</th>
                    <th className="py-2 pr-3 font-medium">{t("vehicles_table_split")}</th>
                    <th className="py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-3 pr-3 font-medium">{v.name}</td>
                      <td className="py-3 pr-3 text-[var(--muted)]">
                        <span className="capitalize">{v.vehicleType}</span>
                        <span className="text-[var(--muted)]"> · </span>
                        <span className="capitalize">{v.fuelType}</span>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="font-medium text-[var(--foreground)]">
                          {fuelPriceSourceTitle(v.fuelPriceSource, effectiveLocale)}
                        </div>
                        <div className="mt-0.5 text-xs tabular-nums text-[var(--muted)]">
                          {formatEur(effectiveFuelPricePerLiter(v))}/L
                        </div>
                      </td>
                      <td className="py-3 pr-3 tabular-nums font-semibold">
                        {formatPerKm(v.totalCostPerKm)}
                      </td>
                      <td className="py-3 pr-3 tabular-nums text-[var(--muted)]">
                        {formatPerKm(v.fuelCostPerKm)}
                      </td>
                      <td className="py-3 pr-3 tabular-nums text-[var(--muted)]">
                        {formatPerKm(v.fixedCostPerKm)}
                      </td>
                      <td className="py-3 pr-3 text-sm text-[var(--muted)]">
                        {(() => {
                          const { fuelPct, fixedPct } = fuelFixedSplit(v);
                          return `${fuelPct}% · ${fixedPct}%`;
                        })()}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!productiveAllowed}
                          onClick={() => void handleDelete(v.id)}
                        >
                          {t("vehicles_delete")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
