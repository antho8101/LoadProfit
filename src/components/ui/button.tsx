import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default:
    "bg-[var(--accent)] text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
  outline:
    "border border-[var(--border)] bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900",
  ghost: "hover:bg-neutral-100 dark:hover:bg-neutral-900",
} as const;

export function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:min-h-10",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
