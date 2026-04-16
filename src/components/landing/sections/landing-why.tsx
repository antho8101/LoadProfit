export function LandingWhy() {
  return (
    <section className="border-t border-[var(--border)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Why it matters
        </h2>
        <ul className="mt-10 space-y-6 text-base leading-relaxed text-[var(--muted)]">
          <li className="flex gap-4">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
              aria-hidden
            />
            <span>
              <strong className="font-medium text-[var(--foreground)]">
                Margin is narrow.
              </strong>{" "}
              Small errors in distance or fuel assumptions show up directly in
              euros per trip.
            </span>
          </li>
          <li className="flex gap-4">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
              aria-hidden
            />
            <span>
              <strong className="font-medium text-[var(--foreground)]">
                Time is short.
              </strong>{" "}
              You need a repeatable check — not another late-night spreadsheet.
            </span>
          </li>
          <li className="flex gap-4">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
              aria-hidden
            />
            <span>
              <strong className="font-medium text-[var(--foreground)]">
                Discipline compounds.
              </strong>{" "}
              When every offer is judged the same way, your operation gets
              easier to steer.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
