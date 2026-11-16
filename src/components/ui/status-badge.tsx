import * as React from "react";
import { cn } from "cn";

export type StatusType = "UP" | "DOWN" | "PAUSED" | "PENDING";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType | string;
  showDot?: boolean;
  pulse?: boolean;
}

export function StatusBadge({
  status,
  showDot = true,
  pulse,
  className,
  ...props
}: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase() as StatusType;

  const config: Record<
    StatusType,
    { label: string; bg: string; text: string; dot: string; ping: boolean }
  > = {
    UP: {
      label: "Operational",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      ping: false,
    },
    DOWN: {
      label: "Degraded / Down",
      bg: "bg-rose-500/10 border-rose-500/20",
      text: "text-rose-400",
      dot: "bg-rose-500",
      ping: true,
    },
    PAUSED: {
      label: "Paused",
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-400",
      dot: "bg-amber-400",
      ping: false,
    },
    PENDING: {
      label: "Pending Check",
      bg: "bg-slate-500/10 border-slate-500/20",
      text: "text-slate-400",
      dot: "bg-slate-400",
      ping: false,
    },
  };

  const current = config[normalizedStatus] || config.PENDING;
  const shouldPulse = pulse ?? current.ping;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono tracking-tight transition-colors",
        current.bg,
        current.text,
        className
      )}
      {...props}
    >
      {showDot && (
        <span className="relative flex size-2">
          {shouldPulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                current.dot
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex size-2 rounded-full",
              current.dot
            )}
          />
        </span>
      )}
      <span>{normalizedStatus}</span>
    </span>
  );
}
