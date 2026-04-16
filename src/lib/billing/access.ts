import type { SubscriptionStatus, UserDoc } from "@/types/user-doc";

export type BillingAccess = {
  /** Can run new trip calculations, save trips, add/edit vehicles, delete data. */
  canUseProductive: boolean;
  /** Trial ended or billing inactive — user may still view existing data. */
  isReadOnly: boolean;
  /** High-level phase for UI. */
  phase:
    | "loading"
    | "legacy_full"
    | "trial"
    | "subscribed"
    | "expired"
    | "billing_problem";
  /** Whole days left in the app trial (floored), or null if not in trial. */
  trialDaysRemaining: number | null;
  /** Visual urgency for trial banner. */
  trialUrgency: "none" | "week" | "last_day";
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parseTrialEnd(profile: UserDoc): number | null {
  const raw = profile.trialEndsAt;
  if (!raw || typeof raw !== "string") return null;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : null;
}

/**
 * Central billing / trial access rules (client + same logic can be reused server-side).
 * - Paid **active** → full access.
 * - **trialing** with future **trialEndsAt** → full access (30-day app trial).
 * - **none** without trial fields → legacy full access (do not break existing users).
 * - Otherwise → read-only (expired trial, canceled, past_due, unpaid, incomplete, etc.).
 */
export function computeBillingAccess(
  profile: UserDoc | null,
  nowMs: number = Date.now(),
): BillingAccess {
  /** Firestore profile not loaded yet — allow UI; real rules apply once `profile` exists. */
  if (!profile) {
    return {
      canUseProductive: true,
      isReadOnly: false,
      phase: "loading",
      trialDaysRemaining: null,
      trialUrgency: "none",
    };
  }

  const status: SubscriptionStatus = profile.subscriptionStatus ?? "none";
  const trialEndMs = parseTrialEnd(profile);
  const legacyNoTrial =
    status === "none" && !profile.trialEndsAt;

  if (legacyNoTrial) {
    return {
      canUseProductive: true,
      isReadOnly: false,
      phase: "legacy_full",
      trialDaysRemaining: null,
      trialUrgency: "none",
    };
  }

  if (status === "active") {
    return {
      canUseProductive: true,
      isReadOnly: false,
      phase: "subscribed",
      trialDaysRemaining: null,
      trialUrgency: "none",
    };
  }

  if (status === "trialing" && trialEndMs !== null) {
    if (nowMs < trialEndMs) {
      const remainingMs = trialEndMs - nowMs;
      const fullDaysLeft = Math.max(0, Math.floor(remainingMs / DAY_MS));
      let urgency: BillingAccess["trialUrgency"] = "none";
      if (fullDaysLeft <= 1) urgency = "last_day";
      else if (fullDaysLeft <= 7) urgency = "week";

      return {
        canUseProductive: true,
        isReadOnly: false,
        phase: "trial",
        trialDaysRemaining: fullDaysLeft,
        trialUrgency: urgency,
      };
    }
    // Trial time range passed but document not migrated yet — treat as expired.
    return {
      canUseProductive: false,
      isReadOnly: true,
      phase: "expired",
      trialDaysRemaining: 0,
      trialUrgency: "none",
    };
  }

  const billingProblem =
    status === "past_due" ||
    status === "unpaid" ||
    status === "incomplete";

  if (billingProblem) {
    return {
      canUseProductive: false,
      isReadOnly: true,
      phase: "billing_problem",
      trialDaysRemaining: null,
      trialUrgency: "none",
    };
  }

  // expired, canceled, inactive, none with trial consumed, etc.
  return {
    canUseProductive: false,
    isReadOnly: true,
    phase: "expired",
    trialDaysRemaining: null,
    trialUrgency: "none",
  };
}

/** True if Firestore should be patched from trialing → expired (trial window ended). */
export function shouldExpireAppTrial(
  profile: UserDoc | null,
  nowMs: number = Date.now(),
): boolean {
  if (!profile) return false;
  if (profile.subscriptionStatus !== "trialing") return false;
  const end = parseTrialEnd(profile);
  if (end === null) return false;
  return nowMs >= end;
}
