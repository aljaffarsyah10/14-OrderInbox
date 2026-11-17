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

/**
 * Fetch list of all endpoints belonging to the authenticated user
 */
export async function getEndpoints(): Promise<Endpoint[]> {
  return apiClient.get<Endpoint[]>("/api/endpoints");
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
  limit = 20
): Promise<EndpointHistoryResponse> {
  return apiClient.get<EndpointHistoryResponse>(
    `/api/endpoints/${encodeURIComponent(id)}/history`,
    { params: { page, limit } }
  );
}
