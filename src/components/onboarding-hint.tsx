"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/contexts/locale-context";

const STORAGE_KEY = "loadprofit-onboarding-dismissed-v1";

type Props = {
  vehicleCount: number;
  savedTripCount: number;
};

/**
 * Lightweight guided steps — no wizard. Hidden when complete or dismissed.
 */
export function OnboardingHint({ vehicleCount, savedTripCount }: Props) {
  const { t } = useLocale();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const complete = vehicleCount >= 1 && savedTripCount >= 1;
  if (complete) return null;
  if (dismissed) return null;

  const step1Done = vehicleCount >= 1;
  const step2Done = step1Done;
  const step3Done = savedTripCount >= 1;

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {t("onboarding_title")}
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
            {t("onboarding_subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-xs font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
        >
          {t("onboarding_dismiss")}
        </button>
      </div>
      <ol className="mt-4 space-y-3 text-sm">
        <li className="flex gap-3">
          <span
            className={
              step1Done
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-[var(--muted)]"
            }
            aria-hidden
          >
            {step1Done ? "✓" : "1."}
          </span>
          <div>
            <p className="font-medium text-[var(--foreground)]">
              {t("onboarding_step1_title")}
            </p>
            <p className="text-[var(--muted)]">{t("onboarding_step1_body")}</p>
            {!step1Done ? (
              <Link
                href="/app?section=vehicles"
                className="mt-1 inline-block text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
              >
                {t("onboarding_addVehicle")}
              </Link>
            ) : null}
          </div>
        </li>
        <li className="flex gap-3">
          <span
            className={
              step2Done
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-[var(--muted)]"
            }
            aria-hidden
          >
            {step2Done ? "✓" : "2."}
          </span>
          <div>
            <p className="font-medium text-[var(--foreground)]">
              {t("onboarding_step2_title")}
            </p>
            <p className="text-[var(--muted)]">{t("onboarding_step2_body")}</p>
          </div>
        </li>
        <li className="flex gap-3">
          <span
            className={
              step3Done
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-[var(--muted)]"
            }
            aria-hidden
          >
            {step3Done ? "✓" : "3."}
          </span>
          <div>
            <p className="font-medium text-[var(--foreground)]">
              {t("onboarding_step3_title")}
            </p>
            <p className="text-[var(--muted)]">{t("onboarding_step3_body")}</p>
            {!step3Done && step1Done ? (
              <a
                href="#trip-calculator"
                className="mt-1 inline-block text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
              >
                {t("onboarding_goCalculator")}
              </a>
            ) : null}
          </div>
        </li>
      </ol>
    </div>
  );
}
