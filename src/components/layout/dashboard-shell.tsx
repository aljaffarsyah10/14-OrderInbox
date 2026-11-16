"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground antialiased">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex md:w-60 md:shrink-0 md:fixed md:inset-y-0 z-40">
        <React.Suspense
          fallback={
            <div className="w-60 h-full bg-[#0f172a] border-r border-border" />
          }
        >
          <Sidebar className="w-60 h-full" />
        </React.Suspense>
      </div>

      {/* Mobile Drawer */}
      <React.Suspense fallback={null}>
        <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      </React.Suspense>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-60 min-w-0">
        <React.Suspense
          fallback={
            <div className="h-14 w-full border-b border-border bg-[#0b1120]" />
          }
        >
          <Header onMobileMenuOpen={() => setMobileOpen(true)} />
        </React.Suspense>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <React.Suspense
            fallback={
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading dashboard view...
              </div>
            }
          >
            {children}
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}
