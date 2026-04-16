const features = [
  {
    title: "Route-based distance",
    body: "Uses road distance for the leg you are pricing — with manual override when you need it.",
  },
  {
    title: "Fuel pricing you can trust",
    body: "National benchmarks and optional local context, then adjustments for your cards, contracts, or reality on the ground.",
  },
  {
    title: "Vehicle profiles",
    body: "Consumption, fixed costs, and monthly mileage rolled into a cost per kilometre you reuse across trips.",
  },
  {
    title: "Trip history",
    body: "Save estimates and decisions so you can see patterns over time — not just one-off spreadsheets.",
  },
];

export function LandingFeatures() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          How it works
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-[var(--muted)]">
          Practical inputs, transparent calculation, no black box.
        </p>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {features.map((f) => (
            <li
              key={f.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                {f.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {f.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
