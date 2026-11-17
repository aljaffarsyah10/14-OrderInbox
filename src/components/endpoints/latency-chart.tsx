"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { LatencyDataPoint } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateLatencyStats } from "@/lib/api/monitoring";
import { Clock, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

interface LatencyChartProps {
  data: LatencyDataPoint[];
  className?: string;
  timeRange?: "24h" | "7d" | "30d";
  onTimeRangeChange?: (range: "24h" | "7d" | "30d") => void;
}

export function LatencyChart({
  data,
  className,
  timeRange = "24h",
  onTimeRangeChange,
}: LatencyChartProps) {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const stats = React.useMemo(() => {
    return calculateLatencyStats(data.map((d) => d.latencyMs));
  }, [data]);

  // Determine dynamic health color based on recent check failures or high latency
  const hasRecentFailure = React.useMemo(() => {
    if (!data || data.length === 0) return false;
    // Check if any check failed or returned HTTP 4xx/5xx in the recent sample
    const sample = data.slice(-5);
    return sample.some((d) => d.status === "FAILED" || (d.httpStatus && d.httpStatus >= 400));
  }, [data]);

  const isDegradedLatency = React.useMemo(() => {
    return stats.avg > 800;
  }, [stats.avg]);

  const activeTheme = React.useMemo(() => {
    if (hasRecentFailure) {
      return {
        id: "latencyGradientRose",
        stroke: "#f43f5e", // Rose 500
        activeDot: "#fb7185", // Rose 400
        tagText: "Degraded / Incidents Detected",
        tagClass: "text-rose-400 bg-rose-500/10 border-rose-500/25",
      };
    }
    if (isDegradedLatency) {
      return {
        id: "latencyGradientAmber",
        stroke: "#f59e0b", // Amber 500
        activeDot: "#fbbf24", // Amber 400
        tagText: "Elevated Latency",
        tagClass: "text-amber-400 bg-amber-500/10 border-amber-500/25",
      };
    }
    return {
      id: "latencyGradientEmerald",
      stroke: "#10b981", // Emerald 500
      activeDot: "#34d399", // Emerald 400
      tagText: "Optimal Telemetry",
      tagClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    };
  }, [hasRecentFailure, isDegradedLatency]);

  if (!isMounted) {
    return (
      <div className="h-64 w-full flex items-center justify-center p-6 bg-slate-900/40 rounded-xl border border-border/80">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with time range selector, status tag, and min/max/avg stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Latency & Performance Telemetry
            </h3>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-semibold tracking-wide ${activeTheme.tagClass}`}
            >
              {activeTheme.tagText}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Round-trip HTTP response execution time in milliseconds
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800/80 flex-wrap">
            <span>
              Avg: <strong className="text-slate-100 font-bold">{stats.avg}ms</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Min: <strong className="text-emerald-400 font-bold">{stats.min}ms</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Max: <strong className="text-amber-400 font-bold">{stats.max}ms</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span>
              P95: <strong className="text-indigo-400 font-bold">{stats.p95}ms</strong>
            </span>
          </div>

          {/* Time Range Selector */}
          <div
            className="flex items-center rounded-lg border border-slate-800 bg-slate-900/90 p-0.5 text-xs font-medium"
            role="tablist"
          >
            {(["24h", "7d", "30d"] as const).map((range) => (
              <button
                key={range}
                type="button"
                role="tab"
                aria-selected={timeRange === range}
                aria-label={`Time range ${range}`}
                onClick={() => onTimeRangeChange?.(range)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all duration-150 focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  timeRange === range
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div
        className={`h-72 w-full rounded-xl border border-border/80 bg-slate-950/70 p-4 pt-6 backdrop-blur-xs relative overflow-hidden ${
          className || ""
        }`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <defs>
              {/* Emerald Gradient */}
              <linearGradient id="latencyGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="60%" stopColor="#10b981" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>

              {/* Rose Gradient for Degradation */}
              <linearGradient id="latencyGradientRose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.45} />
                <stop offset="60%" stopColor="#f43f5e" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>

              {/* Amber Gradient for Elevated Latency */}
              <linearGradient id="latencyGradientAmber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              strokeOpacity={0.7}
              vertical={false}
            />

            <XAxis
              dataKey="timeFormatted"
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              unit="ms"
              domain={["dataMin - 10", "dataMax + 25"]}
            />

            {/* Custom Modern Tooltip with Rounded Glass Card */}
            <Tooltip
              cursor={{
                stroke: activeTheme.stroke,
                strokeWidth: 1.5,
                strokeDasharray: "4 4",
                strokeOpacity: 0.6,
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as LatencyDataPoint;
                  const isOk = item.status === "SUCCESS" && item.httpStatus < 400;
                  const formattedDate = item.timestamp
                    ? new Date(item.timestamp).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : item.timeFormatted;

                  return (
                    <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md min-w-[210px] space-y-2.5">
                      {/* Timestamp Header */}
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 border-b border-slate-800/80 pb-1.5">
                        <Clock className="size-3 text-slate-400 shrink-0" />
                        <span>{formattedDate}</span>
                      </div>

                      {/* Latency & Speed Status */}
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold font-mono text-white tabular-nums">
                            {item.latencyMs}
                          </span>
                          <span className="text-xs font-mono text-slate-400">ms</span>
                        </div>

                        {item.latencyMs < 200 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                            <Zap className="size-3" /> Fast
                          </span>
                        ) : item.latencyMs < 600 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-300">
                            Normal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400">
                            <AlertTriangle className="size-3" /> Slow
                          </span>
                        )}
                      </div>

                      {/* Status Code & Health Pill */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
                        <span className="text-[11px] text-slate-400">HTTP Status</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-semibold border ${
                            isOk
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                          }`}
                        >
                          {isOk ? (
                            <CheckCircle2 className="size-3" />
                          ) : (
                            <AlertTriangle className="size-3" />
                          )}
                          HTTP {item.httpStatus || 200}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="latencyMs"
              stroke={activeTheme.stroke}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${activeTheme.id})`}
              activeDot={{
                r: 6,
                fill: activeTheme.activeDot,
                stroke: "#ffffff",
                strokeWidth: 2,
                className: "drop-shadow-md",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
