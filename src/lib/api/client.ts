/**
 * Reusable HTTP API Client for OrderInbox Frontend
 * Provides unified fetch handling, credential forwarding, JSON parsing, and standard error handling.
 */

import type { ApiErrorPayload } from "@/lib/api-response";

export type { ApiErrorPayload };

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, code = "API_ERROR", status = 500, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorPayload;
}


export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL = "") {
    this.baseURL = baseURL;
  }

  private buildUrl(path: string, params?: RequestOptions["params"]): string {
    const fullPath = this.baseURL ? `${this.baseURL}${path}` : path;
    if (!params) return fullPath;

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }

    const query = searchParams.toString();
    if (!query) return fullPath;

    return fullPath.includes("?") ? `${fullPath}&${query}` : `${fullPath}?${query}`;
  }

  public async request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, body, headers: customHeaders, ...customOptions } = options;
    const url = this.buildUrl(path, params);

    const headers = new Headers(customHeaders);
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    let requestBody: BodyInit | undefined;
    if (body !== undefined && body !== null) {
      if (typeof body === "string" || body instanceof FormData || body instanceof Blob) {
        requestBody = body as BodyInit;
      } else {
        headers.set("Content-Type", "application/json");
        requestBody = JSON.stringify(body);
      }
    }

    const fetchConfig: RequestInit = {
      credentials: "include",
      headers,
      body: requestBody,
      ...customOptions,
    };

    let response: Response;
    try {
      response = await fetch(url, fetchConfig);
    } catch (networkError) {
      const msg = networkError instanceof Error ? networkError.message : "Network request failed";
      throw new ApiClientError(msg, "NETWORK_ERROR", 0);
    }

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    let payload: StandardApiResponse<T> | null = null;
    if (isJson) {
      try {
        payload = await response.json();
      } catch {
        // Ignored, will be handled by response.ok check
      }
    }

    if (!response.ok) {
      const errorMessage =
        payload?.error?.message ||
        `HTTP Request failed with status ${response.status} (${response.statusText})`;
      const errorCode = payload?.error?.code || `HTTP_${response.status}`;
      const errorDetails = payload?.error?.details;

      throw new ApiClientError(errorMessage, errorCode, response.status, errorDetails);
    }

    // Standard API response shape check: { success: true, data: T }
    if (payload && typeof payload === "object" && "success" in payload) {
      if (!payload.success) {
        const msg = payload.error?.message || "Operation failed";
        const code = payload.error?.code || "OPERATION_FAILED";
        throw new ApiClientError(msg, code, response.status, payload.error?.details);
      }
      return (payload.data as T) !== undefined ? (payload.data as T) : ((payload as unknown) as T);
    }

    if (payload !== null) {
      return (payload as unknown) as T;
    }

    return (null as unknown) as T;
  }

  public get<T = unknown>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  public post<T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  public put<T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  public patch<T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  public delete<T = unknown>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
