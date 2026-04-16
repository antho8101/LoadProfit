import Link from "next/link";

export function LandingFinalCta() {
  return (
    <section className="border-t border-[var(--border)] bg-[var(--card)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Decide the next offer with a clear margin.
        </h2>
        <p className="mt-4 text-base text-[var(--muted)]">
          Start your 30-day free trial — no card required.
        </p>
        <Link
          href="/auth"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent)] px-8 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Start your 30-day free trial
        </Link>
        <p className="mt-6 text-sm text-[var(--muted)]">Cancel anytime.</p>
      </div>
    </section>
  );
}
