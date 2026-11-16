/**
 * ==============================================================================
 * ISOLATED MOCK SERVICE FOR FRONTEND DEVELOPMENT ONLY
 * Reference: Phase 5 Scope of Work (PRD lines 2468-2672)
 *
 * NOTE: Service facade for telemetry aggregation, latency series, uptime stats,
 * and incident events. Isolated for frontend UI development.
 * ==============================================================================
 */

import { DashboardSummary, LatencyDataPoint, DayUptimeSummary, MonitorCheck, IncidentAlert } from "@/types";
import { endpointMockService } from "@/features/endpoints/mocks/endpoint-mock-service";
import { generateMockLatencySeries, generate90DayUptime, generateMockChecks, initialMockIncidents } from "./mock-monitoring";

class MonitoringMockService {
  private incidents: IncidentAlert[];

  constructor() {
    this.incidents = [...initialMockIncidents];
  }

  public async getDashboardSummary(): Promise<DashboardSummary> {
    const endpoints = await endpointMockService.getAll();
    const total = endpoints.length;
    const up = endpoints.filter((e) => e.status === "UP").length;
    const down = endpoints.filter((e) => e.status === "DOWN").length;
    const paused = endpoints.filter((e) => e.status === "PAUSED").length;
    const active = endpoints.filter((e) => e.isActive).length;

    const latencies = endpoints
      .map((e) => e.currentLatencyMs)
      .filter((l): l is number => typeof l === "number" && l > 0);
    const avgLatency =
      latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : 142;

    const uptimes = endpoints
      .map((e) => e.uptime24h)
      .filter((u): u is number => typeof u === "number");
    const avgUptime =
      uptimes.length > 0
        ? Number((uptimes.reduce((a, b) => a + b, 0) / uptimes.length).toFixed(2))
        : 99.94;

    return {
      totalEndpoints: total,
      activeEndpoints: active,
      upEndpoints: up,
      downEndpoints: down,
      pausedEndpoints: paused,
      avgResponseTimeMs: avgLatency,
      avgUptime24h: avgUptime,
    };
  }

  public async getEndpointLatencySeries(_endpointId?: string, baseLatency = 120): Promise<LatencyDataPoint[]> {
    void _endpointId;
    return generateMockLatencySeries(baseLatency, 24);
  }

  public async getEndpoint90DayUptime(_endpointId?: string): Promise<DayUptimeSummary[]> {
    void _endpointId;
    return generate90DayUptime();
  }

  public async getEndpointChecks(endpointId: string, limit = 15): Promise<MonitorCheck[]> {
    return generateMockChecks(endpointId, limit);
  }

  public async getRecentIncidents(): Promise<IncidentAlert[]> {
    return [...this.incidents];
  }
}

// Global singleton instance for frontend mock consumption
export const monitoringMockService = new MonitoringMockService();
