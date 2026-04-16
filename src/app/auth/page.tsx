"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { useAuth } from "@/contexts/auth-context";
import { useLocale } from "@/contexts/locale-context";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        {t("auth_loading")}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <p className="mb-8 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        LoadProfit
      </p>
      <AuthForm />
    </div>
  );
}
