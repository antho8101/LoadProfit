"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SavedTrip } from "@/types/trip";
import type { VehicleProfile } from "@/types/vehicle";
import { computeDashboardStats } from "@/lib/dashboard";
import { clearTrips, loadTrips } from "@/lib/storage/trip-history";
import { loadVehicles } from "@/lib/storage/vehicles";
import { DashboardSummary } from "@/components/dashboard-summary";
import { TripCalculatorForm } from "@/components/trip-calculator-form";
import { TripHistory } from "@/components/trip-history";
import { VehicleSettingsPanel } from "@/components/vehicle-settings-panel";

export function TripApp() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);

  useEffect(() => {
    setTrips(loadTrips());
    setVehicles(loadVehicles());
  }, []);

  const stats = useMemo(() => computeDashboardStats(trips), [trips]);

  const handleSaved = useCallback((next: SavedTrip[]) => {
    setTrips(next);
  }, []);

  const handleClear = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Delete all saved trips on this device? This cannot be undone.",
      )
    ) {
      return;
    }
    clearTrips();
    setTrips([]);
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:py-12">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          LoadProfit
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Know if a trip is worth taking
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Compare the offered price to your operating cost per km — using saved
          vehicle profiles or a manual rate — with local history and a simple
          summary.
        </p>
      </header>

      <DashboardSummary stats={stats} />

      <VehicleSettingsPanel
        vehicles={vehicles}
        onVehiclesChange={setVehicles}
      />

      <TripCalculatorForm vehicles={vehicles} onSaved={handleSaved} />

      <TripHistory trips={trips} onClear={handleClear} />
    </div>
  );
}
