import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Service status — CV Digitals Mail",
};

interface HealthPayload {
  status: "ok" | "error";
  service: string;
  version: string;
  environment: string;
  database: { status: "ok" | "error"; migrations: number };
  firebase: { projectId: string; authEmulator: boolean };
  timestamp: string;
}

type HealthResult =
  | { ok: true; data: HealthPayload }
  | { ok: false; message: string };

async function fetchHealth(): Promise<HealthResult> {
  const baseUrl = process.env.API_URL ?? "http://127.0.0.1:4100";

  try {
    const response = await fetch(`${baseUrl}/health`, { cache: "no-store" });
    if (!response.ok) {
      return { ok: false, message: `The API responded with ${response.status}.` };
    }
    return { ok: true, data: (await response.json()) as HealthPayload };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? `Could not reach the API: ${error.message}`
          : "Could not reach the API.",
    };
  }
}

export default async function StatusPage() {
  const result = await fetchHealth();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          CV Digitals Mail
        </p>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">Back to workspace</Link>
        </Button>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">Service status</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Live result of <code className="rounded bg-card px-1 py-0.5">GET /health</code>{" "}
        on the local Express API. This page reports what the API says; it does not
        invent a status.
      </p>

      {result.ok ? (
        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Identity and environment of the responder.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Overall">
                <Badge
                  data-testid="status-overall"
                  variant="outline"
                  className={
                    result.data.status === "ok"
                      ? "border-primary/40 text-primary"
                      : "border-destructive/40 text-red-300"
                  }
                >
                  {result.data.status}
                </Badge>
              </Row>
              <Row label="Service">
                <span data-testid="status-service">{result.data.service}</span>
              </Row>
              <Row label="Version">{result.data.version}</Row>
              <Row label="Environment">{result.data.environment}</Row>
              <Row label="Checked at">
                <span className="tabular-nums">{result.data.timestamp}</span>
              </Row>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database</CardTitle>
              <CardDescription>SQLite on this Mac.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Status">
                <Badge
                  data-testid="status-database"
                  variant="outline"
                  className={
                    result.data.database.status === "ok"
                      ? "border-primary/40 text-primary"
                      : "border-destructive/40 text-red-300"
                  }
                >
                  {result.data.database.status}
                </Badge>
              </Row>
              <Row label="Applied migrations">
                <span data-testid="status-migrations" className="tabular-nums">
                  {result.data.database.migrations}
                </span>
              </Row>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Firebase</CardTitle>
              <CardDescription>Identity provider configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Project">{result.data.firebase.projectId}</Row>
              <Row label="Auth target">
                {result.data.firebase.authEmulator
                  ? "Local Auth emulator"
                  : "Production project"}
              </Row>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="mt-6 border-destructive/40">
          <CardHeader>
            <CardTitle>Unavailable</CardTitle>
            <CardDescription>
              Start the stack with <code>npm run dev</code> and reload this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p
              role="alert"
              data-testid="status-error"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-red-300"
            >
              {result.message}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex gap-5 text-sm">
        <Link className="text-primary hover:underline" href="/">
          Back to workspace
        </Link>
        <Link className="text-muted-foreground hover:text-foreground" href="/status">
          Refresh
        </Link>
      </div>
    </main>
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
