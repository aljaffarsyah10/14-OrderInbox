import * as React from "react";
import { cn } from "cn";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

interface MethodBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  method: HttpMethod | string;
}

export function MethodBadge({ method, className, ...props }: MethodBadgeProps) {
  const m = method.toUpperCase() as HttpMethod;

  const colorMap: Record<HttpMethod, string> = {
    GET: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    POST: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PUT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    PATCH: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    DELETE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    HEAD: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  const style = colorMap[m] || "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-mono text-[11px] font-semibold px-2 py-0.5 rounded border tracking-wide",
        style,
        className
      )}
      {...props}
    >
      {m}
    </span>
  );
}
