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
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MethodBadge } from "@/components/endpoints/method-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getEndpoints, togglePauseEndpoint, deleteEndpoint } from "@/lib/api/endpoints";
import { Endpoint } from "@/types";

export default function EndpointsListPage() {
  const router = useRouter();
  const [endpoints, setEndpoints] = React.useState<Endpoint[]>([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  // Safe Delete Dialog State
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Filter & Search States
  const [search, setSearch] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
  const [selectedMethod, setSelectedMethod] = React.useState<string>("ALL");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8;

  const fetchEndpointsList = React.useCallback(
    async (page: number, query: string, status: string, method: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getEndpoints({
          page,
          limit: itemsPerPage,
          search: query.trim() || undefined,
          status: status !== "ALL" ? status : undefined,
          method: method !== "ALL" ? method : undefined,
        });
        setEndpoints(res.endpoints);
        setPagination(res.pagination);
      } catch (err: unknown) {
        console.error("[EndpointsListPage] Fetch failed:", err);
        const msg = err instanceof Error ? err.message : "Failed to load endpoints";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage]
  );

  // Debounce search query & react to filter/page changes
  React.useEffect(() => {
    const handler = setTimeout(() => {
      fetchEndpointsList(currentPage, search, selectedStatus, selectedMethod);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [fetchEndpointsList, currentPage, search, selectedStatus, selectedMethod]);

  const refreshEndpoints = React.useCallback(async () => {
    await fetchEndpointsList(currentPage, search, selectedStatus, selectedMethod);
  }, [fetchEndpointsList, currentPage, search, selectedStatus, selectedMethod]);

  // Actions
  const handleTogglePause = async (id: string) => {
    try {
      const updated = await togglePauseEndpoint(id);
      setActionMessage(
        updated.isActive
          ? `Monitor resumed: ${updated.name}`
          : `Monitor paused: ${updated.name}`
      );
      setTimeout(() => setActionMessage(null), 4000);
      await refreshEndpoints();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update pause status";
      alert(msg);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEndpoint(deleteTarget.id);
      setActionMessage(`Monitor "${deleteTarget.name}" successfully deleted.`);
      setTimeout(() => setActionMessage(null), 4000);
      setDeleteTarget(null);
      await refreshEndpoints();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete monitor";
      alert(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(search || selectedStatus !== "ALL" || selectedMethod !== "ALL");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Monitored Endpoints
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 font-semibold">
              {pagination.total} Total Targets
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage, configure, and inspect all automated HTTP monitoring targets
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refreshEndpoints}
            disabled={isLoading}
            aria-label="Refresh endpoints list"
            className="h-9 gap-1.5 text-xs text-slate-300 hover:text-white border-border/80 focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1.5 h-9 shadow-md shadow-indigo-950/30 focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Link href="/dashboard/endpoints/new">
              <Plus className="size-4" />
              <span>Create Endpoint</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionMessage && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-sm animate-in fade-in duration-200"
        >
          <span>{actionMessage}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-emerald-400 hover:text-white text-xs underline focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshEndpoints}
            className="text-xs text-rose-300 hover:text-white hover:bg-rose-500/20"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 p-3 rounded-xl border border-border/80 bg-card/90 backdrop-blur-xs">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search endpoint by name or target URL..."
            aria-label="Search endpoint by name or URL"
            className="pl-9 bg-[#0b1120] border-slate-700/80 h-9 text-xs placeholder:text-slate-400 font-mono focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="inline-flex rounded-lg border border-slate-700/80 bg-[#0b1120] p-1 text-xs" role="tablist">
            {["ALL", "UP", "DOWN", "PAUSED"].map((st) => (
              <button
                key={st}
                type="button"
                role="tab"
                aria-selected={selectedStatus === st}
                onClick={() => {
                  setSelectedStatus(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded font-mono text-[11px] font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  selectedStatus === st
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
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
              aria-label="Filter by HTTP method"
              className="h-8 rounded-lg border border-slate-700/80 bg-[#0b1120] px-2.5 text-xs font-mono text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
      <div className="rounded-xl border border-border/80 bg-card/90 overflow-hidden backdrop-blur-xs">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        ) : endpoints.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={hasActiveFilters ? "No Matching Endpoints Found" : "No Endpoints Found"}
              description={
                hasActiveFilters
                  ? "No monitored targets match your current search and filter parameters."
                  : "You haven't configured any monitoring endpoints yet."
              }
              action={
                hasActiveFilters ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setSelectedStatus("ALL");
                      setSelectedMethod("ALL");
                      setCurrentPage(1);
                    }}
                    className="border-slate-700 text-slate-300 text-xs focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <Link href="/dashboard/endpoints/new">Create First Monitor</Link>
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-900/80">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-[120px] text-xs font-semibold text-slate-400 uppercase font-mono">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono">
                      Endpoint Name &amp; URL
                    </TableHead>
                    <TableHead className="w-[95px] text-xs font-semibold text-slate-400 uppercase font-mono">
                      Method
                    </TableHead>
                    <TableHead className="w-[95px] text-xs font-semibold text-slate-400 uppercase font-mono">
                      Interval
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                      Current Latency
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                      24h Uptime
                    </TableHead>
                    <TableHead className="w-[90px] text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoints.map((ep) => (
                    <TableRow
                      key={ep.id}
                      className="border-border/60 hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (!target.closest("[data-no-navigate]")) {
                          router.push(`/dashboard/endpoints/${ep.id}`);
                        }
                      }}
                    >
                      <TableCell>
                        <StatusBadge status={ep.status} />
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            href={`/dashboard/endpoints/${ep.id}`}
                            className="font-semibold text-sm text-white group-hover:text-indigo-400 transition-colors inline-block focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                          >
                            {ep.name}
                          </Link>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                            <span className="truncate max-w-[280px] sm:max-w-[400px]">
                              {ep.url}
                            </span>
                            <a
                              href={ep.url}
                              target="_blank"
                              rel="noreferrer"
                              data-no-navigate
                              aria-label={`Open external URL ${ep.url}`}
                              className="text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                            >
                              <ExternalLink className="size-3" />
                            </a>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <MethodBadge method={ep.method} />
                      </TableCell>

                      <TableCell className="font-mono text-xs text-slate-300">
                        {ep.intervalSeconds}s
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs tabular-nums text-slate-200">
                        {ep.currentLatencyMs !== null && ep.currentLatencyMs !== undefined ? (
                          <span
                            className={
                              ep.currentLatencyMs > 1000
                                ? "text-rose-400 font-medium"
                                : ep.currentLatencyMs > 300
                                ? "text-amber-400 font-medium"
                                : "text-emerald-400 font-medium"
                            }
                          >
                            {Math.round(ep.currentLatencyMs)}ms
                          </span>
                        ) : (
                          <span className="text-slate-500">--</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs tabular-nums font-semibold text-slate-200">
                        {ep.uptime24h !== null && ep.uptime24h !== undefined ? (
                          <span
                            className={
                              ep.uptime24h >= 99
                                ? "text-emerald-400"
                                : ep.uptime24h >= 95
                                ? "text-amber-400"
                                : "text-rose-400"
                            }
                          >
                            {ep.uptime24h.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-500">100.0%</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right" data-no-navigate>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleTogglePause(ep.id)}
                            aria-label={ep.isActive ? `Pause monitor ${ep.name}` : `Resume monitor ${ep.name}`}
                            className={`size-7 rounded-lg ${
                              ep.isActive
                                ? "text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
                                : "text-amber-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                            } focus-visible:ring-2 focus-visible:ring-indigo-500`}
                          >
                            {ep.isActive ? (
                              <Pause className="size-3.5" />
                            ) : (
                              <Play className="size-3.5" />
                            )}
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  aria-label={`Actions for ${ep.name}`}
                                  className="size-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                  <MoreVertical className="size-3.5" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end" className="w-44 bg-slate-900 border-border/80 shadow-xl">
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/endpoints/${ep.id}/edit`)}
                                className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white"
                              >
                                <Edit2 className="size-3.5 text-slate-400" />
                                <span>Edit Monitor</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleTogglePause(ep.id)}
                                className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white"
                              >
                                {ep.isActive ? (
                                  <>
                                    <Pause className="size-3.5 text-amber-400" />
                                    <span>Pause Monitor</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="size-3.5 text-emerald-400" />
                                    <span>Resume Monitor</span>
                                  </>
                                )}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="bg-border/60" />

                              <DropdownMenuItem
                                onClick={() => setDeleteTarget({ id: ep.id, name: ep.name })}
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

            {/* Mobile View: Responsive Card List (< 768px) */}
            <div className="md:hidden divide-y divide-border/60">
              {endpoints.map((ep) => (
                <div key={ep.id} className="p-4 space-y-3 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <Link
                        href={`/dashboard/endpoints/${ep.id}`}
                        className="font-bold text-sm text-white hover:text-indigo-400 transition-colors block truncate"
                      >
                        {ep.name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono truncate">
                        <span className="truncate">{ep.url}</span>
                        <a
                          href={ep.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open external URL ${ep.url}`}
                          className="text-slate-400 hover:text-white shrink-0"
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <MethodBadge method={ep.method} />
                      <StatusBadge status={ep.status} />
                    </div>
                  </div>

                  {/* Telemetry Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase">Interval</span>
                      <span className="text-slate-200 font-semibold">{ep.intervalSeconds}s</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase">Latency</span>
                      <span
                        className={`font-semibold ${
                          (ep.currentLatencyMs || 0) > 1000
                            ? "text-rose-400"
                            : (ep.currentLatencyMs || 0) > 300
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {ep.currentLatencyMs !== null && ep.currentLatencyMs !== undefined
                          ? `${Math.round(ep.currentLatencyMs)}ms`
                          : "--"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase">24h Uptime</span>
                      <span
                        className={`font-semibold ${
                          (ep.uptime24h ?? 100) >= 99
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {ep.uptime24h !== null && ep.uptime24h !== undefined
                          ? `${ep.uptime24h.toFixed(1)}%`
                          : "100.0%"}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Actions Bar */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-slate-700/80 text-slate-300 hover:text-white flex-1"
                    >
                      <Link href={`/dashboard/endpoints/${ep.id}`}>
                        <span>View Details</span>
                      </Link>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePause(ep.id)}
                      className="h-8 text-xs border-slate-700/80 text-slate-300 hover:text-white gap-1"
                    >
                      {ep.isActive ? (
                        <>
                          <Pause className="size-3 text-amber-400" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="size-3 text-emerald-400" />
                          <span>Resume</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteTarget({ id: ep.id, name: ep.name })}
                      className="h-8 text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                      aria-label={`Delete ${ep.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Footer */}
        {pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border text-xs text-muted-foreground font-mono gap-3 bg-slate-900/30">
            <span>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, pagination.total)} -{" "}
              {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} endpoints
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-xs"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
                className="size-7 border-slate-700 text-slate-300 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="px-2 text-slate-300">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-xs"
                disabled={currentPage >= pagination.totalPages || isLoading}
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                aria-label="Next page"
                className="size-7 border-slate-700 text-slate-300 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Aesthetic & Safe Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Monitor Target"
        description={
          <span>
            Are you sure you want to permanently delete monitor{" "}
            <strong className="text-white font-mono">{deleteTarget?.name}</strong>? All historical
            telemetry, 90-day uptime logs, and alert rules will be permanently erased. This action
            cannot be undone.
          </span>
        }
        confirmLabel="Delete Monitor"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
