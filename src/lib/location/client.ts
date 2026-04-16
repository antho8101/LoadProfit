/**
 * One-shot browser geolocation — no watchPosition, no background tracking.
 */

export type UserCoordinates = { lat: number; lng: number };

export function getCurrentPositionOnce(): Promise<UserCoordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not available."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => reject(err),
      {
        enableHighAccuracy: false,
        maximumAge: 600_000,
        timeout: 25_000,
      },
    );
  });
}
