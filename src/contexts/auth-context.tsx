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
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, initFirebaseAnalytics } from "@/lib/firebase/client";
import { ensureUserDocument } from "@/lib/firebase/firestore";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initFirebaseAnalytics();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next);
      if (!cancelled) setLoading(false);
      if (next) {
        void ensureUserDocument(
          next.uid,
          next.email ?? null,
          next.displayName ?? null,
        ).catch((e) => console.error("ensureUserDocument", e));
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const getIdToken = useCallback(async () => {
    const auth = getFirebaseAuth();
    const u = auth.currentUser;
    if (!u) return null;
    return u.getIdToken();
  }, []);

  const value = useMemo(
    () => ({ user, loading, getIdToken }),
    [user, loading, getIdToken],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
