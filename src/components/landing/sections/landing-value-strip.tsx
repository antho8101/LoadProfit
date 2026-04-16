const items = [
  { label: "Route distance", detail: "From real road geometry, not a rough guess." },
  { label: "Fuel context", detail: "Benchmarks you can adjust to your reality." },
  { label: "Cost per km", detail: "Built from your vehicle profile and usage." },
];

export function LandingValueStrip() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3 md:gap-12">
        {items.map((item) => (
          <div key={item.label} className="text-center md:text-left">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {item.label}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
