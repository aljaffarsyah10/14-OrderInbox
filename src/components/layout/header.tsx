"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  ChevronRight,
  Plus,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMobileMenuOpen?: () => void;
}

export function Header({ onMobileMenuOpen }: HeaderProps) {
  const pathname = usePathname();

  // Dynamic breadcrumb generation
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];

    let currentPath = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath += `/${part}`;

      let label = part;
      if (part === "dashboard" && i === 0) {
        label = "Dashboard";
      } else if (part === "endpoints") {
        label = "Endpoints";
      } else if (part === "new") {
        label = "New Monitor";
      } else if (part === "settings") {
        label = "Settings";
      } else if (part.length > 8) {
        // ID preview
        label = `${part.slice(0, 8)}...`;
      }

      crumbs.push({ label, href: currentPath });
    }

    if (crumbs.length === 0) {
      crumbs.push({ label: "Dashboard", href: "/dashboard" });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/70 bg-[#0b1120]/80 backdrop-blur-md px-4 md:px-6">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden text-slate-400 hover:text-slate-100"
          onClick={onMobileMenuOpen}
          aria-label="Open sidebar navigation"
        >
          <Menu className="size-4" />
        </Button>

        {/* Dynamic Breadcrumbs */}
        <nav
          aria-label="Breadcrumbs"
          className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <ChevronRight className="size-3 text-slate-400" />}
                {isLast ? (
                  <span className="font-semibold text-slate-200 capitalize">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-slate-200 transition-colors capitalize"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Quick System Status & Actions */}
      <div className="flex items-center gap-3">
        {/* Global Health Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <CheckCircle2 className="size-3.5 text-emerald-400" />
          <span className="hidden md:inline font-medium">All Systems Operational</span>
          <span className="md:hidden font-medium">Healthy</span>
        </div>

        {/* Quick Add Endpoint */}
        <Button
          asChild
          size="sm"
          className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1 px-2.5"
        >
          <Link href="/dashboard/endpoints/new">
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">New Check</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-7 text-xs border-border/80 text-slate-300 hover:text-white"
        >
          <Link href="/" target="_blank" title="View landing page">
            <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
