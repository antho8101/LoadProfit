"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  subscribeUserDoc,
  updateUserLocalePreference,
} from "@/lib/firebase/firestore";
import { configureFormatsForUiLocale } from "@/lib/format";
import { translate, type MessageId } from "@/lib/i18n/catalog";
import type { LocalePreference, UiLocale } from "@/lib/i18n/locale-types";
import { resolveUiLocale } from "@/lib/i18n/resolve-locale";

const STORAGE_KEY = "loadprofit-locale-pref";

function readStoredPreference(): LocalePreference | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "auto" || v === "en" || v === "fr") return v;
  } catch {
    /* ignore */
  }
  return null;
}

function writeStoredPreference(p: LocalePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, p);
  } catch {
    /* ignore */
  }
}

type LocaleContextValue = {
  effectiveLocale: UiLocale;
  preference: LocalePreference;
  setPreference: (p: LocalePreference) => Promise<void>;
  t: (id: MessageId) => string;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [preference, setPreferenceState] = useState<LocalePreference>("auto");

  useEffect(() => {
    const s = readStoredPreference();
    if (s) setPreferenceState(s);
  }, []);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;
    return subscribeUserDoc(uid, (doc) => {
      const remote = doc?.localePreference;
      if (remote === "auto" || remote === "en" || remote === "fr") {
        setPreferenceState(remote);
        writeStoredPreference(remote);
      }
    });
  }, [user?.uid]);

  const effectiveLocale = useMemo(
    () => resolveUiLocale(preference),
    [preference],
  );

  useEffect(() => {
    configureFormatsForUiLocale(effectiveLocale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = effectiveLocale === "fr" ? "fr" : "en";
    }
  }, [effectiveLocale]);

  const t = useCallback(
    (id: MessageId) => translate(effectiveLocale, id),
    [effectiveLocale],
  );

  const setPreference = useCallback(
    async (p: LocalePreference) => {
      setPreferenceState(p);
      writeStoredPreference(p);
      if (user?.uid) {
        await updateUserLocalePreference(user.uid, p);
      }
    },
    [user?.uid],
  );

  const value = useMemo(
    () => ({
      effectiveLocale,
      preference,
      setPreference,
      t,
    }),
    [effectiveLocale, preference, setPreference, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
