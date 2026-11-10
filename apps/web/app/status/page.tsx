import type { Metadata } from "next";
import Link from "next/link";

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
    <main>
      <p className="eyebrow">CV Digitals Mail</p>
      <h1>Service status</h1>
      <p className="lede">
        Live result of <code>GET /health</code> on the local Express API. This
        page reports what the API says; it does not invent a status.
      </p>

      {result.ok ? (
        <>
          <section className="panel">
            <h2>Summary</h2>
            <dl>
              <dt>Overall</dt>
              <dd
                className={`state state-${result.data.status === "ok" ? "ok" : "err"}`}
                data-testid="status-overall"
              >
                {result.data.status}
              </dd>
              <dt>Service</dt>
              <dd data-testid="status-service">{result.data.service}</dd>
              <dt>Version</dt>
              <dd>{result.data.version}</dd>
              <dt>Environment</dt>
              <dd>{result.data.environment}</dd>
              <dt>Checked at</dt>
              <dd>{result.data.timestamp}</dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Database</h2>
            <dl>
              <dt>Status</dt>
              <dd
                className={`state state-${result.data.database.status === "ok" ? "ok" : "err"}`}
                data-testid="status-database"
              >
                {result.data.database.status}
              </dd>
              <dt>Applied migrations</dt>
              <dd data-testid="status-migrations">
                {result.data.database.migrations}
              </dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Firebase</h2>
            <dl>
              <dt>Project</dt>
              <dd>{result.data.firebase.projectId}</dd>
              <dt>Auth target</dt>
              <dd>
                {result.data.firebase.authEmulator
                  ? "Local Auth emulator"
                  : "Production project"}
              </dd>
            </dl>
          </section>
        </>
      ) : (
        <section className="panel">
          <h2>Unavailable</h2>
          <p className="state state-err" role="alert" data-testid="status-error">
            {result.message}
          </p>
          <p className="lede">
            Start the stack with <code>npm run dev</code> and reload this page.
          </p>
        </section>
      )}

      <p className="status-actions">
        <Link className="text-link" href="/">
          Back to workspace
        </Link>
        <a className="text-link" href="/status">
          Refresh
        </a>
      </p>
    </main>
  );
}
