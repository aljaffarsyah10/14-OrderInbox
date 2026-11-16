"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  Settings,
  PlusCircle,
  Radio,
  LogOut,
  User,
  ShieldCheck,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Endpoints",
    href: "/dashboard/endpoints",
    icon: Activity,
    exact: false,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    exact: false,
  },
];

interface SidebarProps {
  onNavClick?: () => void;
  className?: string;
}

export function Sidebar({ onNavClick, className }: SidebarProps) {
  const pathname = usePathname();

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full w-60 border-r border-border bg-[#0f172a] text-slate-200 select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border/70">
        <Link
          href="/dashboard"
          onClick={onNavClick}
          className="flex items-center gap-2.5 font-semibold text-slate-100 group"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 group-hover:bg-indigo-600/30 transition-colors">
            <Radio className="size-4 animate-pulse" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              OrderInbox
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                PRO
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground font-mono mt-0.5">
              uptime telemetry
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <Button
          asChild
          size="sm"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm font-medium gap-1.5 justify-center h-8"
        >
          <Link href="/dashboard/endpoints/new" onClick={onNavClick}>
            <PlusCircle className="size-3.5" />
            <span>New Monitor</span>
          </Link>
        </Button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Core Platform
        </div>
        {navItems.map((item) => {
          const active = isItemActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/25"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  active ? "text-indigo-400" : "text-slate-400"
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Quick Links
        </div>
        <Link
          href="/"
          onClick={onNavClick}
          className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
        >
          <ShieldCheck className="size-4 text-slate-400" />
          <span className="truncate">Public Landing Page</span>
        </Link>
      </div>

      {/* User Profile / Footer */}
      <div className="p-3 border-t border-border/70 bg-[#0d1424]">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-border/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              <User className="size-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-200 truncate">
                Alex Mercer
              </span>
              <span className="text-[10px] text-muted-foreground truncate font-mono">
                dev@orderinbox.dev
              </span>
            </div>
          </div>
          <Button
            asChild
            variant="ghost"
            size="icon-xs"
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
            title="Sign out"
          >
            <Link href="/login">
              <LogOut className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
