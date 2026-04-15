const eur = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const km = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

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
