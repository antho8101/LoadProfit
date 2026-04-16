"use client";

import type { TripCalculationResult } from "@/types/trip";
import { interpolate, translate } from "@/lib/i18n/catalog";
import { useLocale } from "@/contexts/locale-context";
import {
  formatDurationDriving,
  formatEur,
  formatKm,
  formatPercent,
} from "@/lib/format";
import { ProfitabilityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UiLocale } from "@/lib/i18n/locale-types";

function decisionMessage(
  result: TripCalculationResult,
  locale: UiLocale,
): string {
  switch (result.status) {
    case "profitable":
      return interpolate(translate(locale, "result_msg_profitable"), {
        amount: formatEur(result.profit),
      });
    case "low_margin":
      return translate(locale, "result_msg_lowMargin");
    case "loss": {
      const loss = Math.abs(result.profit);
      return interpolate(translate(locale, "result_msg_loss"), {
        amount: formatEur(loss),
      });
    }
    default:
      return "";
  }
}

function formatComputedAt(ts: number, locale: UiLocale): string {
  try {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return "";
  }
}

export function TripResults({
  result,
  onAccept,
  onDecline,
  showDecisionActions,
  decisionDisabled,
  decisionHint,
  computedAtMs,
  readOnlyMessage,
}: {
  result: TripCalculationResult | null;
  onAccept: () => void;
  onDecline: () => void;
  showDecisionActions: boolean;
  decisionDisabled: boolean;
  decisionHint?: string;
  /** When this estimate was produced (client clock). */
  computedAtMs?: number | null;
  /** Shown when productive actions are blocked (e.g. trial ended). */
  readOnlyMessage?: string;
}) {
  const { t, effectiveLocale } = useLocale();

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("result_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted)]">
            {t("result_empty")}{" "}
            <strong>{t("result_emptyStrong")}</strong> {t("result_emptyEnd")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle className="text-lg tracking-tight">{t("result_title")}</CardTitle>
          {computedAtMs ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {t("result_estimateAt")} {formatComputedAt(computedAtMs, effectiveLocale)}
            </p>
          ) : null}
        </div>
        <ProfitabilityBadge status={result.status} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            {t("result_distance")}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">
            {formatKm(result.oneWayDistanceKm)}
          </p>
          {result.distanceSource === "google_routes" &&
          result.routeDurationMinutes !== null &&
          result.routeDurationMinutes !== undefined ? (
            <p className="mt-3 text-sm text-[var(--foreground)]">
              <span className="text-[var(--muted)]">{t("result_drivingTime")} </span>
              <span className="font-semibold tabular-nums">
                {formatDurationDriving(result.routeDurationMinutes)}
              </span>
            </p>
          ) : null}
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
            {result.distanceSource === "google_routes"
              ? t("result_routeGoogle")
              : result.distanceSource === "manual"
                ? t("result_routeManual")
                : null}
          </p>
        </div>

        <div className="rounded-md border border-[var(--border)] bg-neutral-50 p-4 text-base font-medium leading-snug dark:bg-neutral-950">
          {decisionMessage(result, effectiveLocale)}
        </div>

        <p className="text-xs leading-relaxed text-[var(--muted)]">
          {t("result_transparency")}
        </p>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-[var(--muted)]">
              {t("result_opDistance")}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatKm(result.operationalDistanceKm)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-[var(--muted)]">
              {t("result_revenue")}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatEur(result.totalRevenue)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-[var(--muted)]">
              {t("result_totalCost")}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatEur(result.totalCost)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-[var(--muted)]">
              {t("result_profit")}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatEur(result.profit)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-[var(--muted)]">
              {t("result_minPrice")}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatEur(result.minimumProfitablePrice)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-[var(--muted)]">
              {t("result_margin")}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatPercent(result.marginPercent)}
            </dd>
          </div>
        </dl>

        {showDecisionActions ? (
          <div className="space-y-2 border-t border-[var(--border)] pt-4">
            <p className="text-sm font-medium text-[var(--foreground)]">
              {t("result_recordDecision")}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="default"
                className="w-full sm:flex-1"
                disabled={decisionDisabled}
                onClick={onAccept}
              >
                {t("result_accept")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:flex-1"
                disabled={decisionDisabled}
                onClick={onDecline}
              >
                {t("result_decline")}
              </Button>
            </div>
            {decisionHint ? (
              <p className="text-xs text-[var(--muted)]">{decisionHint}</p>
            ) : null}
            {readOnlyMessage ? (
              <p className="text-xs leading-relaxed text-[var(--muted)]">
                {readOnlyMessage}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-md border border-[var(--border)] bg-neutral-50 p-4 text-sm dark:bg-neutral-950">
          <p className="font-medium">{t("result_emptyReturn")}</p>
          <p className="mt-1 text-[var(--muted)]">
            {t("result_extraKm")}{" "}
            <span className="font-medium text-[var(--foreground)]">
              {formatKm(result.emptyReturnImpact.extraKm)}
            </span>
            {" · "}
            {t("result_extraCost")}{" "}
            <span className="font-medium text-[var(--foreground)]">
              {formatEur(result.emptyReturnImpact.extraCost)}
            </span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {t("result_emptyReturnNote")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
