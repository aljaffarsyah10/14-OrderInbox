"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Pause,
  Play,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MethodBadge } from "@/components/endpoints/method-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { endpointMockService } from "@/features/endpoints/mocks/endpoint-mock-service";
import { Endpoint } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function EndpointsListPage() {
  const router = useRouter();
  const [endpoints, setEndpoints] = React.useState<Endpoint[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
  const [selectedMethod, setSelectedMethod] = React.useState<string>("ALL");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  const refreshEndpoints = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await endpointMockService.getAll();
      setEndpoints(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    endpointMockService.getAll().then((data) => {
      if (isMounted) {
        setEndpoints(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Actions
  const handleTogglePause = async (id: string) => {
    await endpointMockService.togglePause(id);
    await refreshEndpoints();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this monitor?")) {
      await endpointMockService.delete(id);
      await refreshEndpoints();
    }
  };

  // Filtering
  const filtered = React.useMemo(() => {
    return endpoints.filter((ep) => {
      const matchesSearch =
        ep.name.toLowerCase().includes(search.toLowerCase()) ||
        ep.url.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        selectedStatus === "ALL" || ep.status === selectedStatus;
      const matchesMethod =
        selectedMethod === "ALL" || ep.method === selectedMethod;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [endpoints, search, selectedStatus, selectedMethod]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedEndpoints = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Monitored Endpoints
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
              {endpoints.length} Active Targets
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage, configure, and inspect all automated HTTP monitoring targets
          </p>
        </div>

        <Button
          asChild
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1.5 h-9"
        >
          <Link href="/dashboard/endpoints/new">
            <Plus className="size-4" />
            <span>Create Endpoint</span>
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 p-3 rounded-xl border border-border bg-card">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search endpoint by name or target URL..."
            className="pl-9 bg-[#0b1120] border-slate-700 h-9 text-xs placeholder:text-slate-400 font-mono"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="inline-flex rounded-lg border border-slate-700 bg-[#0b1120] p-1 text-xs">
            {["ALL", "UP", "DOWN", "PAUSED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setSelectedStatus(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded font-mono text-[11px] font-medium transition-colors ${
                  selectedStatus === st
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* HTTP Method Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-slate-400 hidden sm:block" />
            <select
              value={selectedMethod}
              onChange={(e) => {
                setSelectedMethod(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 rounded-lg border border-slate-700 bg-[#0b1120] px-2.5 text-xs font-mono text-slate-300 focus-visible:outline-none focus-visible:border-indigo-500"
            >
              <option value="ALL">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
              <option value="HEAD">HEAD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Endpoints Table Container */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Endpoints Found"
              description={
                search || selectedStatus !== "ALL" || selectedMethod !== "ALL"
                  ? "No monitored targets match your current search and filter parameters."
                  : "You haven't configured any monitoring endpoints yet."
              }
              action={
                search || selectedStatus !== "ALL" || selectedMethod !== "ALL" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setSelectedStatus("ALL");
                      setSelectedMethod("ALL");
                    }}
                    className="border-slate-700 text-slate-300 text-xs"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                    <Link href="/dashboard/endpoints/new">Create First Monitor</Link>
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-900/60">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[110px] text-xs font-semibold text-slate-400 uppercase font-mono">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono">
                    Endpoint Name &amp; URL
                  </TableHead>
                  <TableHead className="w-[90px] text-xs font-semibold text-slate-400 uppercase font-mono">
                    Method
                  </TableHead>
                  <TableHead className="w-[90px] text-xs font-semibold text-slate-400 uppercase font-mono">
                    Interval
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                    Avg Latency
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                    24h Uptime
                  </TableHead>
                  <TableHead className="w-[110px] text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEndpoints.map((ep) => (
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
                          className="font-medium text-slate-200 hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                        >
                          <span>{ep.name}</span>
                        </Link>
                        <span className="text-xs font-mono text-muted-foreground truncate max-w-xs md:max-w-md">
                          {ep.url}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <MethodBadge method={ep.method} />
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-300">
                      {ep.intervalSeconds}s
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {ep.currentLatencyMs !== null && ep.currentLatencyMs !== undefined ? (
                        <span className="text-slate-300">{ep.currentLatencyMs}ms</span>
                      ) : (
                        <span className="text-muted-foreground">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {ep.uptime24h !== null && ep.uptime24h !== undefined ? (
                        <span
                          className={
                            ep.uptime24h >= 99
                              ? "text-emerald-400 font-medium"
                              : "text-rose-400 font-medium"
                          }
                        >
                          {ep.uptime24h.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon-xs"
                          className="text-slate-400 hover:text-white"
                          title="View Details"
                        >
                          <Link href={`/dashboard/endpoints/${ep.id}`}>
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-slate-400 hover:text-white"
                                title="More actions"
                              >
                                <MoreVertical className="size-3.5" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/endpoints/${ep.id}/edit`)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Edit2 className="size-3.5" />
                              <span>Edit Monitor</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleTogglePause(ep.id)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              {ep.status === "PAUSED" ? (
                                <>
                                  <Play className="size-3.5 text-emerald-400" />
                                  <span>Resume Checks</span>
                                </>
                              ) : (
                                <>
                                  <Pause className="size-3.5 text-amber-400" />
                                  <span>Pause Checks</span>
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleDelete(ep.id)}
                              className="flex items-center gap-2 text-rose-400 hover:text-rose-300 cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Delete Monitor</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-border text-xs text-muted-foreground font-mono">
            <span>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)} -{" "}
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} endpoints
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="size-7 border-slate-700 text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-xs"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="size-7 border-slate-700 text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
