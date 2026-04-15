import { formatEur } from "@/lib/format";
import type { DashboardStats } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function DashboardSummary({ stats }: { stats: DashboardStats }) {
  const avg =
    stats.averageProfit !== null ? formatEur(stats.averageProfit) : "—";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Trips saved" value={String(stats.totalTrips)} />
          <Stat label="Profitable" value={String(stats.profitableCount)} />
          <Stat label="Loss-making" value={String(stats.lossCount)} />
          <Stat label="Average profit" value={avg} />
          <Stat
            label="Sum of profits"
            value={formatEur(stats.totalProfitSum)}
            hint="Across saved history"
          />
        </div>
      </CardContent>
    </Card>
  );
}
