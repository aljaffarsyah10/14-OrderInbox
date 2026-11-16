"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  Clock,
  Play,
  Settings,
  ShieldCheck,
  Check,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MethodBadge } from "@/components/endpoints/method-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { LatencyChart } from "@/components/endpoints/latency-chart";
import { UptimeBar } from "@/components/endpoints/uptime-bar";
import { ExecutionHistoryTable } from "@/components/endpoints/execution-history-table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { endpointMockService } from "@/features/endpoints/mocks/endpoint-mock-service";
import { monitoringMockService } from "@/features/monitoring/mocks/monitoring-mock-service";
import {
  Endpoint,
  LatencyDataPoint,
  DayUptimeSummary,
  MonitorCheck,
} from "@/types";

export default function EndpointDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [endpoint, setEndpoint] = React.useState<Endpoint | null>(null);
  const [latencyData, setLatencyData] = React.useState<LatencyDataPoint[]>([]);
  const [uptimeDays, setUptimeDays] = React.useState<DayUptimeSummary[]>([]);
  const [checks, setChecks] = React.useState<MonitorCheck[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCheckingNow, setIsCheckingNow] = React.useState(false);
  const [checkResultToast, setCheckResultToast] = React.useState<string | null>(null);
  const [timeRange, setTimeRange] = React.useState<"24h" | "7d" | "30d">("24h");

  const refreshAllData = React.useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const ep = await endpointMockService.getById(id);
      if (ep) {
        setEndpoint(ep);
        const [latency, uptime, checkLogs] = await Promise.all([
          monitoringMockService.getEndpointLatencySeries(id, ep.currentLatencyMs || 140),
          monitoringMockService.getEndpoint90DayUptime(id),
          monitoringMockService.getEndpointChecks(id, 15),
        ]);
        setLatencyData(latency);
        setUptimeDays(uptime);
        setChecks(checkLogs);
      } else {
        setEndpoint(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    if (!id) return;
    let isMounted = true;

    endpointMockService.getById(id).then(async (ep) => {
      if (!isMounted) return;
      if (ep) {
        const [latency, uptime, checkLogs] = await Promise.all([
          monitoringMockService.getEndpointLatencySeries(id, ep.currentLatencyMs || 140),
          monitoringMockService.getEndpoint90DayUptime(id),
          monitoringMockService.getEndpointChecks(id, 15),
        ]);
        if (isMounted) {
          setEndpoint(ep);
          setLatencyData(latency);
          setUptimeDays(uptime);
          setChecks(checkLogs);
          setIsLoading(false);
        }
      } else {
        if (isMounted) {
          setEndpoint(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle on-demand manual check trigger
  const handleManualCheck = async () => {
    if (!id) return;
    setIsCheckingNow(true);
    setCheckResultToast(null);

    try {
      const res = await endpointMockService.triggerManualCheck(id);
      setCheckResultToast(
        `Instant check finished: HTTP ${res.httpStatus} • ${res.latencyMs}ms • Status ${res.status}`
      );
      // Reload updated check logs and latency
      const [ep, updatedChecks] = await Promise.all([
        endpointMockService.getById(id),
        monitoringMockService.getEndpointChecks(id, 15),
      ]);
      if (ep) setEndpoint(ep);
      setChecks(updatedChecks);
    } finally {
      setIsCheckingNow(false);
      setTimeout(() => {
        setCheckResultToast(null);
      }, 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-64 rounded-md" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="py-12">
        <EmptyState
          title="Endpoint Not Found"
          description={`The requested monitor with identifier "${id}" does not exist in the mock telemetry catalog.`}
          action={
            <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
              <Link href="/dashboard/endpoints">Return to Endpoints</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            asChild
            variant="outline"
            size="icon-xs"
            className="border-border text-slate-400 hover:text-white mt-1"
          >
            <Link href="/dashboard/endpoints">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {endpoint.name}
              </h1>
              <StatusBadge status={endpoint.status} />
              <MethodBadge method={endpoint.method} />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono flex-wrap">
              <a
                href={endpoint.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-400 flex items-center gap-1 transition-colors"
              >
                <span>{endpoint.url}</span>
                <ExternalLink className="size-3" />
              </a>
              <span>•</span>
              <span>Interval: {endpoint.intervalSeconds}s</span>
              <span>•</span>
              <span>Timeout: {endpoint.timeoutMs}ms</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualCheck}
            disabled={isCheckingNow}
            className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 h-9 gap-1.5 text-xs font-medium"
          >
            <Play className={`size-3.5 ${isCheckingNow ? "animate-spin" : ""}`} />
            <span>{isCheckingNow ? "Executing Check..." : "Test Now"}</span>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border text-slate-300 hover:text-white h-9 gap-1.5 text-xs"
          >
            <Link href={`/dashboard/endpoints/${endpoint.id}/edit`}>
              <Settings className="size-3.5" />
              <span>Edit Monitor</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Manual Check Result Notification */}
      {checkResultToast && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 flex items-center gap-2.5 text-xs font-mono animate-in fade-in duration-200">
          <Check className="size-4 text-emerald-400 shrink-0" />
          <span>{checkResultToast}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Current Latency"
          value={endpoint.currentLatencyMs ? `${endpoint.currentLatencyMs}ms` : "--"}
          subValue={
            (endpoint.currentLatencyMs || 0) < 200
              ? "Fast (<200ms)"
              : (endpoint.currentLatencyMs || 0) < 1000
              ? "Normal latency"
              : "High latency alert"
          }
          trend={{
            value: (endpoint.currentLatencyMs || 0) < 200 ? "Healthy" : "Elevated",
            isPositive: (endpoint.currentLatencyMs || 0) < 200,
          }}
          icon={Clock}
        />
        <MetricCard
          label="24h Uptime"
          value={endpoint.uptime24h ? `${endpoint.uptime24h.toFixed(2)}%` : "--"}
          subValue="Target SLA: 99.9%"
          trend={{ value: "Operational", isPositive: true }}
          icon={CheckCircle2}
        />
        <MetricCard
          label="Expected Status"
          value={endpoint.expectedStatus.join(", ")}
          subValue={`Timeout: ${endpoint.timeoutMs}ms`}
          trend={{ value: "Strict Validation", isNeutral: true }}
          icon={ShieldCheck}
        />
        <MetricCard
          label="Check Interval"
          value={`Every ${endpoint.intervalSeconds}s`}
          subValue={endpoint.isActive ? "Background worker active" : "Monitor paused"}
          trend={{
            value: endpoint.isActive ? "Active Schedule" : "Paused",
            isPositive: endpoint.isActive,
          }}
          icon={Activity}
        />
      </div>

      {/* Latency History Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <LatencyChart
          data={latencyData}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </div>

      {/* 90-Day Uptime Sparkline Card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <UptimeBar days={uptimeDays} />
      </div>

      {/* Execution Checks Table */}
      <ExecutionHistoryTable
        checks={checks}
        onRefresh={refreshAllData}
        isLoading={isLoading}
      />
    </div>
  );
}
