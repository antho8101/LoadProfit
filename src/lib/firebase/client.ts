import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/** Allows `next build` without Firebase env; replace with real values for runtime. */
function buildConfig() {
  if (typeof window !== "undefined" && window.__FIREBASE_PUBLIC_CONFIG__?.apiKey) {
    return window.__FIREBASE_PUBLIC_CONFIG__;
  }

  const p = (name: string, fallback: string) =>
    process.env[name]?.trim() || fallback;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim();
  return {
    apiKey: p("NEXT_PUBLIC_FIREBASE_API_KEY", "build-placeholder-key"),
    authDomain: p("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "placeholder.firebaseapp.com"),
    projectId: p("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "placeholder-project"),
    storageBucket: p("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "placeholder.appspot.com"),
    messagingSenderId: p(
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "000000000000",
    ),
    appId: p("NEXT_PUBLIC_FIREBASE_APP_ID", "1:000000000000:web:0000000000000000000000"),
    ...(measurementId ? { measurementId } : {}),
  };
}

let app: FirebaseApp;
let warnedBadConfig = false;

function warnIfFirebaseEnvMissingInDev(config: ReturnType<typeof buildConfig>) {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") return;
  if (warnedBadConfig) return;
  const badKey =
    !config.apiKey ||
    config.apiKey === "build-placeholder-key" ||
    config.projectId === "placeholder-project";
  if (badKey) {
    warnedBadConfig = true;
    console.error(
      "[LoadProfit] La config Firebase client est invalide ou absente (NEXT_PUBLIC_FIREBASE_*). " +
        "Vérifie .env à la racine, copie éventuelle dans .env.local, puis supprime le dossier .next et redémarre npm run dev.",
    );
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    const config = buildConfig();
    warnIfFirebaseEnvMissingInDev(config);
    app = initializeApp(config);
  } else {
    app = getApps()[0]!;
  }
  return app;
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}

/**
 * Initialise Google Analytics (Firebase) uniquement dans le navigateur, si supporté.
 * À appeler une fois au démarrage de l’app (ex. depuis AuthProvider).
 */
export function initFirebaseAnalytics(): void {
  if (typeof window === "undefined") return;
  const mid =
    window.__FIREBASE_PUBLIC_CONFIG__?.measurementId ??
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim();
  if (!mid) return;

  void import("firebase/analytics")
    .then(({ getAnalytics, isSupported }) =>
      isSupported().then((ok) => {
        if (ok) getAnalytics(getFirebaseApp());
      }),
    )
    .catch(() => {
      /* Analytics indisponible (SSR, bloqueur, etc.) */
    });
}
