import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const inputClassName =
  "flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const Input = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(inputClassName, className)} {...props} />
);
