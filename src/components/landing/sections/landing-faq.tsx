const faqs = [
  {
    q: "Do I need a payment card to start the trial?",
    a: "No. You can start the 30-day trial without entering card details. Billing only applies when you choose a paid plan.",
  },
  {
    q: "Who is LoadProfit for?",
    a: "Small freight businesses and independent operators who want a structured check before accepting a trip — not a full transport management system.",
  },
  {
    q: "How accurate are fuel and distance figures?",
    a: "Distance uses routing data; fuel uses published benchmarks and optional local context, which you can override. Figures are estimates for decision support, not contractual quotes.",
  },
  {
    q: "Can I cancel?",
    a: "Yes. Subscriptions can be cancelled according to the terms shown at checkout; you are not locked into long-term marketing gimmicks.",
  },
];

export function LandingFaq() {
  return (
    <section className="border-t border-[var(--border)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-12 space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3"
            >
              <summary className="cursor-pointer list-none text-left text-sm font-medium text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <span className="text-[var(--muted)] transition-transform group-open:rotate-180">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
              </summary>
              <p className="mt-3 border-t border-[var(--border)] pt-3 text-sm leading-relaxed text-[var(--muted)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
