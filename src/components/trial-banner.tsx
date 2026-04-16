"use client";

import Link from "next/link";
import type { BillingAccess } from "@/lib/billing/access";
import { useLocale } from "@/contexts/locale-context";
import { interpolate } from "@/lib/i18n/catalog";
import { cn } from "@/lib/utils";

export function TrialBanner({ access }: { access: BillingAccess }) {
  const { t } = useLocale();

  if (
    access.phase === "loading" ||
    access.phase === "legacy_full" ||
    access.phase === "subscribed"
  ) {
    return null;
  }

  if (access.phase === "trial" && access.trialDaysRemaining !== null) {
    const u = access.trialUrgency;
    return (
      <div
        className={cn(
          "rounded-lg border px-4 py-3 text-sm leading-relaxed",
          u === "last_day" &&
            "border-amber-400/90 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100",
          u === "week" &&
            "border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-50",
          u === "none" &&
            "border-[var(--border)] bg-neutral-50 text-[var(--foreground)] dark:bg-neutral-950",
        )}
        role="status"
      >
        <p className="font-medium">
          {interpolate(t("billing_trialLine"), {
            days: String(access.trialDaysRemaining),
          })}
        </p>
        <p className="mt-1 text-xs opacity-90">
          {t("billing_trialHint")}
        </p>
      </div>
    );
  }

  if (access.phase === "billing_problem") {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
        role="status"
      >
        <p>{t("billing_billingIssue")}</p>
        <p className="mt-2 text-xs opacity-90">{t("billing_billingIssueHint")}</p>
        <Link
          href="/app?section=account"
          className="mt-2 inline-block font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          {t("billing_viewPlans")}
        </Link>
      </div>
    );
  }

  if (access.phase === "expired") {
    return (
      <div
        className="rounded-lg border border-[var(--border)] bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-[var(--foreground)] dark:bg-neutral-950"
        role="status"
      >
        <p className="font-medium">{t("billing_readOnlyIntro")}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{t("billing_readOnlySub")}</p>
        <Link
          href="/app?section=account"
          className="mt-3 inline-block text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          {t("billing_viewPlans")}
        </Link>
      </div>
    );
  }

  return null;
}
