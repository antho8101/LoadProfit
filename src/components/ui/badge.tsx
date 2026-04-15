import { cn } from "@/lib/utils";
import type { ProfitabilityStatus } from "@/types/trip";

const statusStyles: Record<ProfitabilityStatus, string> = {
  profitable:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  low_margin:
    "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  loss: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100",
};

const statusLabel: Record<ProfitabilityStatus, string> = {
  profitable: "Profitable",
  low_margin: "Low margin",
  loss: "Loss",
};

export function ProfitabilityBadge({ status }: { status: ProfitabilityStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        statusStyles[status],
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
