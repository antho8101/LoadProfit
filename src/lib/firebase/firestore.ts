import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import type { SavedTrip } from "@/types/trip";
import type { LocalePreference } from "@/lib/i18n/locale-types";
import type { UserDoc } from "@/types/user-doc";
import type { VehicleStored } from "@/types/vehicle";
import { getFirebaseDb } from "@/lib/firebase/client";

export function userDocRef(db: Firestore, uid: string) {
  return doc(db, "users", uid);
}

export function vehiclesCollectionRef(db: Firestore, uid: string) {
  return collection(db, "users", uid, "vehicles");
}

export function tripsCollectionRef(db: Firestore, uid: string) {
  return collection(db, "users", uid, "trips");
}

/** Create user profile on first sign-in; later sign-ins only refresh email/name. */
export async function ensureUserDocument(
  uid: string,
  email: string | null,
  displayName: string | null,
): Promise<void> {
  const db = getFirebaseDb();
  const ref = userDocRef(db, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      displayName,
      createdAt: new Date().toISOString(),
      subscriptionStatus: "none" as const,
      subscriptionPlan: null,
      subscriptionCurrentPeriodEnd: null,
      stripeCustomerId: null,
      updatedAt: serverTimestamp(),
    });
    return;
  }
  await setDoc(
    ref,
    {
      email,
      displayName,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateUserLocalePreference(
  uid: string,
  preference: LocalePreference,
): Promise<void> {
  const db = getFirebaseDb();
  await setDoc(
    userDocRef(db, uid),
    {
      localePreference: preference,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function subscribeUserDoc(
  uid: string,
  onNext: (data: UserDoc | null) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(userDocRef(db, uid), (snap) => {
    if (!snap.exists()) {
      onNext(null);
      return;
    }
    onNext(snap.data() as UserDoc);
  });
}

function tripToFirestore(t: SavedTrip): Record<string, unknown> {
  return {
    id: t.id,
    createdAt: t.createdAt,
    savedAt: t.savedAt ?? null,
    departureCity: t.departureCity,
    arrivalCity: t.arrivalCity,
    offeredPrice: t.offeredPrice,
    totalCost: t.totalCost,
    profit: t.profit,
    status: t.status,
    distanceKm: t.distanceKm,
    emptyReturn: t.emptyReturn,
    marginPercent: t.marginPercent,
    vehicleName: t.vehicleName,
    vehicleId: t.vehicleId ?? null,
    decision: t.decision,
    calcKey: t.calcKey ?? null,
  };
}

export async function saveTrip(uid: string, trip: SavedTrip): Promise<void> {
  const db = getFirebaseDb();
  await setDoc(doc(tripsCollectionRef(db, uid), trip.id), tripToFirestore(trip));
}

export async function deleteAllTrips(uid: string): Promise<void> {
  const db = getFirebaseDb();
  const q = query(tripsCollectionRef(db, uid));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function saveVehicle(uid: string, v: VehicleStored): Promise<void> {
  const db = getFirebaseDb();
  await setDoc(doc(vehiclesCollectionRef(db, uid), v.id), { ...v });
}

export async function deleteVehicle(uid: string, vehicleId: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(vehiclesCollectionRef(db, uid), vehicleId));
}

function sortByCreatedAtDesc<T extends { createdAt: string }>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function subscribeVehicles(
  uid: string,
  onNext: (rows: VehicleStored[]) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(vehiclesCollectionRef(db, uid));
  return onSnapshot(q, (snap) => {
    const rows: VehicleStored[] = [];
    snap.forEach((d) => rows.push(d.data() as VehicleStored));
    onNext(sortByCreatedAtDesc(rows));
  });
}

export function subscribeTrips(
  uid: string,
  onNext: (rows: SavedTrip[]) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(tripsCollectionRef(db, uid));
  return onSnapshot(q, (snap) => {
    const rows: SavedTrip[] = [];
    snap.forEach((d) => rows.push(d.data() as SavedTrip));
    onNext(sortByCreatedAtDesc(rows));
  });
}
