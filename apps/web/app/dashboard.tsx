"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api-client";
import { signOutUser } from "@/lib/auth-actions";
import { getFirebaseAuth, isEmulatorMode } from "@/lib/firebase";

interface VerifiedIdentity {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  provider: string | null;
}

const services = [
  ["Web (Next.js)", "http://localhost:3000"],
  ["API (Express)", "http://127.0.0.1:4100/health"],
  ["Auth emulator", "http://127.0.0.1:9099"],
  ["Emulator UI", "http://127.0.0.1:4400"],
] as const;

export function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [identity, setIdentity] = useState<VerifiedIdentity | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
        if (nextUser === null) {
          router.replace("/login");
          return;
        }
        setUser(nextUser);
      });
    } catch {
      router.replace("/login");
    }

    return () => unsubscribe?.();
  }, [router]);

  useEffect(() => {
    if (user === null || user === undefined) return;

    let cancelled = false;
    setApiError(null);

    apiFetch<VerifiedIdentity>("/auth/me")
      .then((result) => {
        if (!cancelled) setIdentity(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setApiError(
            error instanceof Error ? error.message : "Could not verify the session.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (user === undefined || user === null) {
    return (
      <main>
        <p className="eyebrow">CV Digitals Mail</p>
        <p className="lede">
          {user === undefined ? "Checking your session…" : "Redirecting to sign in…"}
        </p>
      </main>
    );
  }

  async function handleSignOut() {
    await signOutUser();
    router.replace("/login");
  }

  return (
    <main>
      <header className="app-header">
        <div>
          <p className="eyebrow">CV Digitals Mail</p>
          <h1>Workspace</h1>
        </div>
        <div className="app-header-actions">
          <span className="session-email">{user.email}</span>
          <button className="ghost-button" type="button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <section className="panel">
        <h2>Verified by the API</h2>
        {apiError !== null ? (
          <p className="state state-err" role="alert">
            {apiError}
          </p>
        ) : identity === null ? (
          <p className="lede">Calling GET /auth/me…</p>
        ) : (
          <dl>
            <dt>UID (from verified token)</dt>
            <dd data-testid="verified-uid">{identity.uid}</dd>
            <dt>Email</dt>
            <dd data-testid="verified-email">{identity.email ?? "—"}</dd>
            <dt>Provider</dt>
            <dd data-testid="verified-provider">{identity.provider ?? "—"}</dd>
            <dt>Email verified</dt>
            <dd>{identity.emailVerified ? "yes" : "no"}</dd>
          </dl>
        )}
      </section>

      <section className="panel">
        <h2>Local services</h2>
        <dl>
          {services.map(([name, address]) => (
            <div key={name} style={{ display: "contents" }}>
              <dt>{name}</dt>
              <dd>{address}</dd>
            </div>
          ))}
          <dt>Auth mode</dt>
          <dd>{isEmulatorMode ? "Firebase Auth emulator" : "Production project"}</dd>
        </dl>
      </section>

      <section className="panel">
        <h2>Not implemented yet</h2>
        <ul className="checks">
          <li>Prospects, drafts, and approvals — Phases 7–10</li>
          <li>SMTP/IMAP mail access — Phases 11–12</li>
          <li>Accounts, analytics, and backups — later phases</li>
        </ul>
      </section>
    </main>
  );
}
