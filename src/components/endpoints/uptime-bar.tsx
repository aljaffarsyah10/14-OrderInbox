"use client";

import * as React from "react";
import { DayUptimeSummary } from "@/types";
import { cn } from "cn";

interface UptimeBarProps {
  days: DayUptimeSummary[];
  className?: string;
}

export function UptimeBar({ days, className }: UptimeBarProps) {
  const [hoveredDay, setHoveredDay] = React.useState<DayUptimeSummary | null>(null);

  // Calculate overall uptime ratio across all days
  const averageRatio = React.useMemo(() => {
    if (!days || days.length === 0) return "100.00";
    const sum = days.reduce((acc, d) => acc + d.uptimeRatio, 0);
    return (sum / days.length).toFixed(2);
  }, [days]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-tight">
            90-Day Uptime Reliability
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            Last {days.length} Days
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hoveredDay ? (
            <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/25 animate-in fade-in duration-150">
              {hoveredDay.date}:{" "}
              <strong className="text-white">{hoveredDay.uptimeRatio.toFixed(2)}%</strong>
              {hoveredDay.checksFailed > 0 && (
                <span className="text-rose-400 ml-1">
                  ({hoveredDay.checksFailed} failed)
                </span>
              )}
            </span>
          ) : (
            <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
              {averageRatio}% overall SLA
            </span>
          )}
        </div>
      </div>

      {/* Sparkline horizontal bar series */}
      <div className="flex items-end gap-[2px] h-8 w-full overflow-hidden p-1 rounded-lg bg-slate-900/80 border border-slate-800 shadow-inner">
        {days.map((day, idx) => {
          let colorClass = "bg-emerald-500 hover:bg-emerald-400 hover:shadow-[0_0_8px_rgba(16,185,129,0.7)]";
          if (day.status === "DOWN" || day.uptimeRatio < 90) {
            colorClass = "bg-rose-500 hover:bg-rose-400 hover:shadow-[0_0_8px_rgba(244,63,94,0.7)]";
          } else if (day.status === "DEGRADED" || day.uptimeRatio < 100) {
            colorClass = "bg-amber-500 hover:bg-amber-400 hover:shadow-[0_0_8px_rgba(245,158,11,0.7)]";
          } else if (day.status === "PAUSED") {
            colorClass = "bg-slate-600 hover:bg-slate-500";
          }

          return (
            <div
              key={day.date || idx}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={cn(
                "flex-1 h-full rounded-[1.5px] transition-all duration-150 cursor-pointer opacity-85 hover:opacity-100 hover:scale-y-110 origin-bottom",
                colorClass
              )}
              title={`${day.date}: ${day.uptimeRatio.toFixed(2)}%`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
        <span>{days.length} days ago</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" /> 100% Up
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="size-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" /> Degraded
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="size-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]" /> Down
          </span>
        </div>
        <span>Today</span>
      </div>
    </div>
  );
}
