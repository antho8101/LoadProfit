import Link from "next/link";

export function LandingHero() {
  return (
    <section className="border-b border-[var(--border)] px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
          For transport operators
        </p>
        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
          Know if a freight offer is worth taking — before you drive.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
          LoadProfit helps you estimate real trip profitability using live fuel
          pricing, route distance, and vehicle-based cost calculations — so you
          can decide with a clear number, not a guess.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/auth"
            className="inline-flex min-h-11 w-full min-w-[200px] items-center justify-center rounded-md bg-[var(--accent)] px-6 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
          >
            Start your 30-day free trial
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex min-h-11 w-full min-w-[200px] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] px-6 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 sm:w-auto"
          >
            See how it works
          </a>
        </div>
        <p className="mt-8 text-sm text-[var(--muted)]">
          No card required. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
