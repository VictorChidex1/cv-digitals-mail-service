import { getApps, initializeApp } from "firebase-admin/app";

import { env } from "../config/env.js";

/**
 * Phase 1 foundation only: initialise the Admin SDK so later phases can verify
 * ID tokens. Route protection is Phase 3 work.
 *
 * When FIREBASE_AUTH_EMULATOR_HOST is set, the Admin SDK targets the local Auth
 * emulator automatically. Credentials are intentionally not configured here.
 */
export function initFirebaseAdmin(): void {
  if (getApps().length > 0) return;
  initializeApp({ projectId: env.firebaseProjectId });
}
