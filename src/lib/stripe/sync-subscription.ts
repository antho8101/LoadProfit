import type { SubscriptionPlan, SubscriptionStatus } from "@/types/user-doc";
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
    /** Stripe subscription trial — treat as paid access (distinct from app 30-day trial). */
    case "trialing":
      return "active";
    case "unpaid":
      return "unpaid";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    default:
      return "none";
  }
}

function planFromStripePrice(priceId: string | undefined): SubscriptionPlan {
  const monthly = process.env.STRIPE_PRICE_ID_MONTHLY;
  const yearly = process.env.STRIPE_PRICE_ID_YEARLY;
  if (priceId && monthly && priceId === monthly) return "monthly";
  if (priceId && yearly && priceId === yearly) return "yearly";
  return "none";
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
  const priceId = typeof price?.id === "string" ? price.id : undefined;
  const plan = planFromStripePrice(priceId);

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
