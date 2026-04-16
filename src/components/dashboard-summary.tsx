"use client";

import { formatEur, formatPercent } from "@/lib/format";
import { useLocale } from "@/contexts/locale-context";
import type { DashboardStats } from "@/lib/dashboard";
import { UpgradeValueSection } from "@/components/upgrade-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UiLocale } from "@/lib/i18n/locale-types";

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
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

function formatShortDate(iso: string, locale: UiLocale): string {
  try {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function DashboardSummary({ stats }: { stats: DashboardStats }) {
  const { t, effectiveLocale } = useLocale();
  const avg =
    stats.averageProfit !== null ? formatEur(stats.averageProfit) : "—";
  const avgMargin =
    stats.averageMarginPercent !== null
      ? formatPercent(stats.averageMarginPercent)
      : "—";

  const sameBestWorst =
    stats.totalTrips === 1 &&
    stats.bestTrip &&
    stats.worstTrip &&
    stats.bestTrip.createdAt === stats.worstTrip.createdAt;

  return (
    <Card>
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-lg tracking-tight">{t("dashboard_title")}</CardTitle>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          {t("dashboard_intro")}
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {stats.totalTrips > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {t("dashboard_valueStripCaption")}
            </p>
            <UpgradeValueSection stats={stats} density="compact" />
          </div>
        ) : null}

        <div className="space-y-4 rounded-xl border border-emerald-200/80 bg-emerald-50/90 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/35">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300/90">
              {t("dashboard_lossesAllTime")}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-emerald-800 dark:text-emerald-300">
              {formatEur(stats.lossesAvoided)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-emerald-900/85 dark:text-emerald-100/80">
              {t("dashboard_lossesExplain")}
            </p>
          </div>
          {stats.lossesAvoidedThisMonth > 0 ? (
            <div className="border-t border-emerald-200/70 pt-4 dark:border-emerald-800/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300/90">
                {t("dashboard_thisMonth")}
              </p>
              <p className="mt-1.5 text-xl font-semibold tabular-nums text-emerald-800 dark:text-emerald-300">
                {formatEur(stats.lossesAvoidedThisMonth)}
              </p>
            </div>
          ) : null}
        </div>

        {stats.totalTrips > 0 ? (
          <div className="space-y-3 rounded-lg border border-[var(--border)] bg-neutral-50/80 p-4 dark:bg-neutral-950/50">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {t("dashboard_insights")}
            </p>
            <ul className="space-y-2.5 text-sm leading-relaxed text-[var(--foreground)]">
              {stats.bestTrip ? (
                <li>
                  <span className="text-[var(--muted)]">{t("dashboard_mostProfitable")} </span>
                  <span className="font-medium">{formatEur(stats.bestTrip.profit)}</span>
                  <span className="text-[var(--muted)]"> — {stats.bestTrip.route}</span>
                  <span className="text-xs text-[var(--muted)]">
                    {" "}
                    ({formatShortDate(stats.bestTrip.createdAt, effectiveLocale)})
                  </span>
                </li>
              ) : null}
              {stats.worstTrip && !sameBestWorst ? (
                <li>
                  <span className="text-[var(--muted)]">{t("dashboard_leastProfitable")} </span>
                  <span className="font-medium">{formatEur(stats.worstTrip.profit)}</span>
                  <span className="text-[var(--muted)]"> — {stats.worstTrip.route}</span>
                </li>
              ) : null}
              {stats.averageMarginPercent !== null ? (
                <li>
                  <span className="text-[var(--muted)]">{t("dashboard_avgMargin")} </span>
                  <span className="font-medium tabular-nums">{avgMargin}</span>
                </li>
              ) : null}
              {stats.oftenLowMarginAccepted ? (
                <li className="rounded-md border border-amber-200/90 bg-amber-50 px-3 py-2 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
                  {t("dashboard_lowMarginWarning")}
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            label={t("dashboard_stat_trips")}
            value={String(stats.totalTrips)}
            hint={t("dashboard_stat_tripsHint")}
          />
          <Stat label={t("dashboard_stat_accepted")} value={String(stats.acceptedCount)} />
          <Stat label={t("dashboard_stat_declined")} value={String(stats.declinedCount)} />
          <Stat label={t("dashboard_stat_avgProfit")} value={avg} />
          <Stat
            label={t("dashboard_stat_totalPotential")}
            value={formatEur(stats.totalPotentialProfit)}
            hint={t("dashboard_stat_totalPotentialHint")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
