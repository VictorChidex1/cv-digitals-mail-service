"use client";

import { ArrowUpRight, CheckCircle2, Database, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { useSession } from "@/components/session-provider";
import { PageHeader } from "@/components/shell/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { isEmulatorMode } from "@/lib/firebase";

interface VerifiedIdentity {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  provider: string | null;
}

const completed = [
  "Phase 1 — workspace and TypeScript foundation",
  "Phase 2 — SQLite, Drizzle, and migrations",
  "Phase 3 — authentication and the login page",
  "Phase 4 — validation, limits, logging, and error handling",
  "Phase 5 — dashboard shell and design system",
];

const forthcoming = [
  "Phase 6 — email account configuration",
  "Phase 7 — prospects and research records",
  "Phases 8–10 — campaigns, drafting, approval",
  "Phases 11–13 — sending, replies, follow-ups",
  "Phases 14–16 — analytics, backups, hardening",
];

export default function OverviewPage() {
  const { user } = useSession();
  const [identity, setIdentity] = useState<VerifiedIdentity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user === null) return;

    let cancelled = false;
    setError(null);

    apiFetch<VerifiedIdentity>("/auth/me")
      .then((result) => {
        if (!cancelled) setIdentity(result);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not verify the session.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Overview"
        description="A truthful snapshot of the workspace. Nothing here is simulated: where data does not exist yet, it is marked as unavailable."
        action={
          <Badge variant="outline" className="gap-1.5">
            <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
            Foundations complete
          </Badge>
        }
      />

      {error !== null ? (
        <Alert variant="destructive">
          <AlertTitle>Session could not be verified</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verified by the API</CardTitle>
            <CardDescription>
              Identity taken from the Firebase token, not from the browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {identity === null ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <Row label="Email">
                  <span data-testid="verified-email">
                    {identity.email ?? "—"}
                  </span>
                </Row>
                <Row label="UID">
                  <span
                    className="break-all font-mono text-xs"
                    data-testid="verified-uid"
                  >
                    {identity.uid}
                  </span>
                </Row>
                <Row label="Provider">
                  <span data-testid="verified-provider">
                    {identity.provider ?? "—"}
                  </span>
                </Row>
                <Row label="Email verified">
                  {identity.emailVerified ? "yes" : "no"}
                </Row>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s outreach</CardTitle>
            <CardDescription>
              The operating target is 40 prepared emails per day, split across
              the two Gmail accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Prepared">—</Row>
            <Row label="Awaiting approval">—</Row>
            <Row label="Sent">—</Row>
            <p className="pt-2 text-xs text-muted-foreground">
              No outreach data exists yet. Prospects and drafts arrive in
              Phases 7–10.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Local services</CardTitle>
            <CardDescription>Everything runs on this Mac.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Web">localhost:3000</Row>
            <Row label="API">127.0.0.1:4100</Row>
            <Row label="Database">SQLite · local file</Row>
            <Row label="Auth">
              {isEmulatorMode ? "Firebase Auth emulator" : "Firebase project"}
            </Row>
            <Button asChild variant="outline" size="sm" className="mt-2 w-fit">
              <Link href="/status">
                Open service status
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Build progress</CardTitle>
            <CardDescription>
              What exists, and what is still planned.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="mb-2 flex items-center gap-2 font-medium">
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                Complete
              </p>
              <ul className="space-y-1 text-muted-foreground">
                {completed.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 font-medium">
                <Database className="size-4 text-muted-foreground" aria-hidden="true" />
                Planned
              </p>
              <ul className="space-y-1 text-muted-foreground">
                {forthcoming.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
