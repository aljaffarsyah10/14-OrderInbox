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

  if (!isMounted) {
    return (
      <div className="h-64 w-full flex items-center justify-center p-6 bg-slate-900/40 rounded-xl border border-border">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with time range selector and min/max/avg stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            Latency & Performance Telemetry
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Round-trip HTTP response execution time in milliseconds
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mr-2 flex-wrap">
            <span>Avg: <strong className="text-slate-200">{stats.avg}ms</strong></span>
            <span>•</span>
            <span>Min: <strong className="text-emerald-400">{stats.min}ms</strong></span>
            <span>•</span>
            <span>Max: <strong className="text-amber-400">{stats.max}ms</strong></span>
            <span>•</span>
            <span>P95: <strong className="text-indigo-400">{stats.p95}ms</strong></span>
          </div>

          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs font-medium" role="tablist">
            {(["24h", "7d", "30d"] as const).map((range) => (
              <button
                key={range}
                type="button"
                role="tab"
                aria-selected={timeRange === range}
                aria-label={`Time range ${range}`}
                onClick={() => onTimeRangeChange?.(range)}
                className={`px-2.5 py-1 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  timeRange === range
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className={`h-64 w-full rounded-xl border border-border bg-slate-950/60 p-4 pt-6 ${className || ""}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
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
              domain={["dataMin - 10", "dataMax + 20"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as LatencyDataPoint;
                  return (
                    <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-2.5 shadow-xl backdrop-blur-sm">
                      <div className="text-[11px] font-mono text-slate-400">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : item.timeFormatted}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-sm font-bold font-mono text-white">
                          {item.latencyMs} ms
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                          HTTP {item.httpStatus}
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
              stroke="#818cf8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#latencyGradient)"
              activeDot={{
                r: 5,
                fill: "#6366f1",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
