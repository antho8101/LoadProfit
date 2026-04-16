import type { LocalePreference, UiLocale } from "@/lib/i18n/locale-types";

/**
 * French if the browser language starts with `fr`, otherwise English.
 */
export function browserUiLocale(): UiLocale {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export function resolveUiLocale(preference: LocalePreference): UiLocale {
  if (preference === "auto") return browserUiLocale();
  return preference;
}
