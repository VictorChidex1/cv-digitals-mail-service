"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import { authEmulatorUrl, firebaseProjectId, getFirebaseAuth } from "@/lib/firebase";

type Result =
  | { state: "initialising" }
  | { state: "ready"; signedInAs: string | null }
  | { state: "error"; message: string };

/**
 * Reports the real client-SDK state. It does not claim a connection unless the
 * SDK reports one, and it performs no sign-in (that is Phase 3).
 */
export function FirebaseStatus() {
  const [result, setResult] = useState<Result>({ state: "initialising" });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(
        auth,
        (user) =>
          setResult({ state: "ready", signedInAs: user?.email ?? null }),
        (error: Error) => setResult({ state: "error", message: error.message }),
      );
    } catch (error) {
      setResult({
        state: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return () => unsubscribe?.();
  }, []);

  return (
    <section className="panel">
      <h2>Firebase client SDK</h2>
      <dl>
        <dt>Project</dt>
        <dd>{firebaseProjectId}</dd>
        <dt>Auth target</dt>
        <dd>{authEmulatorUrl ?? "production project (not configured)"}</dd>
        <dt>SDK state</dt>
        <dd className={`state state-${result.state === "ready" ? "ok" : result.state === "error" ? "err" : "warn"}`}>
          {result.state}
        </dd>
        <dt>Signed in</dt>
        <dd>
          {result.state === "ready"
            ? (result.signedInAs ?? "no (sign-in arrives in Phase 3)")
            : "—"}
        </dd>
        {result.state === "error" ? (
          <>
            <dt>Error</dt>
            <dd>{result.message}</dd>
          </>
        ) : null}
      </dl>
    </section>
  );
}
