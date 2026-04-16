/** Firestore `users/{uid}` shape (client + server aligned). */
export type SubscriptionStatus =
  | "none"
  | "active"
  | "past_due"
  | "canceled"
  | "trialing"
  | "incomplete"
  | "unpaid"
  /** App trial ended without an active paid subscription (read-only). */
  | "expired"
  /** Optional catch-all for deactivated billing state. */
  | "inactive";

/** What the user is paying for when subscribed (Stripe price tier). */
export type SubscriptionPlan = "none" | "monthly" | "yearly";

import type { LocalePreference } from "@/lib/i18n/locale-types";

export type UserDoc = {
  email: string | null;
  displayName: string | null;
  createdAt: string;
  stripeCustomerId?: string | null;
  subscriptionStatus: SubscriptionStatus;
  /** `none` during app trial; `monthly` / `yearly` once Stripe subscription exists. */
  subscriptionPlan?: string | null;
  subscriptionCurrentPeriodEnd?: string | null;
  /** Start of the 30-day free trial (ISO). Set once at account creation. */
  trialStartAt?: string | null;
  /** End of the free trial (ISO). Access after this without `active` → read-only. */
  trialEndsAt?: string | null;
  /** UI language preference; synced from Account. */
  localePreference?: LocalePreference;
};
