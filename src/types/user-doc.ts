/** Firestore `users/{uid}` shape (client + server aligned). */
export type SubscriptionStatus =
  | "none"
  | "active"
  | "past_due"
  | "canceled"
  | "trialing"
  | "incomplete"
  | "unpaid";

import type { LocalePreference } from "@/lib/i18n/locale-types";

export type UserDoc = {
  email: string | null;
  displayName: string | null;
  createdAt: string;
  stripeCustomerId?: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan?: string | null;
  subscriptionCurrentPeriodEnd?: string | null;
  /** UI language preference; synced from Account. */
  localePreference?: LocalePreference;
};
