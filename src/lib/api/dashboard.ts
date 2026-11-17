/**
 * Dashboard API Client for OrderInbox
 * Interacts with /api/dashboard/stats for metrics, status breakdown, and incident logs.
 */

import { apiClient } from "./client";
import { DashboardSummary, IncidentAlert } from "@/types";

interface RawDashboardStatsResponse {
  summary: {
    totalEndpoints: number;
    activeEndpoints: number;
    upEndpoints: number;
    downEndpoints: number;
    pausedEndpoints: number;
    avgResponseTimeMs: number;
    uptimePercentage?: number;
    avgUptime24h?: number;
  };
  recentIncidents: Array<{
    id: string;
    endpointId: string;
    endpointName: string;
    endpointUrl: string;
    type: "DOWN" | "RECOVERY";
    status: string;
    message?: string | null;
    createdAt: string;
    sentAt?: string | null;
  }>;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentIncidents: IncidentAlert[];
}

/**
 * Fetch overview metrics, SLA uptime, and recent incident logs for the dashboard
 */
export async function getDashboardStats(): Promise<DashboardData> {
  const data = await apiClient.get<RawDashboardStatsResponse>("/api/dashboard/stats");

  const summary: DashboardSummary = {
    totalEndpoints: data.summary.totalEndpoints ?? 0,
    activeEndpoints: data.summary.activeEndpoints ?? 0,
    upEndpoints: data.summary.upEndpoints ?? 0,
    downEndpoints: data.summary.downEndpoints ?? 0,
    pausedEndpoints: data.summary.pausedEndpoints ?? 0,
    avgResponseTimeMs: data.summary.avgResponseTimeMs ?? 0,
    avgUptime24h:
      data.summary.uptimePercentage !== undefined
        ? data.summary.uptimePercentage
        : data.summary.avgUptime24h ?? 100,
  };

  const recentIncidents: IncidentAlert[] = (data.recentIncidents || []).map((inc) => ({
    id: inc.id,
    endpointId: inc.endpointId,
    endpointName: inc.endpointName,
    endpointUrl: inc.endpointUrl,
    type: inc.type,
    reason: inc.message || (inc.type === "DOWN" ? "Health check assertions failed" : "Service recovered"),
    timestamp: inc.createdAt,
    httpStatus: null,
  }));

  return {
    summary,
    recentIncidents,
  };
}
