"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/contexts/locale-context";
import type { MessageId } from "@/lib/i18n/catalog";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { interpolate, translate } from "@/lib/i18n/catalog";
import type { UiLocale } from "@/lib/i18n/locale-types";

function getFirebaseAuthErr(err: unknown): { code: string; message: string } {
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    typeof (err as { code: unknown }).code === "string"
  ) {
    const code = (err as { code: string }).code;
    const message =
      "message" in err && typeof (err as { message: unknown }).message === "string"
        ? (err as { message: string }).message
        : "";
    return { code, message };
  }
  if (err instanceof Error) return { code: "", message: err.message };
  return { code: "", message: String(err) };
}

function mapAuthError(
  code: string,
  t: (id: MessageId) => string,
  locale: UiLocale,
): string {
  if (code.includes("api-key")) {
    return t("auth_err_apiKey");
  }
  switch (code) {
    case "auth/email-already-in-use":
      return t("auth_err_emailInUse");
    case "auth/invalid-email":
      return t("auth_err_invalidEmail");
    case "auth/weak-password":
      return t("auth_err_weakPassword");
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return t("auth_err_wrongCreds");
    case "auth/too-many-requests":
      return t("auth_err_tooMany");
    case "auth/popup-closed-by-user":
      return t("auth_err_popup");
    case "auth/operation-not-allowed":
      return t("auth_err_operationNotAllowed");
    case "auth/network-request-failed":
      return t("auth_err_network");
    case "auth/invalid-api-key":
    default:
      return code
        ? interpolate(translate(locale, "auth_err_failed"), { code })
        : t("auth_err_generic");
  }
}

export function AuthForm() {
  const { t, effectiveLocale } = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setError(null);
    const e = email.trim();
    if (!e || password.length < 6) {
      setError(t("auth_error_emailPassword"));
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(e, password);
      } else {
        await signInWithEmail(e, password);
      }
      router.replace("/");
      router.refresh();
    } catch (err: unknown) {
      const { code, message } = getFirebaseAuthErr(err);
      if (process.env.NODE_ENV === "development") {
        console.error("[LoadProfit auth]", { code, message, err });
      }
      const base = mapAuthError(code, t, effectiveLocale);
      setError(
        process.env.NODE_ENV === "development" && message
          ? `${base}\n(${message})`
          : base,
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/");
      router.refresh();
    } catch (err: unknown) {
      const { code, message } = getFirebaseAuthErr(err);
      if (process.env.NODE_ENV === "development") {
        console.error("[LoadProfit auth Google]", { code, message, err });
      }
      const base = mapAuthError(code, t, effectiveLocale);
      setError(
        process.env.NODE_ENV === "development" && message
          ? `${base}\n(${message})`
          : base,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {mode === "signin" ? t("auth_signIn") : t("auth_createAccount")}
        </CardTitle>
        <CardDescription>{t("auth_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading}
          onClick={() => void handleGoogle()}
        >
          {t("auth_google")}
        </Button>

        <div className="relative py-2 text-center text-xs text-[var(--muted)]">
          <span className="bg-[var(--card)] px-2">{t("auth_orEmail")}</span>
          <div className="absolute left-0 right-0 top-1/2 -z-10 h-px bg-[var(--border)]" />
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth-email">{t("auth_email")}</Label>
            <Input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-password">{t("auth_password")}</Label>
            <Input
              id="auth-password"
              type="password"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-[var(--muted)]">{t("auth_passwordHint")}</p>
          </div>

          {error ? (
            <p className="whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? t("auth_wait")
              : mode === "signin"
                ? t("auth_signIn")
                : t("auth_createAccount")}
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--muted)]">
          {mode === "signin" ? (
            <button
              type="button"
              className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
            >
              {t("auth_toggleSignUp")}
            </button>
          ) : (
            <button
              type="button"
              className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
            >
              {t("auth_toggleSignIn")}
            </button>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
