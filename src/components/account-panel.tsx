"use client";

import { useState } from "react";
import { signOut } from "@/lib/firebase/auth";
import { useLocale } from "@/contexts/locale-context";
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

function formatSubLabel(profile: UserDoc | null, t: (id: MessageId) => string): string {
  if (!profile) return "—";
  const st = profile.subscriptionStatus ?? "none";
  if (st === "none" || st === "incomplete") return t("sub_free");
  if (st === "active" || st === "trialing") {
    const plan = profile.subscriptionPlan
      ? ` (${profile.subscriptionPlan})`
      : "";
    return st === "trialing" ? `${t("sub_trialing")}${plan}` : `${t("sub_active")}${plan}`;
  }
  if (st === "past_due") return t("sub_past_due");
  if (st === "canceled") return t("sub_canceled");
  if (st === "unpaid") return t("sub_unpaid");
  return String(st).replace(/_/g, " ");
}

export function AccountPanel({
  email,
  profile,
  getIdToken,
}: {
  email: string | null;
  profile: UserDoc | null;
  getIdToken: () => Promise<string | null>;
}) {
  const { t, preference, setPreference } = useLocale();
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [localeError, setLocaleError] = useState<string | null>(null);

  async function handleUpgrade() {
    setBillingError(null);
    setBillingLoading(true);
    try {
      const token = await getIdToken();
      if (!token) {
        setBillingError(t("account_notSignedIn"));
        return;
      }
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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
      setBillingLoading(false);
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

  const subscribed =
    profile?.subscriptionStatus === "active" ||
    profile?.subscriptionStatus === "trialing";

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
          <p className="mt-1 font-medium">{formatSubLabel(profile, t)}</p>
          {profile?.subscriptionCurrentPeriodEnd &&
          (profile.subscriptionStatus === "active" ||
            profile.subscriptionStatus === "trialing") ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {t("account_currentPeriodEnds")}{" "}
              {new Date(profile.subscriptionCurrentPeriodEnd).toLocaleDateString(
                undefined,
                { dateStyle: "medium" },
              )}
            </p>
          ) : null}
        </div>

        {!subscribed ? (
          <div className="space-y-2">
            <Button
              type="button"
              disabled={billingLoading}
              onClick={() => void handleUpgrade()}
            >
              {billingLoading ? t("account_redirecting") : t("account_upgrade")}
            </Button>
            {billingError ? (
              <p className="text-xs text-red-600 dark:text-red-400">
                {billingError}
              </p>
            ) : null}
            <p className="text-xs text-[var(--muted)]">
              {t("account_secureCheckout")}
            </p>
          </div>
        ) : null}

        <Button type="button" variant="outline" onClick={() => void handleSignOut()}>
          {t("account_signOut")}
        </Button>
      </CardContent>
    </Card>
  );
}
