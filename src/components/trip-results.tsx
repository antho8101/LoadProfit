"use client";

import type { TripCalculationResult } from "@/types/trip";
import { formatEur, formatKm, formatPercent } from "@/lib/format";
import { ProfitabilityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function decisionMessage(result: TripCalculationResult): string {
  switch (result.status) {
    case "profitable":
      return `This trip would make you an estimated profit of ${formatEur(result.profit)}.`;
    case "low_margin":
      return "This trip is profitable, but the margin is very low.";
    case "loss": {
      const loss = Math.abs(result.profit);
      return `You would lose an estimated ${formatEur(loss)} on this trip.`;
    }
    default:
      return "";
  }
}

export function TripResults({
  result,
  onSave,
  showSave,
  saveDisabled,
  saveHint,
}: {
  result: TripCalculationResult | null;
  onSave: () => void;
  showSave: boolean;
  saveDisabled: boolean;
  saveHint?: string;
}) {
  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted)]">
            Fill in the trip details and click <strong>Calculate Profit</strong>{" "}
            to see whether the job is worth taking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Result</CardTitle>
        <ProfitabilityBadge status={result.status} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-[var(--border)] bg-neutral-50 p-4 text-base font-medium leading-snug dark:bg-neutral-950">
          {decisionMessage(result)}
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-[var(--muted)]">
              Operating distance
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatKm(result.operationalDistanceKm)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-[var(--muted)]">
              Revenue (offered price)
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatEur(result.totalRevenue)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-[var(--muted)]">
              Estimated total cost
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatEur(result.totalCost)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-[var(--muted)]">
              Estimated profit
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatEur(result.profit)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-[var(--muted)]">
              Minimum price to break even
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatEur(result.minimumProfitablePrice)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-[var(--muted)]">
              Margin on offered price
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatPercent(result.marginPercent)}
            </dd>
          </div>
        </dl>

        {showSave ? (
          <div className="space-y-2 border-t border-[var(--border)] pt-4">
            <Button
              type="button"
              variant="default"
              className="w-full sm:w-auto"
              disabled={saveDisabled}
              onClick={onSave}
            >
              Save this trip
            </Button>
            {saveHint ? (
              <p className="text-xs text-[var(--muted)]">{saveHint}</p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-md border border-[var(--border)] bg-neutral-50 p-4 text-sm dark:bg-neutral-950">
          <p className="font-medium">Empty return</p>
          <p className="mt-1 text-[var(--muted)]">
            Extra kilometers:{" "}
            <span className="font-medium text-[var(--foreground)]">
              {formatKm(result.emptyReturnImpact.extraKm)}
            </span>
            {" · "}
            Extra estimated cost:{" "}
            <span className="font-medium text-[var(--foreground)]">
              {formatEur(result.emptyReturnImpact.extraCost)}
            </span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            If empty return is off, these amounts are zero (distance is not
            doubled).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
