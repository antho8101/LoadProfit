import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-[var(--foreground)]"
        >
          LoadProfit
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/auth"
            className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Sign in
          </Link>
          <Link
            href="/auth"
            className="inline-flex min-h-10 items-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Start free trial
          </Link>
        </nav>
      </div>
    </header>
  );
}
