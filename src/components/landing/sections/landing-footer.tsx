import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--border)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="text-sm font-medium text-[var(--foreground)]">LoadProfit</p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--muted)]">
          <Link href="/auth" className="hover:text-[var(--foreground)]">
            Sign in
          </Link>
          <Link href="/app" className="hover:text-[var(--foreground)]">
            Open app
          </Link>
          <a href="#pricing" className="hover:text-[var(--foreground)]">
            Pricing
          </a>
        </div>
        <p className="text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} LoadProfit
        </p>
      </div>
    </footer>
  );
}
