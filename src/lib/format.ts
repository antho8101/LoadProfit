import type { UiLocale } from "@/lib/i18n/locale-types";

let eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

let km = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/** Number formats follow UI locale (FR vs EN grouping/decimals). Currency stays EUR. */
export function configureFormatsForUiLocale(locale: UiLocale): void {
  const tag = locale === "fr" ? "fr-FR" : "en-GB";
  eur = new Intl.NumberFormat(tag, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  km = new Intl.NumberFormat(tag, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

export function formatEur(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return eur.format(value);
}

export function formatKm(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${km.format(value)} km`;
}

export function formatPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}%`;
}

export function parseDecimal(input: string): number {
  const n = Number(String(input).trim().replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

/** Format a cost/km value for editable inputs (up to 4 decimal places). */
export function formatCostPerKmInput(value: number): string {
  if (!Number.isFinite(value)) return "";
  return String(Math.round(value * 10_000) / 10_000);
}

/**
 * Driving time from whole minutes: "3h 20m" or "45m" (under 1 hour).
 */
export function formatDurationDriving(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "—";
  const m = Math.round(totalMinutes);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}
