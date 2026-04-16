import { NextResponse } from "next/server";

/**
 * Dev only: vérifie ce que le serveur Next lit pour Firebase (sans exposer la clé entière).
 * GET http://localhost:3000/api/dev/firebase-config-check
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ?? "";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "";
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "";

  const enc = encodeURIComponent(projectId);
  const gcpConsole = `https://console.cloud.google.com`;
  const links =
    projectId.length > 0
      ? {
          firebaseWebConfig: `https://console.firebase.google.com/project/${enc}/settings/general/web`,
          gcpCredentials: `${gcpConsole}/apis/credentials?project=${enc}`,
          enableIdentityToolkitApi: `${gcpConsole}/apis/library/identitytoolkit.googleapis.com?project=${enc}`,
          enabledApis: `${gcpConsole}/apis/dashboard?project=${enc}`,
        }
      : null;

  return NextResponse.json({
    hasApiKey: apiKey.length > 0,
    apiKeyLength: apiKey.length,
    apiKeyPrefix: apiKey.slice(0, 8),
    apiKeySuffix: apiKey.length > 4 ? apiKey.slice(-4) : "",
    projectId,
    authDomain,
    links,
    checklist: [
      "1) Dans Google Cloud → Bibliothèque : activer « Identity Toolkit API » (lien enableIdentityToolkitApi).",
      "2) Dans Identifiants : ouvrir la clé dont la valeur = ta apiKey Web (pas la clé Maps).",
      "3) Restrictions d’application : « Sites web » avec http://localhost:3000/* ET http://127.0.0.1:3000/* — ou « Aucune » pour tester.",
      "4) Restrictions d’API : « Aucune » pour tester, ou ajouter au minimum « Identity Toolkit API ».",
      "5) Supprimer .next, redémarrer npm run dev.",
    ],
    hint:
      "auth/api-key-not-valid = la clé est refusée par Google (souvent API désactivée ou restrictions). Suit checklist + links.",
  });
}
