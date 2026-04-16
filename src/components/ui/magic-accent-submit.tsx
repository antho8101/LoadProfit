import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PARTICLE_POSITIONS: {
  left: string;
  top: string;
  delay: string;
  duration: string;
}[] = [
  { left: "14%", top: "22%", delay: "0ms", duration: "2.2s" },
  { left: "86%", top: "26%", delay: "150ms", duration: "2.6s" },
  { left: "18%", top: "72%", delay: "280ms", duration: "2s" },
  { left: "82%", top: "68%", delay: "90ms", duration: "2.4s" },
  { left: "50%", top: "6%", delay: "400ms", duration: "2.8s" },
  { left: "50%", top: "92%", delay: "200ms", duration: "2.1s" },
  { left: "6%", top: "50%", delay: "500ms", duration: "2.5s" },
  { left: "94%", top: "50%", delay: "60ms", duration: "2.3s" },
];

/**
 * Submit accent : halo arc-en-ciel flouté (opaque près du bouton, fade vers l’extérieur) + particules.
 */
export function MagicAccentSubmit({
  className,
  children,
  disabled,
  ...props
}: ComponentProps<typeof Button>) {
  const active = !disabled;

  return (
    <span className="relative inline-flex items-stretch">
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-[2] -m-1.5 motion-reduce:hidden",
          !active && "opacity-40",
        )}
      >
        {PARTICLE_POSITIONS.map((p, i) => (
          <span
            key={i}
            className={cn(
              "absolute h-1 w-1 rounded-full",
              "bg-gradient-to-br from-amber-200 via-fuchsia-300 to-cyan-300",
              "shadow-[0_0_6px_2px_rgba(251,191,36,0.4)]",
              active && "motion-safe:animate-magic-sparkle-float motion-reduce:opacity-70",
            )}
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </span>

      <span className="relative inline-flex">
        {/* Halo : conic + flou + masque radial (pas de bord net) */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2",
            "h-[calc(100%+1rem)] w-[calc(100%+1.25rem)] min-h-[2.75rem] min-w-[8.5rem]",
            "items-center justify-center",
          )}
        >
          <span
            className={cn(
              "motion-safe:animate-magic-rainbow block h-[118%] w-[118%]",
              "rounded-lg bg-[conic-gradient(from_0deg,#f472b6,#a78bfa,#38bdf8,#4ade80,#fbbf24,#fb7185,#ec4899,#f472b6)]",
              "blur-[10px] motion-reduce:blur-[8px]",
              "magic-aura-mask",
              active && "motion-safe:animate-magic-aura-pulse",
              !active && "opacity-40",
              "motion-reduce:animate-none motion-reduce:opacity-45",
            )}
          />
        </span>

        <Button
          variant="default"
          disabled={disabled}
          className={cn(
            "relative z-10 border-0 shadow-sm",
            "focus-visible:ring-offset-[var(--background)]",
            active && "motion-safe:animate-magic-btn-breathe-subtle motion-reduce:animate-none",
            className,
          )}
          {...props}
        >
          {children}
        </Button>
      </span>
    </span>
  );
}
