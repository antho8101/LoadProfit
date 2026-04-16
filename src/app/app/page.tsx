import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";

export default function AppHomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-[var(--muted)]">
          Loading…
        </div>
      }
    >
      <AppShell />
    </Suspense>
  );
}
