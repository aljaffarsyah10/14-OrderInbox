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
    if (!days || days.length === 0) return 100;
    const sum = days.reduce((acc, d) => acc + d.uptimeRatio, 0);
    return (sum / days.length).toFixed(2);
  }, [days]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">
          Uptime History (Last {days.length} Days)
        </span>
        <div className="flex items-center gap-2">
          {hoveredDay ? (
            <span className="font-mono text-xs text-indigo-300 animate-in fade-in duration-150">
              {hoveredDay.date}:{" "}
              <strong className="text-white">{hoveredDay.uptimeRatio.toFixed(2)}%</strong>
              {hoveredDay.checksFailed > 0 && (
                <span className="text-amber-400 ml-1">
                  ({hoveredDay.checksFailed} incidents)
                </span>
              )}
            </span>
          ) : (
            <span className="font-mono text-emerald-400 font-semibold">
              {averageRatio}% overall
            </span>
          )}
        </div>
      </div>

      {/* Sparkline horizontal bar series */}
      <div className="flex items-end gap-[2px] h-7 w-full overflow-hidden p-1 rounded-md bg-slate-900/60 border border-slate-800">
        {days.map((day, idx) => {
          let colorClass = "bg-emerald-500 hover:bg-emerald-400";
          if (day.status === "DOWN" || day.uptimeRatio < 90) {
            colorClass = "bg-rose-500 hover:bg-rose-400";
          } else if (day.status === "DEGRADED" || day.uptimeRatio < 100) {
            colorClass = "bg-amber-500 hover:bg-amber-400";
          } else if (day.status === "PAUSED") {
            colorClass = "bg-slate-600 hover:bg-slate-500";
          }

          return (
            <div
              key={day.date || idx}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={cn(
                "flex-1 h-full rounded-[1px] transition-all cursor-pointer opacity-85 hover:opacity-100 hover:scale-y-110 origin-bottom",
                colorClass
              )}
              title={`${day.date}: ${day.uptimeRatio.toFixed(2)}%`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>{days.length} days ago</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500 inline-block" /> 100% Up
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500 inline-block" /> Degraded
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-rose-500 inline-block" /> Down
          </span>
        </div>
        <span>Today</span>
      </div>
    </div>
  );
}
