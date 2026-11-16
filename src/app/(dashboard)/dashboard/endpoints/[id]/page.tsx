import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MethodBadge } from "@/components/endpoints/method-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CheckLog {
  timestamp: string;
  status: "UP" | "DOWN";
  statusCode: number;
  latencyMs: number;
  reason: string;
}

const mockExecutionLogs: CheckLog[] = [
  {
    timestamp: "2026-11-17 10:12:00",
    status: "UP",
    statusCode: 200,
    latencyMs: 142,
    reason: "Assertion OK (Found 'status':'ok')",
  },
  {
    timestamp: "2026-11-17 10:11:00",
    status: "UP",
    statusCode: 200,
    latencyMs: 138,
    reason: "Assertion OK (Found 'status':'ok')",
  },
  {
    timestamp: "2026-11-17 10:10:00",
    status: "UP",
    statusCode: 200,
    latencyMs: 145,
    reason: "Assertion OK (Found 'status':'ok')",
  },
  {
    timestamp: "2026-11-17 10:09:00",
    status: "DOWN",
    statusCode: 504,
    latencyMs: 10000,
    reason: "Gateway Timeout (>10000ms)",
  },
  {
    timestamp: "2026-11-17 10:08:00",
    status: "UP",
    statusCode: 200,
    latencyMs: 160,
    reason: "Assertion OK",
  },
];

async function EndpointDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            asChild
            variant="outline"
            size="icon-xs"
            className="border-border text-slate-400 hover:text-white mt-1"
          >
            <Link href="/dashboard/endpoints">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Checkout API Gateway
              </h1>
              <StatusBadge status="UP" />
              <MethodBadge method="POST" />
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>https://api.mystore.com/v1/checkout</span>
              <span>&bull;</span>
              <span className="text-muted-foreground">ID: {id}</span>
              <span>&bull;</span>
              <span className="text-emerald-400">Checked 12s ago</span>
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:text-white gap-1.5 h-8 text-xs"
          >
            <Play className="size-3.5" />
            <span>Test Now</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:text-white gap-1.5 h-8 text-xs"
          >
            <Pause className="size-3.5" />
            <span>Pause Monitor</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Current Latency"
          value="142ms"
          subValue="Optimal (<200ms)"
          trend={{ value: "↓ 4ms faster", isPositive: true }}
          icon={Clock}
        />
        <MetricCard
          label="24h Uptime"
          value="99.98%"
          subValue="1 incident resolved"
          trend={{ value: "99.9% SLA target", isPositive: true }}
          icon={CheckCircle2}
        />
        <MetricCard
          label="Last HTTP Status"
          value="200 OK"
          subValue="Healthy response payload"
          trend={{ value: "Verified", isPositive: true }}
          icon={Activity}
        />
        <MetricCard
          label="SSL Certificate"
          value="82 Days"
          subValue="Let's Encrypt Authority X3"
          trend={{ value: "Valid", isPositive: true }}
          icon={ShieldCheck}
        />
      </div>

      {/* 90-Day Uptime Sparkline */}
      <Card className="p-5 bg-card border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              90-Day Continuous Uptime History
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historical uptime ratio evaluated across all automated hourly checks
            </p>
          </div>
          <span className="text-sm font-bold font-mono text-emerald-400">
            99.98%
          </span>
        </div>

        {/* 90 segments */}
        <div className="grid grid-cols-45 sm:grid-cols-90 gap-1 h-7 pt-2">
          {Array.from({ length: 90 }).map((_, idx) => {
            const isDegraded = idx === 42;
            return (
              <div
                key={idx}
                className={`h-full rounded-xs transition-colors ${
                  isDegraded
                    ? "bg-rose-500 hover:bg-rose-400"
                    : "bg-emerald-500/80 hover:bg-emerald-400"
                }`}
                title={`Day ${90 - idx} ago: ${isDegraded ? "98.2% (1 downtime incident)" : "100.0% operational"}`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>90 days ago</span>
          <span>Today</span>
        </div>
      </Card>

      {/* Execution Logs Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 md:px-6 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-white">
              Recent Check Execution History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Detailed breakdown of recent HTTP requests, latencies, and payload assertions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              Live checks auto-refreshing
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900/60">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[180px] text-xs font-semibold text-slate-400 uppercase font-mono">
                  Timestamp (UTC)
                </TableHead>
                <TableHead className="w-[110px] text-xs font-semibold text-slate-400 uppercase font-mono">
                  Status
                </TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-slate-400 uppercase font-mono">
                  HTTP Code
                </TableHead>
                <TableHead className="w-[110px] text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                  Latency
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono">
                  Reason / Assertion Result
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockExecutionLogs.map((log, idx) => (
                <TableRow
                  key={idx}
                  className="border-border hover:bg-slate-800/40 transition-colors"
                >
                  <TableCell className="font-mono text-xs text-slate-300">
                    {log.timestamp}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={log.status} />
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                        log.statusCode === 200
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {log.statusCode}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums text-slate-300">
                    {log.latencyMs}ms
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-400">
                    {log.reason}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default function EndpointDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground">
          Loading monitor details...
        </div>
      }
    >
      <EndpointDetailContent params={props.params} />
    </React.Suspense>
  );
}
