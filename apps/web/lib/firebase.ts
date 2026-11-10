import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";

/**
 * Client-safe Firebase configuration. Only NEXT_PUBLIC_* values are used, and
 * none of them are secrets. Admin SDK credentials never belong in this app.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "cv-digitals-mail-dev",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
} as const;

export const firebaseProjectId = firebaseConfig.projectId;

export const authEmulatorUrl =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true"
    ? "http://127.0.0.1:9099"
    : null;

export function getFirebaseApp() {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

let emulatorAttached = false;

export function getFirebaseAuth(): Auth {
  const auth = getAuth(getFirebaseApp());
  if (authEmulatorUrl !== null && !emulatorAttached) {
    connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
    emulatorAttached = true;
  }
  return auth;
}
