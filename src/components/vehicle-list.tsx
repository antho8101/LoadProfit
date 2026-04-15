"use client";

import type { VehicleProfile } from "@/types/vehicle";
import { formatEur } from "@/lib/format";
import { deleteVehicle } from "@/lib/storage/vehicles";
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

export function VehicleList({
  vehicles,
  onChange,
}: {
  vehicles: VehicleProfile[];
  onChange: (next: VehicleProfile[]) => void;
}) {
  function handleDelete(id: string) {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Remove this vehicle profile from this device?")
    ) {
      return;
    }
    onChange(deleteVehicle(id));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved vehicles</CardTitle>
        <CardDescription>
          Total cost per km combines variable (fuel) and fixed costs spread over
          your estimated monthly distance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <p className="rounded-md border border-dashed border-[var(--border)] bg-neutral-50 p-6 text-sm text-[var(--muted)] dark:bg-neutral-950">
            No vehicles yet. Add one above to auto-fill cost per km in the trip
            calculator.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Fuel</th>
                  <th className="py-2 pr-3 font-medium">Total / km</th>
                  <th className="py-2 pr-3 font-medium">Fuel / km</th>
                  <th className="py-2 pr-3 font-medium">Fixed / km</th>
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
                      {v.vehicleType}
                    </td>
                    <td className="py-3 pr-3 capitalize text-[var(--muted)]">
                      {v.fuelType}
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
                    <td className="py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDelete(v.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
