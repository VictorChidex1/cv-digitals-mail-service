import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";

const emulatorMode = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";
const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "cv-digitals-mail-dev";

/**
 * Client-safe Firebase configuration. Only NEXT_PUBLIC_* values are used, and
 * none of them are secrets. Admin SDK credentials never belong in this app.
 */
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    (emulatorMode ? "demo-api-key" : ""),
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    (emulatorMode ? `${projectId}.firebaseapp.com` : ""),
  projectId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
} as const;

export const firebaseProjectId = firebaseConfig.projectId;
export const isEmulatorMode = emulatorMode;

export const authEmulatorUrl = emulatorMode
  ? (process.env.NEXT_PUBLIC_AUTH_EMULATOR_URL ?? "http://127.0.0.1:9099")
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
