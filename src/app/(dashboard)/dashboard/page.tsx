import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface MockEndpoint {
  id: string;
  name: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  status: "UP" | "DOWN" | "PAUSED";
  latency: number;
  uptime24h: number;
  lastChecked: string;
}

const mockRecentEndpoints: MockEndpoint[] = [
  {
    id: "ep_chk_01",
    name: "Checkout API Service",
    url: "https://api.mystore.com/v1/checkout",
    method: "POST",
    status: "UP",
    latency: 185,
    uptime24h: 99.98,
    lastChecked: "12s ago",
  },
  {
    id: "ep_auth_02",
    name: "User Auth Gateway",
    url: "https://auth.mystore.com/oauth/token",
    method: "GET",
    status: "UP",
    latency: 88,
    uptime24h: 100.0,
    lastChecked: "24s ago",
  },
  {
    id: "ep_strp_03",
    name: "Stripe Webhook Relay",
    url: "https://hook.mystore.com/inbound/stripe",
    method: "POST",
    status: "UP",
    latency: 240,
    uptime24h: 99.95,
    lastChecked: "45s ago",
  },
  {
    id: "ep_inv_04",
    name: "Inventory Sync Cron",
    url: "https://inv.mystore.com/v2/delta-sync",
    method: "PUT",
    status: "UP",
    latency: 510,
    uptime24h: 99.82,
    lastChecked: "1m ago",
  },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time health status and performance telemetry across active monitors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1.5 h-9"
          >
            <Link href="/dashboard/endpoints/new">
              <Plus className="size-4" />
              <span>Create Monitor</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Monitored"
          value="14 Active"
          subValue="+2 added this week"
          trend={{ value: "↑ 2 monitors", isPositive: true }}
          icon={Activity}
        />
        <MetricCard
          label="24h Avg. Uptime"
          value="99.94%"
          subValue="target SLA 99.9%"
          trend={{ value: "↑ 0.02%", isPositive: true }}
          icon={CheckCircle2}
        />
        <MetricCard
          label="Avg. Latency"
          value="142ms"
          subValue="fast (<200ms)"
          trend={{ value: "↓ 12ms faster", isPositive: true }}
          icon={Clock}
        />
        <MetricCard
          label="Active Incidents"
          value="0 Open"
          subValue="All targets healthy"
          trend={{ value: "All Clear", isNeutral: true }}
          icon={TrendingUp}
        />
      </div>

      {/* All Systems Green Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-200">
              All monitored endpoints are operating normally
            </h4>
            <p className="text-xs text-emerald-400/80">
              No failed assertions, HTTP timeouts, or DNS anomalies detected in the past 24 hours.
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-xs font-mono text-emerald-400">
          Global SLA: 99.98%
        </div>
      </div>

      {/* Recently Monitored Endpoints */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 md:px-6 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-white">
              Recently Monitored Endpoints
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live checks running on automated sub-minute intervals
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
          >
            <Link href="/dashboard/endpoints" className="flex items-center gap-1">
              <span>View All Endpoints</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900/60">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[100px] text-xs font-semibold text-slate-400 uppercase font-mono">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono">
                  Target Endpoint
                </TableHead>
                <TableHead className="w-[90px] text-xs font-semibold text-slate-400 uppercase font-mono">
                  Method
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                  Latency
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                  24h Uptime
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                  Last Check
                </TableHead>
                <TableHead className="w-[80px] text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRecentEndpoints.map((ep) => (
                <TableRow
                  key={ep.id}
                  className="border-border hover:bg-slate-800/40 transition-colors"
                >
                  <TableCell>
                    <StatusBadge status={ep.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/dashboard/endpoints/${ep.id}`}
                        className="font-medium text-slate-200 hover:text-indigo-400 transition-colors"
                      >
                        {ep.name}
                      </Link>
                      <span className="text-xs font-mono text-muted-foreground truncate max-w-xs md:max-w-md">
                        {ep.url}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <MethodBadge method={ep.method} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums text-slate-300">
                    {ep.latency}ms
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums text-emerald-400 font-medium">
                    {ep.uptime24h.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono">
                    {ep.lastChecked}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon-xs"
                      className="text-slate-400 hover:text-white"
                      title="Inspect endpoint"
                    >
                      <Link href={`/dashboard/endpoints/${ep.id}`}>
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </Button>
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
