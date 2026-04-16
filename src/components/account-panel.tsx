"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/firebase/auth";
import type { BillingAccess } from "@/lib/billing/access";
import type { DashboardStats } from "@/lib/dashboard";
import { useLocale } from "@/contexts/locale-context";
import { interpolate } from "@/lib/i18n/catalog";
import type { MessageId } from "@/lib/i18n/catalog";
import type { LocalePreference } from "@/lib/i18n/locale-types";
import type { UserDoc } from "@/types/user-doc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { inputClassName } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UpgradeValueSection } from "@/components/upgrade-modal";

function planLabel(
  plan: string | null | undefined,
  t: (id: MessageId) => string,
): string {
  if (plan === "monthly") return t("plan_monthly");
  if (plan === "yearly") return t("plan_yearly");
  if (plan === "none") return "";
  return plan ? String(plan) : "";
}

function formatSubLabel(
  profile: UserDoc | null,
  t: (id: MessageId) => string,
  access: BillingAccess,
): string {
  if (!profile) return "—";
  if (access.phase === "loading") return "—";
  if (access.phase === "legacy_full") {
    return t("account_legacyNote");
  }
  const st = profile.subscriptionStatus ?? "none";
  const pl = planLabel(profile.subscriptionPlan, t);

  if (access.phase === "billing_problem") {
    if (st === "past_due") return t("sub_past_due");
    if (st === "unpaid") return t("sub_unpaid");
    if (st === "incomplete") return t("sub_free");
    return t("sub_past_due");
  }

  if (access.phase === "expired") {
    return t("sub_expired");
  }

  if (st === "inactive") return t("sub_inactive");
  if (st === "past_due") return t("sub_past_due");
  if (st === "unpaid") return t("sub_unpaid");
  if (st === "incomplete") return t("sub_free");

  if (st === "trialing") {
    return pl ? `${t("sub_appTrial")} · ${pl}` : t("sub_appTrial");
  }

  if (st === "active" || access.phase === "subscribed") {
    return pl ? `${t("sub_active")} · ${pl}` : t("sub_active");
  }

  if (st === "canceled") return t("sub_canceled");
  if (st === "expired") return t("sub_expired");
  if (st === "none") return t("sub_free");

  return String(st).replace(/_/g, " ");
}

export function AccountPanel({
  email,
  profile,
  getIdToken,
  billingAccess,
  stats,
}: {
  email: string | null;
  profile: UserDoc | null;
  getIdToken: () => Promise<string | null>;
  billingAccess: BillingAccess;
  stats: DashboardStats;
}) {
  const { t, preference, setPreference } = useLocale();
  const [billingLoading, setBillingLoading] = useState<"monthly" | "yearly" | null>(
    null,
  );
  const [billingError, setBillingError] = useState<string | null>(null);
  const [localeError, setLocaleError] = useState<string | null>(null);

  async function handleCheckout(plan: "monthly" | "yearly") {
    setBillingError(null);
    setBillingLoading(plan);
    try {
      const token = await getIdToken();
      if (!token) {
        setBillingError(t("account_notSignedIn"));
        return;
      }
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setBillingError(data.error ?? t("account_checkoutError"));
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setBillingError(t("account_networkError"));
    } finally {
      setBillingLoading(null);
    }
  }

  async function handleSignOut() {
    await signOut();
    window.location.href = "/auth";
  }

  async function handleLocaleChange(next: LocalePreference) {
    setLocaleError(null);
    try {
      await setPreference(next);
    } catch {
      setLocaleError(t("locale_saveError"));
    }
  }

  const subscribed = billingAccess.phase === "subscribed";
  const showPaywall =
    billingAccess.phase === "expired" || billingAccess.phase === "billing_problem";
  const showTrialExtras = billingAccess.phase === "trial";
  const trialEndIso = profile?.trialEndsAt ?? null;
  const renewalIso = profile?.subscriptionCurrentPeriodEnd ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account_title")}</CardTitle>
        <CardDescription>
          {t("account_signedInAs")}{" "}
          <span className="font-medium text-[var(--foreground)]">
            {email ?? "—"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-[var(--muted)]">
            {t("locale_sectionTitle")}
          </p>
          <p className="text-xs text-[var(--muted)]">{t("locale_sectionHint")}</p>
          <select
            value={preference}
            onChange={(e) =>
              void handleLocaleChange(e.target.value as LocalePreference)
            }
            className={cn(inputClassName, "max-w-md cursor-pointer")}
            aria-label={t("locale_sectionTitle")}
          >
            <option value="auto">{t("locale_auto")}</option>
            <option value="fr">{t("locale_fr")}</option>
            <option value="en">{t("locale_en")}</option>
          </select>
          {localeError ? (
            <p className="text-xs text-red-600 dark:text-red-400">{localeError}</p>
          ) : null}
        </div>

        <div className="rounded-md border border-[var(--border)] bg-neutral-50 px-3 py-2 text-sm dark:bg-neutral-950">
          <p className="text-xs font-medium uppercase text-[var(--muted)]">
            {t("account_subscription")}
          </p>
          <p className="mt-1 font-medium">
            {formatSubLabel(profile, t, billingAccess)}
          </p>
          {trialEndIso && (profile?.subscriptionStatus === "trialing" || showTrialExtras) ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {t("account_trialEnds")}{" "}
              {new Date(trialEndIso).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
              {billingAccess.trialDaysRemaining !== null ? (
                <>
                  {" · "}
                  {interpolate(t("account_daysLeft"), {
                    days: String(billingAccess.trialDaysRemaining),
                  })}
                </>
              ) : null}
            </p>
          ) : null}
          {renewalIso && subscribed ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {t("account_planRenewal")}{" "}
              {new Date(renewalIso).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </p>
          ) : null}
        </div>

        {showPaywall ? (
          <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-4">
            <UpgradeValueSection stats={stats} />
            <div>
              <p className="text-base font-semibold tracking-tight">
                {t("account_paywallTitle")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {t("account_paywallBody")}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                disabled={billingLoading !== null}
                onClick={() => void handleCheckout("monthly")}
              >
                {billingLoading === "monthly"
                  ? t("account_redirecting")
                  : t("account_subscribeMonthly")}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={billingLoading !== null}
                onClick={() => void handleCheckout("yearly")}
              >
                {billingLoading === "yearly"
                  ? t("account_redirecting")
                  : t("account_subscribeYearly")}
              </Button>
            </div>
            <p className="text-xs text-[var(--muted)]">{t("plan_yearlyBadge")}</p>
            {billingError ? (
              <p className="text-xs text-red-600 dark:text-red-400">{billingError}</p>
            ) : null}
            <p className="text-xs text-[var(--muted)]">{t("account_secureCheckout")}</p>
            <Link
              href="/app?section=home"
              className="inline-block text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              {t("account_keepReadOnly")}
            </Link>
          </div>
        ) : null}

        {showTrialExtras && billingAccess.canUseProductive ? (
          <div className="space-y-4 rounded-lg border border-dashed border-[var(--border)] px-4 py-4">
            <UpgradeValueSection stats={stats} />
            <p className="text-sm text-[var(--foreground)]">{t("billing_trialHint")}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={billingLoading !== null}
                onClick={() => void handleCheckout("monthly")}
              >
                {billingLoading === "monthly"
                  ? t("account_redirecting")
                  : t("account_subscribeMonthly")}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={billingLoading !== null}
                onClick={() => void handleCheckout("yearly")}
              >
                {billingLoading === "yearly"
                  ? t("account_redirecting")
                  : t("account_subscribeYearly")}
              </Button>
            </div>
            <p className="text-xs text-[var(--muted)]">{t("plan_yearlyBadge")}</p>
            {billingError ? (
              <p className="text-xs text-red-600 dark:text-red-400">{billingError}</p>
            ) : null}
          </div>
        ) : null}

        <Button type="button" variant="outline" onClick={() => void handleSignOut()}>
          {t("account_signOut")}
        </Button>
      </CardContent>
    </Card>
  );
}
