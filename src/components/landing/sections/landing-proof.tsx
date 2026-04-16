export function LandingProof() {
  return (
    <section className="border-t border-[var(--border)] bg-[var(--card)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Clear inputs. Clear output.
        </h2>
        <p className="mt-6 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          LoadProfit does not promise a fortune. It helps you compare what you
          are paid to what the trip is likely to cost — using assumptions you
          can see and adjust: offered price, operational distance (including
          empty return when relevant), cost per kilometre, and fuel context.
        </p>
        <p className="mt-5 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          The goal is a decision you can stand behind: accept when the margin
          is there, decline when it is not, and keep a record of both.
        </p>
      </div>
    </section>
  );
}
