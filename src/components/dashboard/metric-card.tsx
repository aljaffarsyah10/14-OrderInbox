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
        "p-5 bg-card border border-border/80 hover:border-slate-700 transition-colors shadow-none",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className="flex size-7 items-center justify-center rounded-md bg-secondary/80 text-muted-foreground">
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
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium font-mono",
                trend.isNeutral
                  ? "text-muted-foreground"
                  : trend.isPositive
                  ? "text-emerald-400"
                  : "text-rose-400"
              )}
            >
              {trend.value}
            </span>
          )}
          {subValue && (
            <span className="text-muted-foreground truncate">{subValue}</span>
          )}
        </div>
      )}
    </Card>
  );
}
