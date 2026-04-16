export function LandingProblem() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          The offer looks fine — until you count everything.
        </h2>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          <p>
            A quoted rate rarely tells the full story. Fuel moves every week.
            Empty return legs change the math. Fixed costs per kilometre add up
            quietly.
          </p>
          <p>
            Without a consistent way to compare{" "}
            <span className="text-[var(--foreground)]">price offered</span> to{" "}
            <span className="text-[var(--foreground)]">what the trip actually costs you</span>
            , decisions drift toward habit, urgency, or optimism — not clarity.
          </p>
        </div>
      </div>
    </section>
  );
}
