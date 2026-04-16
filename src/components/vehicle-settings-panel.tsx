"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/contexts/locale-context";
import { interpolate } from "@/lib/i18n/catalog";
import type { VehicleProfile, VehicleStored } from "@/types/vehicle";
import { VehicleForm } from "@/components/vehicle-form";
import { VehicleList } from "@/components/vehicle-list";
import { cn } from "@/lib/utils";

type Props = {
  vehicles: VehicleProfile[];
  userCoords: { lat: number; lng: number } | null;
  persistVehicle: (v: VehicleStored) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  /** When opened from the Vehicles page, start expanded. */
  initialOpen?: boolean;
  /** When false, block creating/editing/deleting vehicles. */
  productiveAllowed?: boolean;
};

/**
 * Vehicle profiles are occasional setup — collapsed by default so the main
 * calculator stays in focus. Opens automatically only when the last vehicle is
 * removed; closes after the first vehicle is saved (0 → 1).
 */
export function VehicleSettingsPanel({
  vehicles,
  userCoords,
  persistVehicle,
  removeVehicle,
  initialOpen = false,
  productiveAllowed = true,
}: Props) {
  const { t } = useLocale();
  const [open, setOpen] = useState(initialOpen);
  const prevCount = useRef<number | null>(null);

  useEffect(() => {
    const n = vehicles.length;
    const prev = prevCount.current;

    if (prev !== null) {
      if (prev === 0 && n > 0) setOpen(false);
      if (prev > 0 && n === 0) setOpen(true);
    }

    prevCount.current = n;
  }, [vehicles]);

  const count = vehicles.length;
  const summaryTitle =
    count === 0
      ? t("settings_vehicleSetup")
      : interpolate(
          t(count === 1 ? "settings_vehicleSetupCount" : "settings_vehicleSetupCountPlural"),
          { count },
        );

  return (
    <div
      id="vehicle-settings"
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm"
    >
      <button
        type="button"
        id="vehicle-settings-heading"
        aria-expanded={open}
        aria-controls="vehicle-settings-body"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 sm:items-center sm:px-5 sm:py-3.5"
      >
        <span
          className={cn(
            "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-neutral-50 text-[var(--muted)] dark:bg-neutral-950",
            open && "border-[var(--accent)] text-[var(--accent)]",
          )}
          aria-hidden
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("transition-transform duration-200", open && "rotate-180")}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-tight">
            {summaryTitle}
          </span>
          <span className="mt-0.5 block text-xs text-[var(--muted)]">
            {count === 0 ? t("settings_expandEmpty") : t("settings_expandHas")}
          </span>
        </span>
      </button>

      <div
        id="vehicle-settings-body"
        role="region"
        aria-labelledby="vehicle-settings-heading"
        className={cn("border-t border-[var(--border)]", !open && "hidden")}
      >
        <div className="space-y-6 px-4 py-5 sm:px-5">
          <VehicleForm
            persistVehicle={persistVehicle}
            userCoords={userCoords}
            productiveAllowed={productiveAllowed}
          />
          <VehicleList
            vehicles={vehicles}
            removeVehicle={removeVehicle}
            productiveAllowed={productiveAllowed}
          />
        </div>
      </div>
    </div>
  );
}
