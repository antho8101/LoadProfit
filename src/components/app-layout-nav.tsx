"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/contexts/locale-context";
import { cn } from "@/lib/utils";

export type AppSection = "home" | "vehicles" | "account";

export function parseAppSection(value: string | null): AppSection {
  if (value === "vehicles" || value === "account") return value;
  return "home";
}

function NavIcon({
  name,
  className,
}: {
  name: "home" | "truck" | "user";
  className?: string;
}) {
  const common = cn("h-5 w-5 shrink-0", className);
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path
          d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "truck") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path
          d="M3 16V8a1 1 0 011-1h9v9H3zm11-8h3l4 4v4h-7V8zm-7 10.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zm9 0a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
      <path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppLayoutNav() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const section = parseAppSection(searchParams.get("section"));

  const itemClass = (s: AppSection) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      section === s
        ? "bg-neutral-200 text-[var(--foreground)] dark:bg-neutral-800"
        : "text-[var(--muted)] hover:bg-neutral-100 hover:text-[var(--foreground)] dark:hover:bg-neutral-900/80",
    );

  const mobileItemClass = (s: AppSection) =>
    cn(
      "flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-xs font-medium transition-colors active:bg-neutral-100 dark:active:bg-neutral-900/80",
      section === s
        ? "text-[var(--accent)]"
        : "text-[var(--muted)]",
    );

  return (
    <>
      <aside className="hidden shrink-0 border-r border-[var(--border)] bg-[var(--card)] md:sticky md:top-0 md:flex md:h-[min(100dvh,100vh)] md:w-52 md:flex-col md:px-2 md:py-8 lg:w-56">
        <p className="mb-6 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          LoadProfit
        </p>
        <nav className="flex flex-col gap-1" aria-label={t("nav_ariaLabel")}>
          <Link href="/" className={itemClass("home")}>
            <NavIcon name="home" />
            {t("nav_home")}
          </Link>
          <Link href="/?section=vehicles" className={itemClass("vehicles")}>
            <NavIcon name="truck" />
            {t("nav_vehicles")}
          </Link>
          <Link href="/?section=account" className={itemClass("account")}>
            <NavIcon name="user" />
            {t("nav_account")}
          </Link>
        </nav>
      </aside>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[var(--border)] bg-[var(--card)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label={t("nav_ariaLabel")}
      >
        <Link href="/" className={mobileItemClass("home")}>
          <NavIcon name="home" />
          {t("nav_home")}
        </Link>
        <Link href="/?section=vehicles" className={mobileItemClass("vehicles")}>
          <NavIcon name="truck" />
          {t("nav_vehicles")}
        </Link>
        <Link href="/?section=account" className={mobileItemClass("account")}>
          <NavIcon name="user" />
          {t("nav_account")}
        </Link>
      </nav>
    </>
  );
}
