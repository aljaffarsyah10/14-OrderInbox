import * as React from "react";
import { cn } from "cn";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon?: LucideIcon;
}

export function MetricCard({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "p-5 bg-card/90 backdrop-blur-xs border border-border/80 hover:border-slate-600/80 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-950/20 shadow-sm relative overflow-hidden group",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
          {label}
        </span>
        {Icon && (
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/15 group-hover:scale-105 transition-all">
            <Icon className="size-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold font-mono text-foreground tracking-tight tabular-nums">
          {value}
        </div>
      </div>

      {(trend || subValue) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs flex-wrap">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-semibold font-mono text-[11px] px-1.5 py-0.5 rounded border",
                trend.isNeutral
                  ? "text-muted-foreground bg-slate-800/40 border-slate-700/60"
                  : trend.isPositive
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                  : "text-rose-400 bg-rose-500/10 border-rose-500/25"
              )}
            >
              {trend.value}
            </span>
          )}
          {subValue && (
            <span className="text-muted-foreground truncate text-xs">{subValue}</span>
          )}
        </div>
      )}
    </Card>
  );
}
