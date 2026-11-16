/**
 * ==============================================================================
 * ISOLATED MOCK SERVICE FOR FRONTEND DEVELOPMENT ONLY
 * Reference: Phase 5 Scope of Work (PRD lines 2468-2672)
 *
 * NOTE: Mock monitoring data, latency telemetry generator, 90-day uptime
 * history, and incident feeds. Isolated for client UI prototyping.
 * ==============================================================================
 */

import { LatencyDataPoint, DayUptimeSummary, MonitorCheck, IncidentAlert } from "@/types";

export function generateMockLatencySeries(baseLatency = 135, length = 24): LatencyDataPoint[] {
  const points: LatencyDataPoint[] = [];
  const now = Date.now();
  const stepMs = 3600 * 1000; // 1 hour step

  for (let i = length - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * stepMs).toISOString();
    const hours = new Date(now - i * stepMs).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Add natural latency jitter, with occasional minor spikes
    const jitter = Math.sin(i * 0.7) * 25 + (Math.random() * 20 - 10);
    const isSpike = i === 7 || i === 15;
    const latency = Math.max(35, Math.round(baseLatency + jitter + (isSpike ? 85 : 0)));

    points.push({
      timestamp,
      timeFormatted: hours,
      latencyMs: latency,
      status: "SUCCESS",
      httpStatus: 200,
    });
  }

  return points;
}

export function generate90DayUptime(): DayUptimeSummary[] {
  const days: DayUptimeSummary[] = [];
  const now = new Date();

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];

    // Mostly 100% uptime with 2 degraded days around 12 and 45 days ago
    let uptimeRatio = 100.0;
    let failed = 0;
    let status: "UP" | "DEGRADED" | "DOWN" = "UP";

    if (i === 12) {
      uptimeRatio = 98.4;
      failed = 3;
      status = "DEGRADED";
    } else if (i === 45) {
      uptimeRatio = 97.2;
      failed = 6;
      status = "DEGRADED";
    } else if (i === 70) {
      uptimeRatio = 99.1;
      failed = 1;
      status = "DEGRADED";
    }

    days.push({
      date: dateStr,
      uptimeRatio,
      checksTotal: 1440,
      checksFailed: failed,
      status,
    });
  }

  return days;
}

export const initialMockIncidents: IncidentAlert[] = [
  {
    id: "inc_01",
    endpointId: "ep_inv_04",
    endpointName: "Legacy Inventory Sync API",
    endpointUrl: "https://inventory-internal.storeops.net/sync/delta",
    type: "DOWN",
    reason: "HTTP Timeout: Gateway exceeded 10,000ms threshold",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    httpStatus: 504,
  },
  {
    id: "inc_02",
    endpointId: "ep_chk_01",
    endpointName: "Production Checkout API",
    endpointUrl: "https://api.orderinbox.dev/v1/checkout",
    type: "RECOVERY",
    reason: "Endpoint recovered and is returning HTTP 200 OK with normal latency (142ms)",
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    httpStatus: 200,
  },
];

export function generateMockChecks(endpointId: string, count = 12): MonitorCheck[] {
  const checks: MonitorCheck[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now - i * 60 * 1000).toISOString();
    const isDownEndpoint = endpointId === "ep_inv_04" && i < 4;

    if (isDownEndpoint) {
      checks.push({
        id: `chk_${endpointId}_${i}`,
        endpointId,
        status: "FAILED",
        httpStatus: 504,
        responseTimeMs: 10000,
        errorMessage: "Gateway Timeout (exceeded 10000ms)",
        checkedAt: timestamp,
      });
    } else {
      const latency = Math.floor(Math.random() * 60 + 90);
      checks.push({
        id: `chk_${endpointId}_${i}`,
        endpointId,
        status: "SUCCESS",
        httpStatus: 200,
        responseTimeMs: latency,
        errorMessage: null,
        checkedAt: timestamp,
      });
    }
  }

  return checks;
}
