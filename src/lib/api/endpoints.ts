/**
 * Endpoints API Client for OrderInbox
 * Interacts with /api/endpoints and associated nested resource routes.
 */

import { apiClient } from "./client";
import {
  Endpoint,
  CreateEndpointPayload,
  UpdateEndpointPayload,
  MonitorCheck,
} from "@/types";

export interface EndpointWithChecks extends Endpoint {
  checks: MonitorCheck[];
}

export interface EndpointHistoryResponse {
  checks: MonitorCheck[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ManualCheckResponse {
  message: string;
  endpointId: string;
}

export interface DeleteEndpointResponse {
  deleted: boolean;
  id: string;
}

export interface EndpointListParams {
  search?: string;
  status?: string;
  method?: string;
  page?: number;
  limit?: number;
}

export interface EndpointListResponse {
  endpoints: Endpoint[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fetch list of endpoints belonging to the authenticated user with optional search, filters, and pagination
 */
export async function getEndpoints(
  params?: EndpointListParams
): Promise<EndpointListResponse> {
  const queryParams: Record<string, string | number> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.status && params.status !== "ALL") queryParams.status = params.status;
  if (params?.method && params.method !== "ALL") queryParams.method = params.method;
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  const res = await apiClient.get<EndpointListResponse | Endpoint[]>("/api/endpoints", {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  if (Array.isArray(res)) {
    return {
      endpoints: res,
      pagination: {
        page: 1,
        limit: res.length,
        total: res.length,
        totalPages: 1,
      },
    };
  }

  return res;
}

/**
 * Fetch a single endpoint with full configuration and recent checks
 */
export async function getEndpoint(id: string): Promise<EndpointWithChecks> {
  return apiClient.get<EndpointWithChecks>(`/api/endpoints/${encodeURIComponent(id)}`);
}

/**
 * Create a new monitored endpoint and register it to the scheduler queue
 */
export async function createEndpoint(payload: CreateEndpointPayload): Promise<Endpoint> {
  return apiClient.post<Endpoint>("/api/endpoints", payload);
}

/**
 * Update an existing endpoint's configuration and scheduling parameters
 */
export async function updateEndpoint(
  id: string,
  payload: UpdateEndpointPayload
): Promise<Endpoint> {
  return apiClient.patch<Endpoint>(`/api/endpoints/${encodeURIComponent(id)}`, payload);
}

/**
 * Delete an endpoint and remove its repeatable jobs and checks
 */
export async function deleteEndpoint(id: string): Promise<DeleteEndpointResponse> {
  return apiClient.delete<DeleteEndpointResponse>(`/api/endpoints/${encodeURIComponent(id)}`);
}

/**
 * Toggle pause or resume status of an endpoint
 */
export async function togglePauseEndpoint(id: string): Promise<Endpoint> {
  return apiClient.post<Endpoint>(`/api/endpoints/${encodeURIComponent(id)}/pause`);
}

/**
 * Explicitly resume monitoring for an endpoint
 */
export async function resumeEndpoint(id: string): Promise<Endpoint> {
  return apiClient.post<Endpoint>(`/api/endpoints/${encodeURIComponent(id)}/resume`);
}

/**
 * Trigger an on-demand manual check for an endpoint via background queue
 */
export async function triggerManualCheck(id: string): Promise<ManualCheckResponse> {
  return apiClient.post<ManualCheckResponse>(`/api/endpoints/${encodeURIComponent(id)}/check`);
}

/**
 * Retrieve paginated history of checks for an endpoint
 */
export async function getEndpointHistory(
  id: string,
  page = 1,
  limit = 20,
  range?: "24h" | "7d" | "30d" | "all"
): Promise<EndpointHistoryResponse> {
  const params: Record<string, string | number> = { page, limit };
  if (range && range !== "all") {
    params.range = range;
  }
  return apiClient.get<EndpointHistoryResponse>(
    `/api/endpoints/${encodeURIComponent(id)}/history`,
    { params }
  );
}
