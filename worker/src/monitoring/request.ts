import { validateTargetUrl, validateRedirectTarget } from "./url-security";

export interface HttpRequestOptions {
  url: string;
  method?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
  body?: string | null;
  maxRedirects?: number;
  maxBodySizeBytes?: number;
}

export interface HttpResponseResult {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  latencyMs: number;
  error?: string;
  finalUrl: string;
  redirectsCount: number;
}

const DEFAULT_TIMEOUT_MS = 10000;
const MAX_TIMEOUT_MS = 30000;
const MAX_REDIRECTS = 3;
const MAX_BODY_SIZE_BYTES = 1024 * 1024; // 1 MB limit

/**
 * Reads a response stream with an enforced maximum byte limit.
 */
async function readResponseBodyWithLimit(
  response: Response,
  maxBytes: number
): Promise<string> {
  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        totalBytes += value.length;
        if (totalBytes > maxBytes) {
          // Truncate and stop reading
          const allowedChunk = value.slice(0, maxBytes - (totalBytes - value.length));
          chunks.push(allowedChunk);
          break;
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }

  const decoder = new TextDecoder("utf-8");
  return chunks.map((c) => decoder.decode(c, { stream: true })).join("") + decoder.decode();
}

/**
 * Executes a monitored HTTP request with:
 * - SSRF protection on initial request and every redirect hop
 * - Monotonic latency measurement (performance.now)
 * - Safe redirect traversal (max 3 hops)
 * - Strict timeout enforcement
 * - Memory protection via max body size limit (1MB)
 */
export async function executeMonitoredRequest(
  options: HttpRequestOptions
): Promise<HttpResponseResult> {
  const timeoutMs = Math.min(
    Math.max(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, 1000),
    MAX_TIMEOUT_MS
  );
  const maxRedirects = options.maxRedirects ?? MAX_REDIRECTS;
  const maxBodySize = options.maxBodySizeBytes ?? MAX_BODY_SIZE_BYTES;

  let currentUrl = options.url;
  let redirectsCount = 0;
  const method = (options.method ?? "GET").toUpperCase();

  // 1. Initial SSRF check
  const initialSecurity = await validateTargetUrl(currentUrl);
  if (!initialSecurity.isValid) {
    return {
      ok: false,
      status: 0,
      statusText: "SSRF_BLOCKED",
      headers: {},
      body: "",
      latencyMs: 0,
      error: initialSecurity.error || "Blocked by SSRF protection",
      finalUrl: currentUrl,
      redirectsCount: 0,
    };
  }

  const startMonotonic = performance.now();

  try {
    while (redirectsCount <= maxRedirects) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const requestHeaders: Record<string, string> = {
        "User-Agent": "OrderInbox-Monitor/1.0 (+https://orderinbox.local)",
        Accept: "*/*",
        ...options.headers,
      };

      const fetchOptions: RequestInit = {
        method: redirectsCount > 0 ? "GET" : method, // redirects to GET as per standard HTTP
        headers: requestHeaders,
        redirect: "manual", // ALWAYS manual to validate each redirect target
        signal: controller.signal,
      };

      if (
        redirectsCount === 0 &&
        options.body &&
        ["POST", "PUT", "PATCH"].includes(method)
      ) {
        fetchOptions.body = options.body;
      }

      let response: Response;
      try {
        response = await fetch(currentUrl, fetchOptions);
      } finally {
        clearTimeout(timer);
      }

      // Check for redirect status codes (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        redirectsCount++;
        if (redirectsCount > maxRedirects) {
          const duration = performance.now() - startMonotonic;
          return {
            ok: false,
            status: response.status,
            statusText: "TOO_MANY_REDIRECTS",
            headers: {},
            body: "",
            latencyMs: Math.round(duration * 100) / 100,
            error: `Exceeded maximum redirect limit of ${maxRedirects} hops`,
            finalUrl: currentUrl,
            redirectsCount,
          };
        }

        const location = response.headers.get("location");
        if (!location) {
          const duration = performance.now() - startMonotonic;
          return {
            ok: false,
            status: response.status,
            statusText: "REDIRECT_LOCATION_MISSING",
            headers: {},
            body: "",
            latencyMs: Math.round(duration * 100) / 100,
            error: "Redirect received without Location header",
            finalUrl: currentUrl,
            redirectsCount,
          };
        }

        // Validate redirect target for SSRF
        const redirectSecurity = await validateRedirectTarget(currentUrl, location);
        if (!redirectSecurity.isValid) {
          const duration = performance.now() - startMonotonic;
          return {
            ok: false,
            status: response.status,
            statusText: "SSRF_REDIRECT_BLOCKED",
            headers: {},
            body: "",
            latencyMs: Math.round(duration * 100) / 100,
            error: `SSRF Blocked Redirect: ${redirectSecurity.error}`,
            finalUrl: location,
            redirectsCount,
          };
        }

        currentUrl = new URL(location, currentUrl).href;
        continue;
      }

      // Read response body with safety limit
      const body = await readResponseBodyWithLimit(response, maxBodySize);
      const endMonotonic = performance.now();
      const latencyMs = Math.round((endMonotonic - startMonotonic) * 100) / 100;

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        responseHeaders[key.toLowerCase()] = val;
      });

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body,
        latencyMs,
        finalUrl: currentUrl,
        redirectsCount,
      };
    }

    const duration = performance.now() - startMonotonic;
    return {
      ok: false,
      status: 0,
      statusText: "UNKNOWN_ERROR",
      headers: {},
      body: "",
      latencyMs: Math.round(duration * 100) / 100,
      error: "Unexpected end of redirect loop",
      finalUrl: currentUrl,
      redirectsCount,
    };
  } catch (err: unknown) {
    const endMonotonic = performance.now();
    const latencyMs = Math.round((endMonotonic - startMonotonic) * 100) / 100;
    const isTimeout =
      err instanceof Error &&
      (err.name === "AbortError" || err.name === "TimeoutError");

    return {
      ok: false,
      status: 0,
      statusText: isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
      headers: {},
      body: "",
      latencyMs,
      error: isTimeout
        ? `Request timed out after ${timeoutMs}ms`
        : err instanceof Error
        ? err.message
        : String(err),
      finalUrl: currentUrl,
      redirectsCount,
    };
  }
}
