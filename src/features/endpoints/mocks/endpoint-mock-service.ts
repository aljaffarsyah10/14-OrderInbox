/**
 * ==============================================================================
 * ISOLATED MOCK SERVICE FOR FRONTEND DEVELOPMENT ONLY
 * Reference: Phase 5 Scope of Work (PRD lines 2468-2672)
 *
 * NOTE: This mock service simulates CRUD operations in-memory for frontend UI
 * testing and validation. No database or real backend is used.
 * ==============================================================================
 */

import { Endpoint, CreateEndpointPayload, UpdateEndpointPayload } from "@/types";
import { initialMockEndpoints } from "./mock-endpoints";

class EndpointMockService {
  private endpoints: Endpoint[];

  constructor() {
    this.endpoints = [...initialMockEndpoints];
  }

  public async getAll(): Promise<Endpoint[]> {
    // Return cloned list to avoid mutation issues
    return [...this.endpoints];
  }

  public async getById(id: string): Promise<Endpoint | null> {
    const found = this.endpoints.find((ep) => ep.id === id);
    return found ? { ...found } : null;
  }

  public async create(payload: CreateEndpointPayload): Promise<Endpoint> {
    const newId = `ep_usr_${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const newEndpoint: Endpoint = {
      id: newId,
      userId: "usr_mock_alex",
      name: payload.name,
      url: payload.url,
      method: payload.method,
      intervalSeconds: payload.intervalSeconds,
      timeoutMs: payload.timeoutMs,
      expectedStatus: payload.expectedStatus,
      status: "UP",
      isActive: true,
      lastCheckedAt: now,
      createdAt: now,
      updatedAt: now,
      currentLatencyMs: Math.floor(Math.random() * 80 + 70),
      uptime24h: 100.0,
      uptime90d: 100.0,
      configuration: {
        id: `cfg_${Date.now().toString(36)}`,
        endpointId: newId,
        headers: payload.headers,
        body: payload.body,
        headerRules: payload.headerRules,
        bodyRules: payload.bodyRules,
        createdAt: now,
        updatedAt: now,
      },
    };

    this.endpoints.unshift(newEndpoint);
    return newEndpoint;
  }

  public async update(id: string, payload: UpdateEndpointPayload): Promise<Endpoint | null> {
    const index = this.endpoints.findIndex((ep) => ep.id === id);
    if (index === -1) return null;

    const existing = this.endpoints[index];
    const now = new Date().toISOString();

    const updated: Endpoint = {
      ...existing,
      ...payload,
      updatedAt: now,
      configuration: {
        id: existing.configuration?.id || `cfg_${id}`,
        endpointId: id,
        headers: payload.headers ?? existing.configuration?.headers,
        body: payload.body !== undefined ? payload.body : existing.configuration?.body,
        headerRules: payload.headerRules ?? existing.configuration?.headerRules,
        bodyRules: payload.bodyRules ?? existing.configuration?.bodyRules,
        createdAt: existing.configuration?.createdAt || existing.createdAt,
        updatedAt: now,
      },
    };

    this.endpoints[index] = updated;
    return { ...updated };
  }

  public async togglePause(id: string): Promise<Endpoint | null> {
    const ep = this.endpoints.find((e) => e.id === id);
    if (!ep) return null;

    if (ep.status === "PAUSED") {
      ep.status = "UP";
      ep.isActive = true;
    } else {
      ep.status = "PAUSED";
      ep.isActive = false;
    }
    ep.updatedAt = new Date().toISOString();
    return { ...ep };
  }

  public async delete(id: string): Promise<boolean> {
    const initialLen = this.endpoints.length;
    this.endpoints = this.endpoints.filter((ep) => ep.id !== id);
    return this.endpoints.length < initialLen;
  }

  public async triggerManualCheck(id: string): Promise<{ success: boolean; latencyMs: number; status: "UP" | "DOWN"; httpStatus: number }> {
    const ep = this.endpoints.find((e) => e.id === id);
    if (!ep) {
      return { success: false, latencyMs: 0, status: "DOWN", httpStatus: 500 };
    }

    const latency = Math.floor(Math.random() * 120 + 65);
    ep.currentLatencyMs = latency;
    ep.lastCheckedAt = new Date().toISOString();
    return {
      success: true,
      latencyMs: latency,
      status: "UP",
      httpStatus: ep.expectedStatus[0] || 200,
    };
  }
}

// Global singleton instance for frontend mock consumption
export const endpointMockService = new EndpointMockService();
