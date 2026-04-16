"use client";

import { useMemo } from "react";
import type { SavedTrip } from "@/types/trip";
import { useLocale } from "@/contexts/locale-context";
import type { MessageId } from "@/lib/i18n/catalog";
import { formatEur, formatPercent } from "@/lib/format";
import type { UiLocale } from "@/lib/i18n/locale-types";
import { DecisionBadge, ProfitabilityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatDate(iso: string, locale: UiLocale): string {
  try {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function profitClass(profit: number): string {
  if (profit > 0)
    return "font-semibold text-emerald-700 tabular-nums dark:text-emerald-400";
  if (profit < 0)
    return "font-semibold text-red-700 tabular-nums dark:text-red-400";
  return "font-medium tabular-nums text-[var(--foreground)]";
}

type Row = SavedTrip & { route: string; when: string };

function toSavedTrip(r: Row): SavedTrip {
  const { route, when, ...saved } = r;
  void route;
  void when;
  return saved;
}

function TripHistoryCard({
  row,
  onReuse,
  tr,
  locale,
}: {
  row: Row;
  onReuse?: (trip: SavedTrip) => void;
  tr: (id: MessageId) => string;
  locale: UiLocale;
}) {
  return (
    <article
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
      aria-label={`${row.route}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs tabular-nums text-[var(--muted)]">
          {formatDate(row.when, locale)}
        </p>
        <DecisionBadge decision={row.decision} />
      </div>
      <p className="mt-2 text-base font-semibold leading-snug">{row.route}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {row.vehicleName ?? "—"}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="text-[var(--muted)]">{tr("history_offered")}</dt>
          <dd className="tabular-nums font-medium">{formatEur(row.offeredPrice)}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">{tr("history_cost")}</dt>
          <dd className="tabular-nums">{formatEur(row.totalCost)}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">{tr("history_profit")}</dt>
          <dd className={cn("tabular-nums", profitClass(row.profit))}>
            {formatEur(row.profit)}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">{tr("history_margin")}</dt>
          <dd className="tabular-nums">{formatPercent(row.marginPercent)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="mb-1 text-[var(--muted)]">{tr("history_estimate")}</dt>
          <dd>
            <ProfitabilityBadge status={row.status} />
          </dd>
        </div>
      </dl>
      {onReuse ? (
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          onClick={() => onReuse(toSavedTrip(row))}
        >
          {tr("history_useAgain")}
        </Button>
      ) : null}
    </article>
  );
}

export function TripHistory({
  trips,
  onClear,
  onReuseTrip,
}: {
  trips: SavedTrip[];
  onClear: () => void;
  /** Pre-fills the calculator with this route (and vehicle when matched). */
  onReuseTrip?: (trip: SavedTrip) => void;
}) {
  const { t, effectiveLocale } = useLocale();
  const empty = trips.length === 0;

  const rows = useMemo(
    () =>
      trips.map((trip) => ({
        ...trip,
        route: `${trip.departureCity} → ${trip.arrivalCity}`,
        when: trip.createdAt,
      })),
    [trips],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <CardTitle>{t("history_title")}</CardTitle>
          <p className="text-sm text-[var(--muted)]">{t("history_subtitle")}</p>
        </div>
        {!empty ? (
          <Button
            variant="outline"
            onClick={onClear}
            className="shrink-0 self-start"
          >
            {t("history_clear")}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {empty ? (
          <div className="rounded-md border border-dashed border-[var(--border)] bg-neutral-50 p-6 text-center text-sm text-[var(--muted)] sm:p-8 dark:bg-neutral-950">
            <p className="font-medium text-[var(--foreground)]">
              {t("history_emptyTitle")}
            </p>
            <p className="mt-2">
              {t("history_emptyBody")}{" "}
              <strong>{t("history_emptyAccept")}</strong> {t("history_emptyOr")}{" "}
              <strong>{t("history_emptyDecline")}</strong> {t("history_emptyEnd")}
            </p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-3 md:hidden">
              {rows.map((row) => (
                <li key={row.id}>
                  <TripHistoryCard
                    row={row}
                    onReuse={onReuseTrip}
                    tr={t}
                    locale={effectiveLocale}
                  />
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[960px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                    <th className="py-2 pr-3 font-medium">{t("history_date")}</th>
                    <th className="py-2 pr-3 font-medium">{t("history_route")}</th>
                    <th className="py-2 pr-3 font-medium">{t("history_vehicle")}</th>
                    <th className="py-2 pr-3 font-medium">{t("history_offered")}</th>
                    <th className="py-2 pr-3 font-medium">{t("history_totalCost")}</th>
                    <th className="py-2 pr-3 font-medium">{t("history_profit")}</th>
                    <th className="py-2 pr-3 font-medium">{t("history_margin")}</th>
                    <th className="py-2 pr-3 font-medium">{t("history_estimate")}</th>
                    <th className="py-2 pr-3 font-medium">{t("history_decision")}</th>
                    <th className="w-28 py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-3 pr-3 align-top tabular-nums text-[var(--muted)]">
                        {formatDate(row.when, effectiveLocale)}
                      </td>
                      <td className="py-3 pr-3 align-top font-medium">
                        {row.route}
                      </td>
                      <td className="py-3 pr-3 align-top text-[var(--muted)]">
                        {row.vehicleName ?? "—"}
                      </td>
                      <td className="py-3 pr-3 align-top tabular-nums">
                        {formatEur(row.offeredPrice)}
                      </td>
                      <td className="py-3 pr-3 align-top tabular-nums">
                        {formatEur(row.totalCost)}
                      </td>
                      <td
                        className={cn(
                          "py-3 pr-3 align-top",
                          profitClass(row.profit),
                        )}
                      >
                        {formatEur(row.profit)}
                      </td>
                      <td className="py-3 pr-3 align-top tabular-nums">
                        {formatPercent(row.marginPercent)}
                      </td>
                      <td className="py-3 pr-3 align-top">
                        <ProfitabilityBadge status={row.status} />
                      </td>
                      <td className="py-3 pr-3 align-top">
                        <DecisionBadge decision={row.decision} />
                      </td>
                      <td className="py-3 align-top">
                        {onReuseTrip ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="whitespace-nowrap text-xs"
                            onClick={() => onReuseTrip(toSavedTrip(row))}
                          >
                            {t("history_useAgain")}
                          </Button>
                        ) : null}
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
