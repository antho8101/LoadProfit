"use client";

import { useMemo } from "react";
import type { DashboardStats } from "@/lib/dashboard";
import {
  userValueMetricsFromStats,
  userValueStoryKind,
} from "@/lib/dashboard";
import { formatEur } from "@/lib/format";
import { useLocale } from "@/contexts/locale-context";
import { cn } from "@/lib/utils";

type UpgradeValueSectionProps = {
  stats: DashboardStats;
  /** `compact` fits the home dashboard; `default` is for Account paywall / trial. */
  density?: "default" | "compact";
};

/**
 * Highlights trip count, cumulative profit on profitable estimates, and losses avoided
 * (declined negative trips). Reuses {@link computeDashboardStats} via `stats`.
 */
export function UpgradeValueSection({
  stats,
  density = "default",
}: UpgradeValueSectionProps) {
  const { t } = useLocale();
  const metrics = useMemo(() => userValueMetricsFromStats(stats), [stats]);
  const kind = userValueStoryKind(metrics);

  const isCompact = density === "compact";

  if (kind === "empty") {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-[var(--border)] bg-neutral-50/90 px-4 py-4 text-center dark:bg-neutral-950/60",
          isCompact && "py-3 text-left",
        )}
      >
        <p
          className={cn(
            "text-sm leading-relaxed text-[var(--muted)]",
            isCompact && "text-xs",
          )}
        >
          {t("upgrade_fallbackInsight")}
        </p>
      </div>
    );
  }

  const titleClass = isCompact
    ? "text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]"
    : "text-xs font-semibold uppercase tracking-wide text-[var(--muted)]";

  const metricNumber = isCompact ? "text-xl" : "text-3xl";
  const metricLabel = isCompact ? "text-xs" : "text-sm";

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-5 shadow-sm",
        isCompact && "px-4 py-4",
      )}
    >
      <p className={titleClass}>{t("upgrade_activityTitle")}</p>

      <div
        className={cn(
          "mt-5 space-y-5",
          isCompact && "mt-3 space-y-3",
          isCompact &&
            "sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 [&>div]:sm:space-y-1",
        )}
      >
        <div>
          <p
            className={cn(
              "font-bold tabular-nums tracking-tight text-[var(--foreground)]",
              metricNumber,
            )}
          >
            {metrics.tripsAnalyzed}
          </p>
          <p className={cn("mt-1 font-medium text-[var(--muted)]", metricLabel)}>
            {t("upgrade_metricTripsLabel")}
          </p>
        </div>

        {kind === "rich" && metrics.potentialProfitTotal > 0 ? (
          <div>
            <p
              className={cn(
                "font-bold tabular-nums tracking-tight text-[var(--foreground)]",
                metricNumber,
              )}
            >
              {formatEur(metrics.potentialProfitTotal)}
            </p>
            <p className={cn("mt-1 font-medium text-[var(--muted)]", metricLabel)}>
              {t("upgrade_metricProfitLabel")}
            </p>
          </div>
        ) : null}

        {kind === "rich" && metrics.lossesAvoidedTotal > 0 ? (
          <div>
            <p
              className={cn(
                "font-bold tabular-nums tracking-tight text-emerald-800 dark:text-emerald-300",
                metricNumber,
              )}
            >
              {formatEur(metrics.lossesAvoidedTotal)}
            </p>
            <p className={cn("mt-1 font-medium text-[var(--muted)]", metricLabel)}>
              {t("upgrade_metricLossesLabel")}
            </p>
          </div>
        ) : null}
      </div>

      {kind === "trips_only" ? (
        <p
          className={cn(
            "mt-4 border-t border-[var(--border)] pt-4 text-sm leading-relaxed text-[var(--muted)]",
            isCompact && "mt-3 pt-3 text-xs",
          )}
        >
          {t("upgrade_tripsOnlyHint")}
        </p>
      ) : null}
    </div>
  );
}

/** @deprecated Use {@link UpgradeValueSection} — alias for searchability. */
export const UpgradeModal = UpgradeValueSection;
