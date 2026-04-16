"use client";

import { useCallback, useState } from "react";

export function LandingReferral() {
  const [copied, setCopied] = useState(false);

  const copyUrl = useCallback(() => {
    const url = typeof window !== "undefined" ? window.location.origin + "/" : "";
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <section className="border-t border-[var(--border)] bg-neutral-50 px-4 py-16 dark:bg-neutral-950/40 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
          Refer a colleague
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          Know another operator who lives and dies by load offers? Share
          LoadProfit — better decisions spread when the tool is easy to explain.
        </p>
        <button
          type="button"
          onClick={copyUrl}
          className="mt-8 inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] px-5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          {copied ? "Link copied" : "Copy site link"}
        </button>
      </div>
    </section>
  );
}
