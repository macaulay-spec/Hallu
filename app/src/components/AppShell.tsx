import type { ReactNode } from "react";
import { TabBar } from "./TabBar";

export function AppShell({
  title,
  subtitle,
  children,
  hideTabs,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  hideTabs?: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      {title ? (
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 pb-3 pt-5 backdrop-blur">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>
      ) : null}
      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
      {hideTabs ? null : <TabBar />}
    </div>
  );
}
