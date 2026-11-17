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
    { label: string; bg: string; text: string; dot: string; ping: boolean; pingAnimation?: string }
  > = {
    UP: {
      label: "Operational",
      bg: "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.12)] backdrop-blur-xs",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      ping: true,
      pingAnimation: "animate-ping opacity-60",
    },
    DOWN: {
      label: "Degraded / Down",
      bg: "bg-rose-500/15 border-rose-500/35 shadow-[0_0_10px_rgba(244,63,94,0.18)] backdrop-blur-xs",
      text: "text-rose-300",
      dot: "bg-rose-500",
      ping: true,
      pingAnimation: "animate-ping opacity-75",
    },
    PAUSED: {
      label: "Paused",
      bg: "bg-amber-500/10 border-amber-500/25 backdrop-blur-xs",
      text: "text-amber-300",
      dot: "bg-amber-400",
      ping: false,
    },
    PENDING: {
      label: "Pending Check",
      bg: "bg-slate-500/10 border-slate-500/25 backdrop-blur-xs",
      text: "text-slate-300",
      dot: "bg-slate-400",
      ping: false,
    },
  };

  const current = config[normalizedStatus] || config.PENDING;
  const shouldPulse = pulse !== undefined ? pulse : current.ping;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono tracking-tight transition-all select-none",
        current.bg,
        current.text,
        className
      )}
      {...props}
    >
      {showDot && (
        <span className="relative flex size-2 items-center justify-center">
          {shouldPulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full",
                current.pingAnimation || "animate-ping opacity-75",
                current.dot
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex size-2 rounded-full ring-1 ring-black/20",
              current.dot
            )}
          />
        </span>
      )}
      <span>{normalizedStatus}</span>
    </span>
  );
}
