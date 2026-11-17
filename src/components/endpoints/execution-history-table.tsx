"use client";

import * as React from "react";
import { MonitorCheck } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExecutionHistoryTableProps {
  checks: MonitorCheck[];
  onRefresh?: () => void;
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  timeRange?: "24h" | "7d" | "30d";
  onTimeRangeChange?: (range: "24h" | "7d" | "30d") => void;
}

export function ExecutionHistoryTable({
  checks,
  onRefresh,
  isLoading = false,
  pagination,
  onPageChange,
  timeRange,
  onTimeRangeChange,
}: ExecutionHistoryTableProps) {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? checks.length;
  const total = pagination?.total ?? checks.length;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(total / Math.max(1, limit)));

  const from = total > 0 ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            Recent Check Execution Logs
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit history of automated ping executions and health assertion results
          </p>
        </div>

        <div className="flex items-center gap-2">
          {timeRange && onTimeRangeChange && (
            <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs font-medium mr-2" role="tablist">
              {(["24h", "7d", "30d"] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  role="tab"
                  aria-selected={timeRange === range}
                  aria-label={`Filter history by ${range}`}
                  onClick={() => onTimeRangeChange(range)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    timeRange === range
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}

          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Refresh execution logs"
              className="h-8 gap-1.5 text-xs text-slate-300 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Logs</span>
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900/70">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[180px] text-xs font-semibold text-slate-400 uppercase font-mono">
                  Timestamp
                </TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-slate-400 uppercase font-mono">
                  Result
                </TableHead>
                <TableHead className="w-[110px] text-xs font-semibold text-slate-400 uppercase font-mono text-center">
                  HTTP Code
                </TableHead>
                <TableHead className="w-[120px] text-xs font-semibold text-slate-400 uppercase font-mono text-right">
                  Response Time
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-400 uppercase font-mono">
                  Execution Detail / Reason
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-400 text-sm">
                    No execution checks recorded for this period.
                  </TableCell>
                </TableRow>
              ) : (
                checks.map((check) => {
                  const isSuccess = check.status === "SUCCESS";
                  return (
                    <TableRow
                      key={check.id}
                      className="border-border hover:bg-slate-800/40 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-slate-300 whitespace-nowrap">
                        {new Date(check.checkedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={isSuccess ? "UP" : "DOWN"} />
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs">
                        {check.httpStatus ? (
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                              check.httpStatus >= 200 && check.httpStatus < 300
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {check.httpStatus}
                          </span>
                        ) : (
                          <span className="text-slate-500">---</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums font-medium text-slate-200">
                        {typeof check.responseTimeMs === "number" ? (
                          <span
                            className={
                              check.responseTimeMs > 1500
                                ? "text-amber-400"
                                : check.responseTimeMs > 5000
                                ? "text-rose-400"
                                : "text-emerald-400"
                            }
                          >
                            {Math.round(check.responseTimeMs)}ms
                          </span>
                        ) : (
                          <span className="text-slate-500">--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {isSuccess ? (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                            <span>Assertions passed (200 OK)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-400">
                            <AlertTriangle className="size-3.5 text-rose-500 shrink-0" />
                            <span>{check.errorMessage || "Failed health checks"}</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {total > 0 && onPageChange && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 border-t border-border text-xs text-muted-foreground font-mono gap-3">
            <span>
              Showing {from} - {to} of {total} checks
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-xs"
                disabled={page <= 1 || isLoading}
                onClick={() => onPageChange(Math.max(1, page - 1))}
                aria-label="Previous history page"
                className="size-7 border-slate-700 text-slate-300 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-xs"
                disabled={page >= totalPages || isLoading}
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                aria-label="Next history page"
                className="size-7 border-slate-700 text-slate-300 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-indigo-500"
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
