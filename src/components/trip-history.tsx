"use client";

import { useMemo } from "react";
import type { SavedTrip } from "@/types/trip";
import { formatEur, formatPercent } from "@/lib/format";
import { ProfitabilityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function TripHistory({
  trips,
  onClear,
}: {
  trips: SavedTrip[];
  onClear: () => void;
}) {
  const empty = trips.length === 0;

  const rows = useMemo(
    () =>
      trips.map((t) => ({
        ...t,
        route: `${t.departureCity} → ${t.arrivalCity}`,
      })),
    [trips],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle>History</CardTitle>
          <p className="text-sm text-[var(--muted)]">
            Stored locally in this browser (up to 100 trips).
          </p>
        </div>
        {!empty ? (
          <Button variant="outline" onClick={onClear}>
            Clear history
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {empty ? (
          <div className="rounded-md border border-dashed border-[var(--border)] bg-neutral-50 p-8 text-center text-sm text-[var(--muted)] dark:bg-neutral-950">
            <p className="font-medium text-[var(--foreground)]">
              No saved trips yet
            </p>
            <p className="mt-2">
              Run a calculation and click <strong>Save this trip</strong> to
              build your history here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Route</th>
                  <th className="py-2 pr-3 font-medium">Vehicle</th>
                  <th className="py-2 pr-3 font-medium">Offered</th>
                  <th className="py-2 pr-3 font-medium">Total cost</th>
                  <th className="py-2 pr-3 font-medium">Profit</th>
                  <th className="py-2 pr-3 font-medium">Margin</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-3 pr-3 align-top tabular-nums text-[var(--muted)]">
                      {formatDate(t.savedAt)}
                    </td>
                    <td className="py-3 pr-3 align-top font-medium">{t.route}</td>
                    <td className="py-3 pr-3 align-top text-[var(--muted)]">
                      {t.vehicleName ?? "—"}
                    </td>
                    <td className="py-3 pr-3 align-top tabular-nums">
                      {formatEur(t.offeredPrice)}
                    </td>
                    <td className="py-3 pr-3 align-top tabular-nums">
                      {formatEur(t.totalCost)}
                    </td>
                    <td className="py-3 pr-3 align-top tabular-nums">
                      {formatEur(t.profit)}
                    </td>
                    <td className="py-3 pr-3 align-top tabular-nums">
                      {formatPercent(t.marginPercent)}
                    </td>
                    <td className="py-3 align-top">
                      <ProfitabilityBadge status={t.status} />
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
