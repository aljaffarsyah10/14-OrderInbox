"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MethodBadge } from "@/components/endpoints/method-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EndpointItem {
  id: string;
  name: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
  status: "UP" | "DOWN" | "PAUSED" | "PENDING";
  intervalSeconds: number;
  latencyMs: number | null;
  uptime24h: number | null;
  lastChecked: string;
}

const mockEndpoints: EndpointItem[] = [
  {
    id: "ep_prod_01",
    name: "Production Storefront API",
    url: "https://api.store.com/v1/products",
    method: "GET",
    status: "UP",
    intervalSeconds: 60,
    latencyMs: 94,
    uptime24h: 99.98,
    lastChecked: "18s ago",
  },
  {
    id: "ep_strp_02",
    name: "Stripe Webhook Listener",
    url: "https://hook.store.com/inbound/events",
    method: "POST",
    status: "UP",
    intervalSeconds: 60,
    latencyMs: 182,
    uptime24h: 100.0,
    lastChecked: "32s ago",
  },
  {
    id: "ep_sync_03",
    name: "Legacy Inventory Sync Cron",
    url: "https://inv.internal.net/api/v1/batch-sync",
    method: "POST",
    status: "DOWN",
    intervalSeconds: 300,
    latencyMs: null,
    uptime24h: 82.4,
    lastChecked: "2m ago",
  },
  {
    id: "ep_stage_04",
    name: "Experimental Staging Ping",
    url: "https://staging.store.com/healthz",
    method: "HEAD",
    status: "PAUSED",
    intervalSeconds: 120,
    latencyMs: null,
    uptime24h: null,
    lastChecked: "3h ago",
  },
];

export default function EndpointsListPage() {
  const [search, setSearch] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");

  const filtered = mockEndpoints.filter((ep) => {
    const matchesSearch =
      ep.name.toLowerCase().includes(search.toLowerCase()) ||
      ep.url.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      selectedStatus === "ALL" || ep.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Monitored Endpoints
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage, configure, and inspect all automated HTTP monitoring targets
          </p>
        </div>

        <Button
          asChild
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1.5 h-9"
        >
          <Link href="/dashboard/endpoints/new">
            <Plus className="size-4" />
            <span>Create Endpoint</span>
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl border border-border bg-card">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search endpoint by name or target URL..."
            className="pl-9 bg-[#0b1120] border-slate-700 h-9 text-xs placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="inline-flex rounded-lg border border-slate-700 bg-[#0b1120] p-1 text-xs">
            {["ALL", "UP", "DOWN", "PAUSED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded font-mono text-[11px] font-medium transition-colors ${
                  selectedStatus === st
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Endpoints Table Container */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900/60">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[110px] text-xs font-semibold text-slate-400 uppercase font-mono">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono">
                  Endpoint Name &amp; URL
                </TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-slate-400 uppercase font-mono">
                  Method
                </TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-slate-400 uppercase font-mono">
                  Interval
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                  Avg Latency
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                  24h Uptime
                </TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-sm">
                    No monitored endpoints match your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((ep) => (
                  <TableRow
                    key={ep.id}
                    className="border-border hover:bg-slate-800/40 transition-colors"
                  >
                    <TableCell>
                      <StatusBadge status={ep.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/dashboard/endpoints/${ep.id}`}
                          className="font-medium text-slate-200 hover:text-indigo-400 transition-colors flex items-center gap-1.5 group"
                        >
                          <span>{ep.name}</span>
                        </Link>
                        <span className="text-xs font-mono text-muted-foreground truncate max-w-xs md:max-w-md">
                          {ep.url}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <MethodBadge method={ep.method} />
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-300">
                      {ep.intervalSeconds}s
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {ep.latencyMs !== null ? (
                        <span className="text-slate-300">{ep.latencyMs}ms</span>
                      ) : (
                        <span className="text-muted-foreground">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {ep.uptime24h !== null ? (
                        <span
                          className={
                            ep.uptime24h >= 99
                              ? "text-emerald-400 font-medium"
                              : "text-rose-400 font-medium"
                          }
                        >
                          {ep.uptime24h.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon-xs"
                          className="text-slate-400 hover:text-white"
                          title="View Details"
                        >
                          <Link href={`/dashboard/endpoints/${ep.id}`}>
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border text-xs text-muted-foreground font-mono">
          <span>Showing {filtered.length} of {mockEndpoints.length} endpoints</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}
