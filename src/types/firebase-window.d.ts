import type { FirebaseOptions } from "firebase/app";

declare global {
  interface Window {
    /** Injecté par FirebaseConfigScript (layout serveur) — contourne les soucis Turbopack / NEXT_PUBLIC côté client. */
    __FIREBASE_PUBLIC_CONFIG__?: FirebaseOptions;
  }
}

export {};
