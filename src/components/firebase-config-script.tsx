import type { FirebaseOptions } from "firebase/app";

/**
 * Composant serveur : sérialise la config Firebase dans une balise script.
 * Le bundle client ne reçoit pas toujours les NEXT_PUBLIC_* avec Turbopack ;
 * ici `process.env` est lu côté serveur (fiable).
 */
export function FirebaseConfigScript() {
  const opts: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim();
  if (measurementId) {
    (opts as FirebaseOptions & { measurementId?: string }).measurementId =
      measurementId;
  }

  const json = JSON.stringify(opts);
  return (
    <script
      id="firebase-public-config"
      // JSON.stringify échappe correctement pour une balise script.
      dangerouslySetInnerHTML={{
        __html: `window.__FIREBASE_PUBLIC_CONFIG__=${json};`,
      }}
    />
  );
}
