"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayoutNav, parseAppSection } from "@/components/app-layout-nav";
import { useAuth } from "@/contexts/auth-context";
import { useLocale } from "@/contexts/locale-context";
import {
  deleteAllTrips,
  saveTrip,
  saveVehicle,
  subscribeTrips,
  subscribeUserDoc,
  subscribeVehicles,
  deleteVehicle as deleteVehicleFs,
} from "@/lib/firebase/firestore";
import { enrichAllVehiclesWithLiveFuel } from "@/lib/fuel/live-vehicle-fuel";
import {
  loadLocationPreferences,
  type LocationPreferences,
} from "@/lib/storage/location-preferences";
import { computeDashboardStats } from "@/lib/dashboard";
import type { SavedTrip } from "@/types/trip";
import type { UserDoc } from "@/types/user-doc";
import type { VehicleProfile, VehicleStored } from "@/types/vehicle";
import { DashboardSummary } from "@/components/dashboard-summary";
import {
  TripCalculatorForm,
  type RouteReusePrefill,
} from "@/components/trip-calculator-form";
import { TripHistory } from "@/components/trip-history";
import { OnboardingHint } from "@/components/onboarding-hint";
import { VehicleSettingsPanel } from "@/components/vehicle-settings-panel";
import { LocationPrompt } from "@/components/location-prompt";
import { AccountPanel } from "@/components/account-panel";

export function AppShell() {
  const { user, loading, getIdToken } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutFlash = searchParams.get("checkout");
  const section = parseAppSection(searchParams.get("section"));

  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [storedVehicles, setStoredVehicles] = useState<VehicleStored[]>([]);
  const [liveVehicles, setLiveVehicles] = useState<VehicleProfile[]>([]);
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [vehiclesFuelLoading, setVehiclesFuelLoading] = useState(true);
  const [locationPrefs, setLocationPrefs] = useState<LocationPreferences>({
    consent: "unknown",
    promptSeen: false,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user, router]);

  useEffect(() => {
    setLocationPrefs(loadLocationPreferences());
  }, []);

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setStoredVehicles([]);
      setTrips([]);
      return;
    }
    const unsubUser = subscribeUserDoc(uid, setProfile);
    const unsubV = subscribeVehicles(uid, setStoredVehicles);
    const unsubT = subscribeTrips(uid, setTrips);
    return () => {
      unsubUser();
      unsubV();
      unsubT();
    };
  }, [uid]);

  const userCoords = useMemo(() => {
    if (
      locationPrefs.consent === "granted" &&
      locationPrefs.lat !== undefined &&
      locationPrefs.lng !== undefined
    ) {
      return { lat: locationPrefs.lat, lng: locationPrefs.lng };
    }
    return null;
  }, [locationPrefs]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setVehiclesFuelLoading(true);
      try {
        const next = await enrichAllVehiclesWithLiveFuel(
          storedVehicles,
          userCoords,
        );
        if (!cancelled) setLiveVehicles(next);
      } finally {
        if (!cancelled) setVehiclesFuelLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storedVehicles, userCoords]);

  const persistVehicle = useCallback(
    async (v: VehicleStored) => {
      if (!uid) return;
      await saveVehicle(uid, v);
    },
    [uid],
  );

  const removeVehicle = useCallback(
    async (id: string) => {
      if (!uid) return;
      await deleteVehicleFs(uid, id);
    },
    [uid],
  );

  const persistTrip = useCallback(
    async (trip: SavedTrip) => {
      if (!uid) return;
      await saveTrip(uid, trip);
    },
    [uid],
  );

  const handleClearTrips = useCallback(async () => {
    if (!uid) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(t("trips_confirmClear"))
    ) {
      return;
    }
    await deleteAllTrips(uid);
  }, [uid, t]);

  const stats = useMemo(() => computeDashboardStats(trips), [trips]);

  const routeReuse = useMemo((): RouteReusePrefill => {
    const from = searchParams.get("reuseFrom") ?? "";
    const to = searchParams.get("reuseTo") ?? "";
    const vehicleId = searchParams.get("reuseVehicle") ?? "";
    if (!from.trim() && !to.trim() && !vehicleId.trim()) return null;
    return {
      departure: from,
      arrival: to,
      vehicleId,
    };
  }, [searchParams]);

  const handleReuseTrip = useCallback(
    (trip: SavedTrip) => {
      const params = new URLSearchParams();
      params.set("section", "home");
      const from = trip.departureCity.trim();
      const to = trip.arrivalCity.trim();
      if (from) params.set("reuseFrom", from);
      if (to) params.set("reuseTo", to);
      let vehicleId = trip.vehicleId?.trim() ?? "";
      if (!vehicleId && trip.vehicleName) {
        const match = liveVehicles.find((v) => v.name === trip.vehicleName);
        if (match) vehicleId = match.id;
      }
      if (vehicleId) params.set("reuseVehicle", vehicleId);
      router.push(`/?${params.toString()}#trip-calculator`);
    },
    [router, liveVehicles],
  );

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[var(--muted)]">
        {t("common_loading")}
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] min-h-screen">
      <Suspense
        fallback={
          <div
            className="hidden w-52 shrink-0 border-r border-[var(--border)] bg-[var(--card)] md:block lg:w-56"
            aria-hidden
          />
        }
      >
        <AppLayoutNav />
      </Suspense>

      <div className="flex min-w-0 flex-1 flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-6 md:py-12">
          {checkoutFlash === "success" ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
              {t("checkout_success")}
            </div>
          ) : null}
          {checkoutFlash === "canceled" ? (
            <div className="rounded-md border border-[var(--border)] bg-neutral-50 px-4 py-3 text-sm text-[var(--muted)] dark:bg-neutral-950">
              {t("checkout_canceled")}
            </div>
          ) : null}

          {section === "home" ? (
            <div className="flex flex-col gap-8">
              <header className="order-1 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  LoadProfit
                </p>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                    {t("home_title")}
                  </h1>
                  <p className="max-w-2xl text-[15px] leading-relaxed text-[var(--muted)] sm:text-base">
                    {t("home_subtitle")}
                  </p>
                </div>
              </header>

              <div className="order-2">
                <OnboardingHint
                  vehicleCount={liveVehicles.length}
                  savedTripCount={trips.length}
                />
              </div>

              <div className="order-3 md:order-5">
                <TripCalculatorForm
                  vehicles={liveVehicles}
                  vehiclesFuelLoading={vehiclesFuelLoading}
                  persistTrip={persistTrip}
                  routeReuse={routeReuse}
                />
              </div>

              {!locationPrefs.promptSeen ? (
                <div className="order-4 md:order-3">
                  <LocationPrompt onPreferencesChange={setLocationPrefs} />
                </div>
              ) : null}

              <div className="order-5 md:order-4">
                <DashboardSummary stats={stats} />
              </div>

              <div className="order-6 md:order-6">
                <TripHistory
                  trips={trips}
                  onClear={() => void handleClearTrips()}
                  onReuseTrip={handleReuseTrip}
                />
              </div>
            </div>
          ) : null}

          {section === "vehicles" ? (
            <>
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  LoadProfit
                </p>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {t("vehicles_header_title")}
                </h1>
                <p className="max-w-2xl text-sm text-[var(--muted)]">
                  {t("vehicles_header_desc")}
                </p>
              </header>

              <VehicleSettingsPanel
                vehicles={liveVehicles}
                userCoords={userCoords}
                persistVehicle={persistVehicle}
                removeVehicle={removeVehicle}
                initialOpen
              />
            </>
          ) : null}

          {section === "account" ? (
            <>
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  LoadProfit
                </p>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {t("account_header_title")}
                </h1>
                <p className="max-w-2xl text-sm text-[var(--muted)]">
                  {t("account_header_desc")}
                </p>
              </header>

              <div className="max-w-lg">
                <AccountPanel
                  email={user.email}
                  profile={profile}
                  getIdToken={getIdToken}
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
