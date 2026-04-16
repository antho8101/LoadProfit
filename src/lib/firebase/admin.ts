import admin from "firebase-admin";

let initialized = false;

function initAdmin(): void {
  if (initialized) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not set (JSON string of the service account).",
    );
  }
  const cred = JSON.parse(raw) as admin.ServiceAccount;
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(cred),
    });
  }
  initialized = true;
}

export function getAdminApp(): admin.app.App {
  initAdmin();
  return admin.app();
}

export function getAdminFirestore(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}

export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}
