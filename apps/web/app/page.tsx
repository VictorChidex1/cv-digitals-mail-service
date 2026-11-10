import { FirebaseStatus } from "./components/firebase-status";

const services = [
  ["Web (Next.js)", "http://localhost:3000"],
  ["API (Express)", "http://127.0.0.1:4100/health"],
  ["Auth emulator", "http://127.0.0.1:9099"],
  ["Emulator UI", "http://127.0.0.1:4400"],
] as const;

export default function HomePage() {
  return (
    <main>
      <p className="eyebrow">CV Digitals Mail</p>
      <h1>Phase 1 foundation</h1>
      <p className="lede">
        Monorepo, strict TypeScript, and Firebase Authentication foundations.
        Mail sending is not implemented, and no prospect or message data exists
        yet.
      </p>

      <FirebaseStatus />

      <section className="panel">
        <h2>Local services</h2>
        <dl>
          {services.map(([name, address]) => (
            <div key={name} style={{ display: "contents" }}>
              <dt>{name}</dt>
              <dd>{address}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel">
        <h2>Not implemented yet</h2>
        <ul className="checks">
          <li>Sign-in and protected routes — Phase 3</li>
          <li>SQLite persistence — Phase 2</li>
          <li>Prospects, drafts, and approvals — Phases 7–10</li>
          <li>SMTP/IMAP mail access — Phases 11–12</li>
        </ul>
      </section>
    </main>
  );
}
