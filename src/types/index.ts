/**
 * Core Domain & Feature Types for OrderInbox
 * Note: These types represent the domain entities across frontend and mock services.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

export type EndpointStatus = "PENDING" | "UP" | "DOWN" | "PAUSED";

export type CheckResultStatus = "SUCCESS" | "FAILED";

export interface HeaderItem {
  key: string;
  value: string;
}

export interface HeaderRule {
  header: string;
  operator: "CONTAINS" | "EQUALS" | "NOT_CONTAINS";
  value: string;
}

export interface BodyRule {
  type: "JSON_PROPERTY_EQUALS" | "BODY_CONTAINS" | "BODY_REGEX";
  path?: string;
  value: string;
}

export interface EndpointConfiguration {
  id: string;
  endpointId: string;
  headers?: Record<string, string>;
  body?: string | null;
  headerRules?: HeaderRule[];
  bodyRules?: BodyRule[];
  createdAt: string;
  updatedAt: string;
}

export interface Endpoint {
  id: string;
  userId: string;
  name: string;
  url: string;
  method: HttpMethod;
  intervalSeconds: number; // 60..86400
  timeoutMs: number; // 1000..30000
  expectedStatus: number[];
  status: EndpointStatus;
  isActive: boolean;
  lastCheckedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed / Aggregated telemetry fields for UI display
  currentLatencyMs?: number | null;
  uptime24h?: number;
  uptime90d?: number;
  configuration?: EndpointConfiguration;
}

export interface MonitorCheck {
  id: string;
  endpointId: string;
  status: CheckResultStatus;
  httpStatus?: number | null;
  responseTimeMs?: number | null;
  errorMessage?: string | null;
  checkedAt: string;
}

export interface LatencyDataPoint {
  timestamp: string;
  timeFormatted: string;
  latencyMs: number;
  status: CheckResultStatus;
  httpStatus: number;
}

export interface DayUptimeSummary {
  date: string;
  uptimeRatio: number; // 0..100
  checksTotal: number;
  checksFailed: number;
  status: "UP" | "DEGRADED" | "DOWN" | "PAUSED";
}

export interface IncidentAlert {
  id: string;
  endpointId: string;
  endpointName: string;
  endpointUrl: string;
  type: "DOWN" | "RECOVERY";
  reason: string;
  timestamp: string;
  httpStatus?: number | null;
}

export interface DashboardSummary {
  totalEndpoints: number;
  activeEndpoints: number;
  upEndpoints: number;
  downEndpoints: number;
  pausedEndpoints: number;
  avgResponseTimeMs: number;
  avgUptime24h: number;
}

export interface CreateEndpointPayload {
  name: string;
  url: string;
  method: HttpMethod;
  intervalSeconds: number;
  timeoutMs: number;
  expectedStatus: number[];
  headers?: Record<string, string>;
  body?: string;
  headerRules?: HeaderRule[];
  bodyRules?: BodyRule[];
}

export interface UpdateEndpointPayload extends Partial<CreateEndpointPayload> {
  isActive?: boolean;
}
