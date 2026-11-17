/**
 * Monitoring Telemetry Utilities for OrderInbox Frontend
 * Formats real database check records into chart series and day-by-day uptime summaries.
 */

import { MonitorCheck, LatencyDataPoint, DayUptimeSummary } from "@/types";

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
