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
  RefreshCw,
  Loader2,
  AlertTriangle,
  X,
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
import { getEndpoint, getEndpointHistory, triggerManualCheck } from "@/lib/api/endpoints";
import { formatLatencySeries, formatUptimeDays } from "@/lib/api/monitoring";
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
  const [historyPagination, setHistoryPagination] = React.useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [historyPage, setHistoryPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCheckingNow, setIsCheckingNow] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
    details?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [timeRange, setTimeRange] = React.useState<"24h" | "7d" | "30d">("24h");

  // Load endpoint overview + 90d uptime
  const loadEndpointOverview = React.useCallback(async () => {
    if (!id) return;
    try {
      const ep = await getEndpoint(id);
      if (ep) {
        setEndpoint(ep);
        const checkLogs: MonitorCheck[] = (ep.checks || []).map((c) => ({
          ...c,
          checkedAt: typeof c.checkedAt === "string" ? c.checkedAt : new Date(c.checkedAt).toISOString(),
        }));
        setUptimeDays(formatUptimeDays(checkLogs, 90));
      } else {
        setEndpoint(null);
      }
    } catch (err: unknown) {
      console.error("[EndpointDetailPage] Overview fetch error:", err);
      const msg = err instanceof Error ? err.message : "Failed to load endpoint details";
      setErrorMessage(msg);
      setEndpoint(null);
    }
  }, [id]);

  // Load paginated history checks according to timeRange and page
  const loadHistoryChecks = React.useCallback(
    async (pageToLoad: number, range: "24h" | "7d" | "30d") => {
      if (!id) return;
      try {
        const historyRes = await getEndpointHistory(id, pageToLoad, 15, range);
        const checkLogs: MonitorCheck[] = (historyRes.checks || []).map((c) => ({
          ...c,
          checkedAt: typeof c.checkedAt === "string" ? c.checkedAt : new Date(c.checkedAt).toISOString(),
        }));
        setChecks(checkLogs);
        setHistoryPagination(historyRes.pagination);
        setLatencyData(formatLatencySeries(checkLogs, 30));
      } catch (err: unknown) {
        console.error("[EndpointDetailPage] History fetch error:", err);
      }
    },
    [id]
  );

  const refreshAllData = React.useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await Promise.all([
        loadEndpointOverview(),
        loadHistoryChecks(historyPage, timeRange),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [id, loadEndpointOverview, loadHistoryChecks, historyPage, timeRange]);

  // Initial load
  React.useEffect(() => {
    if (!id) return;
    let ignore = false;

    async function initialLoad() {
      setIsLoading(true);
      try {
        await Promise.all([
          loadEndpointOverview(),
          loadHistoryChecks(1, timeRange),
        ]);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      ignore = true;
    };
  }, [id, loadEndpointOverview, loadHistoryChecks, timeRange]);

  // Handle time range change: reset to page 1 and fetch
  const handleTimeRangeChange = (newRange: "24h" | "7d" | "30d") => {
    setTimeRange(newRange);
    setHistoryPage(1);
    loadHistoryChecks(1, newRange);
  };

  // Handle history page change
  const handlePageChange = (newPage: number) => {
    setHistoryPage(newPage);
    loadHistoryChecks(newPage, timeRange);
  };

  // Handle on-demand manual check trigger with rich visual feedback
  const handleManualCheck = async () => {
    if (!id) return;
    setIsCheckingNow(true);
    setFeedback(null);

    try {
      const res = await triggerManualCheck(id);
      setFeedback({
        type: "success",
        message: res.message || "Manual check dispatched to monitoring worker.",
        details: "Live execution completed. Telemetry and history records have been updated.",
      });

      // Wait a moment for worker execution, then refresh checks from database
      setTimeout(async () => {
        try {
          await Promise.all([
            loadEndpointOverview(),
            loadHistoryChecks(historyPage, timeRange),
          ]);
        } catch {
          // Silent catch on secondary reload
        }
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to trigger manual check";
      setFeedback({
        type: "error",
        message: msg,
      });
    } finally {
      setIsCheckingNow(false);
      setTimeout(() => {
        setFeedback(null);
      }, 7000);
    }
  };

  if (isLoading && !endpoint) {
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
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="py-12">
        <EmptyState
          title="Endpoint Not Found"
          description={
            errorMessage ||
            `The requested monitor with identifier "${id}" does not exist or you do not have permission to view it.`
          }
          action={
            <Button
              asChild
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
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
            aria-label="Back to endpoints list"
            className="border-border text-slate-400 hover:text-white mt-1 focus-visible:ring-2 focus-visible:ring-indigo-500"
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
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 font-mono flex-wrap">
              <a
                href={endpoint.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${endpoint.url} in new tab`}
                className="hover:text-indigo-400 flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
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
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refreshAllData}
            disabled={isLoading}
            aria-label="Refresh monitor telemetry"
            className="border-border text-slate-300 hover:text-white h-9 gap-1.5 text-xs focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualCheck}
            disabled={isCheckingNow}
            aria-label="Test request now"
            className={`h-9 gap-2 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isCheckingNow
                ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-200 shadow-md shadow-indigo-950/40"
                : "border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/60"
            }`}
          >
            {isCheckingNow ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-indigo-400" />
                <span>Executing Probe...</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-indigo-400/30" />
                <span>Test Request Now</span>
              </>
            )}
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            aria-label="Edit monitor configuration"
            className="border-border text-slate-300 hover:text-white h-9 gap-1.5 text-xs focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Link href={`/dashboard/endpoints/${endpoint.id}/edit`}>
              <Settings className="size-3.5" />
              <span>Edit Monitor</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Manual Check Result Notification Banner */}
      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs font-mono shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-emerald-950/20"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-rose-950/20"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {feedback.type === "success" ? (
              <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-white">{feedback.message}</div>
              {feedback.details && (
                <div className="text-[11px] opacity-80 mt-0.5">{feedback.details}</div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            aria-label="Dismiss feedback"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Current Latency"
          value={
            endpoint.currentLatencyMs !== null && endpoint.currentLatencyMs !== undefined
              ? `${Math.round(endpoint.currentLatencyMs)}ms`
              : "--"
          }
          subValue={
            (endpoint.currentLatencyMs || 0) < 200
              ? "Ultra fast (<200ms)"
              : (endpoint.currentLatencyMs || 0) < 600
              ? "Normal response"
              : "High latency threshold"
          }
          trend={{
            value: (endpoint.currentLatencyMs || 0) < 200 ? "Healthy" : "Elevated",
            isPositive: (endpoint.currentLatencyMs || 0) < 200,
          }}
          icon={Clock}
        />
        <MetricCard
          label="24h Uptime"
          value={
            endpoint.uptime24h !== null && endpoint.uptime24h !== undefined
              ? `${endpoint.uptime24h.toFixed(1)}%`
              : "100.0%"
          }
          subValue="Target SLA: 99.9%"
          trend={{
            value: (endpoint.uptime24h ?? 100) >= 99 ? "Operational" : "Degraded",
            isPositive: (endpoint.uptime24h ?? 100) >= 99,
          }}
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

      {/* Latency History Chart with Dynamic Colors & P95 */}
      <div className="rounded-xl border border-border/80 bg-card/90 p-5 md:p-6 backdrop-blur-xs shadow-lg shadow-black/20">
        <LatencyChart
          data={latencyData}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </div>

      {/* 90-Day Uptime Sparkline Card */}
      <div className="rounded-xl border border-border/80 bg-card/90 p-5 md:p-6 backdrop-blur-xs shadow-lg shadow-black/20">
        <UptimeBar days={uptimeDays} />
      </div>

      {/* Execution Checks Table with Dual Mobile/Desktop Layout */}
      <ExecutionHistoryTable
        checks={checks}
        onRefresh={refreshAllData}
        isLoading={isLoading}
        pagination={historyPagination}
        onPageChange={handlePageChange}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />
    </div>
  );
}
