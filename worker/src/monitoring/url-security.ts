import * as dns from "node:dns/promises";
import * as net from "node:net";

export interface UrlSecurityResult {
  isValid: boolean;
  error?: string;
  resolvedIps?: string[];
  parsedUrl?: URL;
}

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

// Disallow dangerous non-web ports commonly used by internal services
const BLOCKED_PORTS = new Set([
  21, // FTP
  22, // SSH
  23, // Telnet
  25, // SMTP
  53, // DNS
  69, // TFTP
  110, // POP3
  135, // RPC
  139, // NetBIOS
  143, // IMAP
  445, // SMB
  5432, // PostgreSQL
  3306, // MySQL
  6379, // Redis
  27017, // MongoDB
  11211, // Memcached
  9200, // Elasticsearch
]);

/**
 * Checks if an IPv4 address is in a private, loopback, or reserved range.
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IPv4 treated as blocked
  }

  const [b0, b1] = parts;

  // 0.0.0.0/8 (Current network)
  if (b0 === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return true;

  // 10.0.0.0/8 (Private Class A)
  if (b0 === 10) return true;

  // 172.16.0.0/12 (Private Class B: 172.16.0.0 - 172.31.255.255)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

  // 192.168.0.0/16 (Private Class C)
  if (b0 === 192 && b1 === 168) return true;

  // 169.254.0.0/16 (Link-local & Cloud Metadata 169.254.169.254)
  if (b0 === 169 && b1 === 254) return true;

  // 100.64.0.0/10 (Carrier-grade NAT: 100.64.0.0 - 100.127.255.255)
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (b0 >= 224) return true;

  return false;
}

/**
 * Checks if an IPv6 address is in a private, loopback, or reserved range.
 */
export function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // Loopback ::1
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;

  // Unspecified ::
  if (normalized === "::" || normalized === "0:0:0:0:0:0:0:0") return true;

  // IPv4-mapped IPv6 (::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (normalized.startsWith("::ffff:")) {
    const v4Part = normalized.slice(7);
    if (net.isIPv4(v4Part)) {
      return isPrivateIPv4(v4Part);
    }
    return true;
  }

  // Unique Local Address fc00::/7 (fc00... or fd00...)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

  // Link-Local fe80::/10 (fe8, fe9, fea, feb)
  if (/^fe[89ab]/i.test(normalized)) return true;

  // IPv6 Documentation prefix 2001:db8::/32
  if (normalized.startsWith("2001:db8:") || normalized.startsWith("2001:0db8:")) return true;

  return false;
}

/**
 * Determines whether an IP address (IPv4 or IPv6) is considered private or dangerous.
 */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    return isPrivateIPv4(ip);
  }
  if (net.isIPv6(ip)) {
    return isPrivateIPv6(ip);
  }
  return true; // Unknown address format is blocked
}

/**
 * Thoroughly validates a target URL against SSRF vulnerabilities:
 * - Protocol check (HTTP/HTTPS only)
 * - Port blacklist check (e.g. databases, SSH, Redis)
 * - DNS resolution of all A/AAAA records
 * - Blacklisting of loopback, private RFC1918, link-local, cloud metadata
 */
export async function validateTargetUrl(rawUrl: string): Promise<UrlSecurityResult> {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return { isValid: false, error: "Invalid URL format" };
  }

  // 1. Protocol whitelist
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return {
      isValid: false,
      error: `Blocked protocol: ${parsed.protocol}. Only http: and https: are permitted.`,
    };
  }

  // 2. Port restrictions
  const port = parsed.port ? parseInt(parsed.port, 10) : parsed.protocol === "https:" ? 443 : 80;
  if (isNaN(port) || port < 1 || port > 65535) {
    return { isValid: false, error: "Invalid port number" };
  }

  if (BLOCKED_PORTS.has(port)) {
    return {
      isValid: false,
      error: `Blocked port: ${port}. Requests to internal service ports are prohibited.`,
    };
  }

  const hostname = parsed.hostname.trim();

  // Disallow localhost string explicitly
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    return {
      isValid: false,
      error: `Access to local/internal domains (${hostname}) is blocked.`,
    };
  }

  // 3. If hostname is directly an IP literal
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      return {
        isValid: false,
        error: `SSRF Blocked: IP address ${hostname} belongs to private or link-local range.`,
      };
    }
    return {
      isValid: true,
      resolvedIps: [hostname],
      parsedUrl: parsed,
    };
  }

  // 4. DNS resolution: resolve ALL IP addresses
  try {
    const lookupResults = await dns.lookup(hostname, { all: true });
    if (!lookupResults || lookupResults.length === 0) {
      return {
        isValid: false,
        error: `Could not resolve hostname: ${hostname}`,
      };
    }

    const resolvedIps = lookupResults.map((r) => r.address);

    for (const ip of resolvedIps) {
      if (isPrivateIp(ip)) {
        return {
          isValid: false,
          error: `SSRF Blocked: Hostname ${hostname} resolved to private/blocked IP ${ip}.`,
          resolvedIps,
        };
      }
    }

    return {
      isValid: true,
      resolvedIps,
      parsedUrl: parsed,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      isValid: false,
      error: `DNS resolution failed for ${hostname}: ${errorMsg}`,
    };
  }
}

/**
 * Validates a redirect target URL during HTTP checks to ensure it does not redirect
 * to internal/private services or malicious protocols.
 */
export async function validateRedirectTarget(
  currentUrl: string,
  redirectLocation: string
): Promise<UrlSecurityResult> {
  try {
    const target = new URL(redirectLocation, currentUrl);
    return await validateTargetUrl(target.href);
  } catch {
    return {
      isValid: false,
      error: `Malformed redirect location: ${redirectLocation}`,
    };
  }
}
