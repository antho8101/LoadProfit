import { NextResponse } from "next/server";
import { verifyIdTokenFromHeader } from "@/lib/auth/verify-id-token";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getStripe } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await verifyIdTokenFromHeader(
    request.headers.get("authorization"),
  );
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_ID_MONTHLY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!priceId || !appUrl) {
    return NextResponse.json(
      { error: "Billing is not configured on the server." },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const db = getAdminFirestore();
  const uid = session.uid;

  const userSnap = await db.doc(`users/${uid}`).get();
  const data = userSnap.data();
  let customerId = typeof data?.stripeCustomerId === "string"
    ? data.stripeCustomerId
    : null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.email ?? undefined,
      metadata: { firebaseUid: uid },
    });
    customerId = customer.id;
    await db.doc(`users/${uid}`).set(
      { stripeCustomerId: customerId, updatedAt: new Date().toISOString() },
      { merge: true },
    );
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl.replace(/\/$/, "")}/?checkout=success`,
    cancel_url: `${appUrl.replace(/\/$/, "")}/?checkout=canceled`,
    metadata: { firebaseUid: uid },
    subscription_data: {
      metadata: { firebaseUid: uid },
    },
    allow_promotion_codes: true,
  });

  if (!checkout.url) {
    return NextResponse.json(
      { error: "Could not create checkout session." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: checkout.url });
}
