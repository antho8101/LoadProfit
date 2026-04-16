"use client";

import { useLocale } from "@/contexts/locale-context";
import { cn } from "@/lib/utils";
import type { ProfitabilityStatus, TripDecision } from "@/types/trip";

const statusStyles: Record<ProfitabilityStatus, string> = {
  profitable:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  low_margin:
    "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  loss: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100",
};

const statusKey: Record<ProfitabilityStatus, "badge_profitable" | "badge_lowMargin" | "badge_loss"> =
  {
    profitable: "badge_profitable",
    low_margin: "badge_lowMargin",
    loss: "badge_loss",
  };

export function ProfitabilityBadge({ status }: { status: ProfitabilityStatus }) {
  const { t } = useLocale();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        statusStyles[status],
      )}
    >
      {t(statusKey[status])}
    </span>
  );
}

const decisionStyles: Record<TripDecision, string> = {
  accepted:
    "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100",
  declined:
    "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
  pending:
    "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-100",
};

const decisionKey: Record<
  TripDecision,
  "badge_accepted" | "badge_declined" | "badge_pending"
> = {
  accepted: "badge_accepted",
  declined: "badge_declined",
  pending: "badge_pending",
};

export function DecisionBadge({ decision }: { decision: TripDecision }) {
  const { t } = useLocale();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        decisionStyles[decision],
      )}
    >
      {t(decisionKey[decision])}
    </span>
  );
}
