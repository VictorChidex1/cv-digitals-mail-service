"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  sendResetEmail,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/auth-actions";
import { authEmulatorUrl, getFirebaseAuth } from "@/lib/firebase";

type Pending = "email" | "google" | "reset" | null;

function errorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/invalid-email":
      return "That email address does not look right.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it finished.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled for this Firebase project.";
    case "auth/network-request-failed":
      return "Could not reach the authentication service.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
        if (user !== null) router.replace("/");
      });
    } catch {
      // Configuration failure is surfaced when the user submits.
    }

    return () => unsubscribe?.();
  }, [router]);

  const busy = pending !== null;

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPending("email");

    try {
      await signInWithEmail(email.trim(), password);
      router.replace("/");
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setPending(null);
    }
  }

  async function handleGoogle() {
    setError(null);
    setNotice(null);
    setPending("google");

    try {
      await signInWithGoogle();
      router.replace("/");
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setPending(null);
    }
  }

  async function handleReset() {
    setError(null);
    setNotice(null);

    if (email.trim() === "") {
      setError("Enter your email address first, then choose forgot password.");
      return;
    }

    setPending("reset");
    try {
      await sendResetEmail(email.trim());
      setNotice("Password reset email sent. Check that inbox.");
    } catch (resetError) {
      setError(errorMessage(resetError));
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card p-12 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_0%,rgba(63,191,119,0.10),transparent_60%),radial-gradient(700px_400px_at_100%_100%,rgba(127,178,229,0.08),transparent_55%)]"
        />

        <div className="relative">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="grid size-9 place-items-center rounded-lg border border-border bg-background text-[11px] font-semibold text-foreground">
              CV
            </span>
            CV Digitals Mail
          </div>

          <h2 className="mt-10 max-w-[20ch] text-[clamp(2rem,3.2vw,2.75rem)] font-semibold leading-[1.12] tracking-tight">
            Outreach operations, under your control.
          </h2>
          <p className="mt-4 max-w-[46ch] text-[15px] text-muted-foreground">
            Researched prospects, deliberate approval, and a complete local
            record of everything you send.
          </p>

          <ul className="mt-8 space-y-2.5 text-sm text-muted-foreground">
            {[
              "Personalised drafts, never bulk blasts",
              "Human approval before every send",
              "Your data stays on this Mac",
            ].map((point) => (
              <li key={point} className="flex gap-3">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3 text-xs text-muted-foreground">
          {authEmulatorUrl !== null ? (
            <Badge
              variant="outline"
              className="border-amber-500/40 text-amber-300"
            >
              Auth emulator
            </Badge>
          ) : null}
          <span>Local-first</span>
        </div>
      </aside>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground lg:hidden">
            <span className="grid size-8 place-items-center rounded-md border border-border bg-card text-[10px] font-semibold text-foreground">
              CV
            </span>
            CV Digitals Mail
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to continue to your outreach workspace.
          </p>

          {error !== null ? (
            <p
              role="alert"
              data-testid="login-error"
              className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-red-300"
            >
              {error}
            </p>
          ) : null}
          {notice !== null ? (
            <p
              role="status"
              data-testid="login-notice"
              className="mt-5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm text-emerald-200"
            >
              {notice}
            </p>
          ) : null}

          <form onSubmit={handleEmailSubmit} noValidate className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@cvdigitals.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={error !== null ? true : undefined}
                required
                className="h-10 bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={error !== null ? true : undefined}
                  required
                  className="h-10 bg-background pr-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  aria-controls="password"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="h-10 w-full" disabled={busy}>
              {pending === "email" ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            className="h-10 w-full"
            type="button"
            onClick={handleGoogle}
            disabled={busy}
          >
            <GoogleIcon />
            {pending === "google" ? "Opening Google…" : "Continue with Google"}
          </Button>

          <Button
            type="button"
            variant="link"
            className="mt-3 h-auto w-full text-xs text-muted-foreground"
            onClick={handleReset}
            disabled={busy}
          >
            {pending === "reset" ? "Sending reset email…" : "Forgot password?"}
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Access is limited to the operator account for this workspace.
          </p>
        </div>
      </section>
    </div>
  );
}

function EyeIcon(): ReactNode {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon(): ReactNode {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.6 6.1A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-2.9 3.6M6.4 7.9A16.7 16.7 0 0 0 2.5 12s3.5 6 9.5 6a9.6 9.6 0 0 0 3.4-.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 10a2.9 2.9 0 0 0 4.1 4.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleIcon(): ReactNode {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
