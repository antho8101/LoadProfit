"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/locale-context";
import { getCurrentPositionOnce } from "@/lib/location/client";
import {
  saveLocationPreferences,
  type LocationPreferences,
} from "@/lib/storage/location-preferences";
import { Button } from "@/components/ui/button";

export function LocationPrompt({
  onPreferencesChange,
}: {
  onPreferencesChange: (prefs: LocationPreferences) => void;
}) {
  const { t } = useLocale();
  const [busy, setBusy] = useState(false);

  function handleSkip() {
    const next: LocationPreferences = {
      consent: "skipped",
      promptSeen: true,
      updatedAt: new Date().toISOString(),
    };
    saveLocationPreferences(next);
    onPreferencesChange(next);
  }

  async function handleAllow() {
    setBusy(true);
    try {
      const { lat, lng } = await getCurrentPositionOnce();
      const next: LocationPreferences = {
        consent: "granted",
        promptSeen: true,
        lat,
        lng,
        updatedAt: new Date().toISOString(),
      };
      saveLocationPreferences(next);
      onPreferencesChange(next);
    } catch {
      const next: LocationPreferences = {
        consent: "denied",
        promptSeen: true,
        updatedAt: new Date().toISOString(),
      };
      saveLocationPreferences(next);
      onPreferencesChange(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5"
      role="region"
      aria-label={t("location_title")}
    >
      <p className="text-sm font-medium leading-snug">{t("location_title")}</p>
      <p className="mt-2 text-xs text-[var(--muted)]">{t("location_body")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="default"
          disabled={busy}
          onClick={() => void handleAllow()}
        >
          {busy ? t("location_busy") : t("location_allow")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={handleSkip}
        >
          {t("location_skip")}
        </Button>
      </div>
    </div>
  );
}
