/**
 * Monitoring Telemetry Utilities for OrderInbox Frontend
 * Formats real database check records into chart series and day-by-day uptime summaries.
 */

import { MonitorCheck, LatencyDataPoint, DayUptimeSummary } from "@/types";

export interface LatencyStats {
  min: number;
  max: number;
  avg: number;
  p95: number;
}

/**
 * Calculates Min, Max, Average, and 95th Percentile (P95) latency statistics.
 */
export function calculateLatencyStats(
  latencies: (number | null | undefined)[]
): LatencyStats {
  const valid = latencies.filter(
    (v): v is number => typeof v === "number" && !isNaN(v) && v >= 0
  );

  if (valid.length === 0) {
    return { min: 0, max: 0, avg: 0, p95: 0 };
  }

  const sorted = [...valid].sort((a, b) => a - b);
  const min = Math.round(sorted[0]);
  const max = Math.round(sorted[sorted.length - 1]);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const avg = Math.round(sum / sorted.length);

  // 95th Percentile calculation
  const p95Index = Math.max(
    0,
    Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)
  );
  const p95 = Math.round(sorted[p95Index]);

  return { min, max, avg, p95 };
}

/**
 * Transforms raw MonitorCheck records into chronological LatencyDataPoints for charts.
 */
export function formatLatencySeries(
  checks: MonitorCheck[],
  desiredPoints = 24
): LatencyDataPoint[] {
  if (!checks || checks.length === 0) {
    return [];
  }

  // Real checks from API are sorted desc (newest first). Reverse for chronological chart (oldest to newest).
  const chronological = [...checks].reverse();
  const subset = chronological.slice(-desiredPoints);

  return subset.map((c) => {
    const date = new Date(c.checkedAt);
    const timeFormatted = isNaN(date.getTime())
      ? "--:--"
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return {
      timestamp: c.checkedAt,
      timeFormatted,
      latencyMs: c.responseTimeMs !== null && c.responseTimeMs !== undefined ? Math.round(c.responseTimeMs) : 0,
      status: c.status,
      httpStatus: c.httpStatus ?? 0,
    };
  });
}

/**
 * Computes a 90-day uptime summary series from actual monitor checks.
 */
export function formatUptimeDays(
  checks: MonitorCheck[],
  totalDays = 90
): DayUptimeSummary[] {
  const dayMap = new Map<string, { total: number; failed: number }>();

  // Aggregate checks by YYYY-MM-DD
  for (const c of checks) {
    const dayKey = c.checkedAt.split("T")[0];
    const existing = dayMap.get(dayKey) || { total: 0, failed: 0 };
    existing.total += 1;
    if (c.status === "FAILED") {
      existing.failed += 1;
    }
    dayMap.set(dayKey, existing);
  }

  const results: DayUptimeSummary[] = [];
  const now = new Date();

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const record = dayMap.get(dateStr);
    if (!record || record.total === 0) {
      results.push({
        date: dateStr,
        uptimeRatio: 100,
        checksTotal: 0,
        checksFailed: 0,
        status: "UP",
      });
    } else {
      const ratio = Math.round(((record.total - record.failed) / record.total) * 100 * 10) / 10;
      let status: DayUptimeSummary["status"] = "UP";
      if (ratio === 0) status = "DOWN";
      else if (ratio < 99) status = "DEGRADED";

      results.push({
        date: dateStr,
        uptimeRatio: ratio,
        checksTotal: record.total,
        checksFailed: record.failed,
        status,
      });
    }
  }

  return results;
}
