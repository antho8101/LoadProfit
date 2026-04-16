import type { SubscriptionStatus } from "@/types/user-doc";
import type Stripe from "stripe";
import type { Firestore } from "firebase-admin/firestore";

function mapStripeStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "trialing":
      return "trialing";
    case "unpaid":
      return "unpaid";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    default:
      return "none";
  }
}

/** Writes subscription fields from a Stripe Subscription to `users/{uid}`. */
export async function applySubscriptionToUserDoc(
  db: Firestore,
  uid: string,
  sub: Stripe.Subscription,
  stripeCustomerId: string,
): Promise<void> {
  const item = sub.items.data[0];
  const price = item?.price;
  const plan =
    (typeof price?.nickname === "string" && price.nickname) ||
    (typeof price?.id === "string" && price.id) ||
    null;

  const periodEndSec =
    "current_period_end" in sub &&
    typeof (sub as { current_period_end?: number }).current_period_end ===
      "number"
      ? (sub as { current_period_end: number }).current_period_end
      : null;

  await db.doc(`users/${uid}`).set(
    {
      stripeCustomerId,
      subscriptionStatus: mapStripeStatus(sub.status),
      subscriptionPlan: plan,
      subscriptionCurrentPeriodEnd: periodEndSec
        ? new Date(periodEndSec * 1000).toISOString()
        : null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
