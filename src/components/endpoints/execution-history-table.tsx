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
import { CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExecutionHistoryTableProps {
  checks: MonitorCheck[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function ExecutionHistoryTable({
  checks,
  onRefresh,
  isLoading = false,
}: ExecutionHistoryTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Recent Check Execution Logs
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit history of automated ping executions and health assertion results
          </p>
        </div>

        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 gap-1.5 text-xs text-slate-300 hover:text-white"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Logs</span>
          </Button>
        )}
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
                    No execution checks recorded yet.
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
                            {check.responseTimeMs}ms
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
      </div>
    </div>
  );
}
