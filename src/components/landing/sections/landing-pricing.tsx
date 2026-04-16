import Link from "next/link";

const plans = [
  {
    name: "Free trial",
    price: "30 days",
    period: "free",
    detail: "Full product access. No card required to start.",
    highlight: false,
  },
  {
    name: "Monthly",
    price: "€19",
    period: "/ month",
    detail: "Billed monthly. Cancel anytime.",
    highlight: false,
  },
  {
    name: "Yearly",
    price: "€190",
    period: "/ year",
    detail: "Save 20% versus paying monthly.",
    highlight: true,
  },
];

export function LandingPricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-24 border-t border-[var(--border)] px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Pricing
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-base text-[var(--muted)]">
          Straightforward tiers. Start with a trial, then choose what fits your
          operation.
        </p>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`flex flex-col rounded-xl border p-6 shadow-sm ${
                p.highlight
                  ? "border-[var(--accent)] bg-[var(--card)] ring-1 ring-[var(--accent)]/20"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <p className="text-sm font-medium text-[var(--muted)]">{p.name}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tabular-nums text-[var(--foreground)]">
                  {p.price}
                </span>
                <span className="text-sm text-[var(--muted)]">{p.period}</span>
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                {p.detail}
              </p>
              <Link
                href="/auth"
                className={`mt-8 inline-flex min-h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-opacity hover:opacity-90 ${
                  p.highlight
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-neutral-50 dark:hover:bg-neutral-900"
                }`}
              >
                {p.name === "Free trial" ? "Start free trial" : "Get started"}
              </Link>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-[var(--muted)]">
          <span className="font-medium text-[var(--foreground)]">
            One avoided bad trip can easily pay for the subscription.
          </span>{" "}
          LoadProfit is built for operators who measure decisions in fuel,
          kilometres, and margin — not slogans.
        </p>
      </div>
    </section>
  );
}
