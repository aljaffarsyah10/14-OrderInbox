"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MethodBadge } from "@/components/endpoints/method-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { IncidentFeed } from "@/components/dashboard/incident-feed";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEndpoints } from "@/lib/api/endpoints";
import { getDashboardStats } from "@/lib/api/dashboard";
import { Endpoint, DashboardSummary, IncidentAlert } from "@/types";

export default function DashboardOverviewPage() {
  const [endpoints, setEndpoints] = React.useState<Endpoint[]>([]);
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [incidents, setIncidents] = React.useState<IncidentAlert[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [epsData, stats] = await Promise.all([
        getEndpoints({ limit: 10 }),
        getDashboardStats(),
      ]);
      setEndpoints(epsData.endpoints);
      setSummary(stats.summary);
      setIncidents(stats.recentIncidents);
    } catch (err: unknown) {
      console.error("[DashboardOverviewPage] Failed to fetch data:", err);
      const msg = err instanceof Error ? err.message : "Failed to load dashboard telemetry";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const [epsData, stats] = await Promise.all([
          getEndpoints({ limit: 10 }),
          getDashboardStats(),
        ]);
        if (!ignore) {
          setEndpoints(epsData.endpoints);
          setSummary(stats.summary);
          setIncidents(stats.recentIncidents);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("[DashboardOverviewPage] Initial load error:", err);
          const msg = err instanceof Error ? err.message : "Failed to load dashboard telemetry";
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, []);

  const recentEndpoints = endpoints.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Dashboard Overview
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Live Telemetry
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time health status and performance telemetry across active monitors
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="h-9 gap-1.5 text-xs text-slate-300 hover:text-white"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1.5 h-9"
          >
            <Link href="/dashboard/endpoints/new">
              <Plus className="size-4" />
              <span>Create Monitor</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            className="text-xs text-rose-300 hover:text-white hover:bg-rose-500/20"
          >
            Retry
          </Button>
        </div>
      )}

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && !summary ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        ) : (
          <>
            <MetricCard
              label="Total Monitored"
              value={summary ? `${summary.totalEndpoints} Monitors` : "0 Monitors"}
              subValue={`${summary?.activeEndpoints ?? 0} actively pinging`}
              trend={{
                value: `${summary?.upEndpoints ?? 0} UP / ${summary?.downEndpoints ?? 0} DOWN`,
                isPositive: (summary?.downEndpoints ?? 0) === 0,
              }}
              icon={Activity}
            />
            <MetricCard
              label="24h Avg. Uptime"
              value={summary ? `${summary.avgUptime24h}%` : "100%"}
              subValue="Target SLA: 99.9%"
              trend={{
                value: (summary?.avgUptime24h ?? 100) >= 99.9 ? "Meeting SLA" : "SLA Degraded",
                isPositive: (summary?.avgUptime24h ?? 100) >= 99.9,
              }}
              icon={CheckCircle2}
            />
            <MetricCard
              label="Avg. Latency"
              value={summary && summary.avgResponseTimeMs > 0 ? `${summary.avgResponseTimeMs}ms` : "--"}
              subValue="Target response (<200ms)"
              trend={{
                value: (summary?.avgResponseTimeMs ?? 0) <= 200 ? "Optimal Latency" : "Elevated Latency",
                isPositive: (summary?.avgResponseTimeMs ?? 0) <= 200,
              }}
              icon={Clock}
            />
            <MetricCard
              label="Active Incidents"
              value={summary ? `${summary.downEndpoints} Critical` : "0 Critical"}
              subValue={(summary?.downEndpoints ?? 0) > 0 ? "Attention required" : "All monitors healthy"}
              trend={{
                value: (summary?.downEndpoints ?? 0) > 0 ? "Incident Active" : "All Systems Green",
                isPositive: (summary?.downEndpoints ?? 0) === 0,
              }}
              icon={AlertTriangle}
            />
          </>
        )}
      </div>

      {/* Incident Feed / Status Banner */}
      <div className="space-y-3">
        <IncidentFeed incidents={incidents} />
      </div>

      {/* Recent Monitored Endpoints Table */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Monitored Endpoints</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status and latency measurements for your active targets
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-indigo-400 hover:text-indigo-300 gap-1.5"
          >
            <Link href="/dashboard/endpoints">
              <span>View All ({endpoints.length})</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {isLoading && endpoints.length === 0 ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : recentEndpoints.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title="No monitors created yet"
              description="Get started by creating your first HTTP monitor target to track uptime and response times."
              action={
                <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  <Link href="/dashboard/endpoints/new">
                    <Plus className="size-4 mr-1.5" />
                    Create First Monitor
                  </Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/70 hover:bg-transparent">
                  <TableHead className="text-xs uppercase font-medium text-slate-400">Endpoint</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-slate-400">Method</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-slate-400">Status</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-slate-400">Latency</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-slate-400">24h Uptime</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-slate-400 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEndpoints.map((ep) => (
                  <TableRow
                    key={ep.id}
                    className="border-border/50 hover:bg-slate-800/40 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-100 max-w-[240px]">
                      <div className="flex flex-col min-w-0">
                        <Link
                          href={`/dashboard/endpoints/${ep.id}`}
                          className="hover:text-indigo-400 truncate transition-colors text-sm font-semibold"
                        >
                          {ep.name}
                        </Link>
                        <span className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                          {ep.url}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <MethodBadge method={ep.method} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ep.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {ep.currentLatencyMs !== null && ep.currentLatencyMs !== undefined ? (
                        <span
                          className={
                            ep.currentLatencyMs < 200
                              ? "text-emerald-400"
                              : ep.currentLatencyMs < 500
                              ? "text-amber-400"
                              : "text-rose-400"
                          }
                        >
                          {Math.round(ep.currentLatencyMs)}ms
                        </span>
                      ) : (
                        <span className="text-slate-500">--</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      {ep.uptime24h !== undefined ? `${ep.uptime24h}%` : "100%"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon-xs"
                        className="text-slate-400 hover:text-white"
                        title="View details"
                      >
                        <Link href={`/dashboard/endpoints/${ep.id}`}>
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
