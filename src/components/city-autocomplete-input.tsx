"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Suggestion = { placeId: string; label: string };

const DEBOUNCE_MS = 320;

export function CityAutocompleteInput({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  name,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
  placeholder?: string;
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const activeIndexRef = useRef(-1);

  const cancelDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelDebounce();
      abortRef.current?.abort();
    };
  }, [cancelDebounce]);

  useEffect(() => {
    if (suggestions.length === 0) {
      setActiveIndex(-1);
    } else {
      setActiveIndex(0);
    }
  }, [suggestions]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = document.getElementById(`${id}-option-${activeIndex}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, id]);

  const runFetch = useCallback((q: string) => {
    cancelDebounce();
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      try {
        const lang =
          typeof navigator !== "undefined"
            ? navigator.language.slice(0, 2).toLowerCase()
            : "en";
        const res = await fetch("/api/places-autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: trimmed, languageCode: lang }),
          signal: ac.signal,
        });
        const payload: unknown = await res.json().catch(() => null);
        const rec =
          payload && typeof payload === "object"
            ? (payload as Record<string, unknown>)
            : null;
        const raw = rec?.suggestions;
        const list: Suggestion[] = [];
        if (Array.isArray(raw)) {
          for (const item of raw) {
            if (!item || typeof item !== "object") continue;
            const o = item as Record<string, unknown>;
            const placeId = o.placeId;
            const lab = o.label;
            if (typeof placeId !== "string" || typeof lab !== "string") continue;
            list.push({ placeId, label: lab });
          }
        }
        if (ac.signal.aborted) return;
        setSuggestions(list);
        setOpen(list.length > 0);
      } catch {
        if (ac.signal.aborted) return;
        setSuggestions([]);
        setOpen(false);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
  }, [cancelDebounce]);

  function handleChange(next: string) {
    onChange(next);
    runFetch(next);
  }

  function pick(s: Suggestion) {
    cancelDebounce();
    abortRef.current?.abort();
    onChange(s.label);
    setSuggestions([]);
    setOpen(false);
    setLoading(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const n = suggestions.length;
    const listVisible = open && n > 0;

    if (e.key === "Escape") {
      if (listVisible) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        setSuggestions([]);
        setActiveIndex(-1);
      }
      return;
    }

    if (!listVisible) return;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        setActiveIndex((i) => {
          if (n <= 0) return -1;
          if (i < 0) return 0;
          return (i + 1) % n;
        });
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        setActiveIndex((i) => {
          if (n <= 0) return -1;
          if (i < 0) return n - 1;
          return (i - 1 + n) % n;
        });
        break;
      }
      case "Enter": {
        const idx =
          activeIndexRef.current >= 0
            ? activeIndexRef.current
            : suggestions.length > 0
              ? 0
              : -1;
        const chosen = idx >= 0 ? suggestions[idx] : undefined;
        if (chosen) {
          e.preventDefault();
          pick(chosen);
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        setActiveIndex(0);
        break;
      }
      case "End": {
        e.preventDefault();
        setActiveIndex(n - 1);
        break;
      }
      default:
        break;
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name ?? id}
          autoComplete="off"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 180);
          }}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-expanded={open}
          aria-controls={open ? `${id}-listbox` : undefined}
          aria-activedescendant={
            open && activeIndex >= 0
              ? `${id}-option-${activeIndex}`
              : undefined
          }
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        {loading ? (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">
            …
          </span>
        ) : null}
        {open && suggestions.length > 0 ? (
          <ul
            className={cn(
              "absolute left-0 right-0 z-30 mt-1 max-h-52 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--card)] py-1 shadow-md",
            )}
            role="listbox"
            id={`${id}-listbox`}
          >
            {suggestions.map((s, index) => (
              <li key={s.placeId} role="presentation">
                <button
                  type="button"
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={cn(
                    "w-full cursor-pointer px-3 py-2 text-left text-sm text-[var(--foreground)]",
                    index === activeIndex
                      ? "bg-neutral-200 dark:bg-neutral-800"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-900",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => pick(s)}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
