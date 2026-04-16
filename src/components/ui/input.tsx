import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** text-base sur mobile évite le zoom automatique iOS sur focus (< 16px). */
export const inputClassName =
  "flex min-h-11 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-base outline-none ring-offset-background placeholder:text-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:min-h-10 md:text-sm";

export const Input = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(inputClassName, className)} {...props} />
);
