"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useSession } from "@/components/session-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { findNavItem } from "@/lib/nav";

import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";

function ShellSkeleton() {
  return (
    <div className="flex min-h-dvh">
      <div className="hidden w-[248px] shrink-0 border-r border-sidebar-border bg-sidebar p-5 lg:block">
        <Skeleton className="h-8 w-32" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-full" />
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Skeleton className="h-5 w-24" />
        </div>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-4xl space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-40 w-full" />
          </div>
        </main>
      </div>
      <span className="sr-only">Checking your session…</span>
    </div>
  );
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const pathname = usePathname();

  if (loading || user === null) {
    return <ShellSkeleton />;
  }

  const title = findNavItem(pathname)?.label ?? "Workspace";
  const email = user.email ?? "signed in";

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px]">
        <aside className="hidden w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
          <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-5">
            <span className="grid size-8 place-items-center rounded-md border border-sidebar-border bg-background text-[11px] font-semibold">
              CV
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                CV Digitals
              </p>
              <p className="text-sm font-medium leading-tight">Mail</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-5">
            <SidebarNav />
          </div>

          <div className="border-t border-sidebar-border px-5 py-4 text-xs text-muted-foreground">
            <p className="truncate" title={email}>
              {email}
            </p>
            <p className="mt-1">Local workspace</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} email={email} />
          <main
            id="main"
            className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
