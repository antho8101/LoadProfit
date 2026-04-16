import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getStripe } from "@/lib/stripe/server";
import { applySubscriptionToUserDoc } from "@/lib/stripe/sync-subscription";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not configured" },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("Stripe webhook signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getAdminFirestore();
  const stripe = getStripe();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const sess = event.data.object as Stripe.Checkout.Session;
        const uid = sess.metadata?.firebaseUid;
        if (sess.mode === "subscription" && uid && sess.subscription) {
          const subId =
            typeof sess.subscription === "string"
              ? sess.subscription
              : sess.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          const cust =
            typeof sess.customer === "string"
              ? sess.customer
              : sess.customer?.id;
          if (cust) {
            await applySubscriptionToUserDoc(db, uid, sub, cust);
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const uid = sub.metadata?.firebaseUid;
        const custId =
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (uid && custId) {
          if (event.type === "customer.subscription.deleted") {
            await db.doc(`users/${uid}`).set(
              {
                stripeCustomerId: custId,
                subscriptionStatus: "canceled",
                subscriptionPlan: null,
                subscriptionCurrentPeriodEnd: null,
                updatedAt: new Date().toISOString(),
              },
              { merge: true },
            );
          } else {
            await applySubscriptionToUserDoc(db, uid, sub, custId);
          }
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Webhook handler error", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
