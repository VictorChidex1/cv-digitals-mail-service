import type { ReactNode } from "react";

import { SessionProvider } from "@/components/session-provider";
import { WorkspaceShell } from "@/components/shell/workspace-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </SessionProvider>
  );
}
