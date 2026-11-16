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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MethodBadge } from "@/components/endpoints/method-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { IncidentFeed } from "@/components/dashboard/incident-feed";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { endpointMockService } from "@/features/endpoints/mocks/endpoint-mock-service";
import { monitoringMockService } from "@/features/monitoring/mocks/monitoring-mock-service";
import { Endpoint, DashboardSummary, IncidentAlert } from "@/types";

export default function DashboardOverviewPage() {
  const [endpoints, setEndpoints] = React.useState<Endpoint[]>([]);
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [incidents, setIncidents] = React.useState<IncidentAlert[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleRefresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [eps, sum, incs] = await Promise.all([
        endpointMockService.getAll(),
        monitoringMockService.getDashboardSummary(),
        monitoringMockService.getRecentIncidents(),
      ]);
      setEndpoints(eps);
      setSummary(sum);
      setIncidents(incs);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    Promise.all([
      endpointMockService.getAll(),
      monitoringMockService.getDashboardSummary(),
      monitoringMockService.getRecentIncidents(),
    ]).then(([eps, sum, incs]) => {
      if (isMounted) {
        setEndpoints(eps);
        setSummary(sum);
        setIncidents(incs);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
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
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
              Mock Telemetry
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
            onClick={handleRefresh}
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

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Monitored"
          value={summary ? `${summary.totalEndpoints} Monitors` : "--"}
          subValue={`${summary?.activeEndpoints ?? 0} actively pinging`}
          trend={{ value: `${summary?.upEndpoints ?? 0} UP / ${summary?.downEndpoints ?? 0} DOWN`, isPositive: (summary?.downEndpoints ?? 0) === 0 }}
          icon={Activity}
        />
        <MetricCard
          label="24h Avg. Uptime"
          value={summary ? `${summary.avgUptime24h}%` : "--"}
          subValue="Target SLA: 99.9%"
          trend={{ value: "↑ 0.04% vs yesterday", isPositive: true }}
          icon={CheckCircle2}
        />
        <MetricCard
          label="Avg. Latency"
          value={summary ? `${summary.avgResponseTimeMs}ms` : "--"}
          subValue="fast global response (<200ms)"
          trend={{ value: "↓ 12ms optimized", isPositive: true }}
          icon={Clock}
        />
        <MetricCard
          label="Active Incidents"
          value={summary ? `${summary.downEndpoints} Critical` : "--"}
          subValue={(summary?.downEndpoints ?? 0) > 0 ? "Attention required" : "All monitors healthy"}
          trend={{
            value: (summary?.downEndpoints ?? 0) > 0 ? "Incident Active" : "All Systems Green",
            isPositive: (summary?.downEndpoints ?? 0) === 0,
          }}
          icon={AlertTriangle}
        />
      </div>

      {/* Incident Alert Feed Component */}
      <IncidentFeed incidents={incidents} />

      {/* Recently Monitored Endpoints Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 md:px-6 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-white">
              Active Monitored Endpoints
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live checks running on automated sub-minute intervals
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
          >
            <Link href="/dashboard/endpoints" className="flex items-center gap-1">
              <span>View All Endpoints ({endpoints.length})</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900/60">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[100px] text-xs font-semibold text-slate-400 uppercase font-mono">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono">
                  Target Endpoint
                </TableHead>
                <TableHead className="w-[90px] text-xs font-semibold text-slate-400 uppercase font-mono">
                  Method
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                  Latency
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                  24h Uptime
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                  Last Checked
                </TableHead>
                <TableHead className="w-[80px] text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                  Inspect
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEndpoints.map((ep) => (
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
                        className="font-medium text-slate-200 hover:text-indigo-400 transition-colors"
                      >
                        {ep.name}
                      </Link>
                      <span className="text-xs font-mono text-muted-foreground truncate max-w-xs md:max-w-md">
                        {ep.url}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <MethodBadge method={ep.method} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums text-slate-300">
                    {ep.currentLatencyMs ? `${ep.currentLatencyMs}ms` : "--"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums text-emerald-400 font-medium">
                    {ep.uptime24h ? `${ep.uptime24h.toFixed(2)}%` : "--"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono">
                    {ep.lastCheckedAt
                      ? new Date(ep.lastCheckedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon-xs"
                      className="text-slate-400 hover:text-white"
                      title="Inspect endpoint"
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
      </div>
    </div>
  );
}
