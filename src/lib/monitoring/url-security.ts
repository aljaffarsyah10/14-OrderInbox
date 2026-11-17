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
 * Parses an IPv6 address into an array of 8 16-bit word numbers (0 - 0xffff).
 * Handles standard groups, compressed groups (::), and embedded IPv4 suffixes.
 */
export function parseIPv6ToWords(ip: string): number[] | null {
  const cleanIp = ip.trim().toLowerCase();

  let hexPart = cleanIp;
  let embeddedV4Words: number[] = [];

  const lastColonIndex = cleanIp.lastIndexOf(":");
  if (lastColonIndex !== -1) {
    const potentialV4 = cleanIp.slice(lastColonIndex + 1);
    if (net.isIPv4(potentialV4)) {
      const v4Parts = potentialV4.split(".").map(Number);
      embeddedV4Words = [
        (v4Parts[0] << 8) | v4Parts[1],
        (v4Parts[2] << 8) | v4Parts[3],
      ];
      hexPart = cleanIp.slice(0, lastColonIndex);
    }
  }

  const doubleColonParts = hexPart.split("::");
  if (doubleColonParts.length > 2) {
    return null; // Invalid IPv6 with multiple '::'
  }

  const words: number[] = [];

  if (doubleColonParts.length === 2) {
    const [leftStr, rightStr] = doubleColonParts;
    const leftGroups = leftStr ? leftStr.split(":") : [];
    const rightGroups = rightStr ? rightStr.split(":") : [];

    const totalGroupsKnown = leftGroups.length + rightGroups.length + embeddedV4Words.length;
    if (totalGroupsKnown > 8) return null;
    const missingZeros = 8 - totalGroupsKnown;

    for (const g of leftGroups) {
      const val = parseInt(g, 16);
      if (isNaN(val) || val < 0 || val > 0xffff) return null;
      words.push(val);
    }
    for (let i = 0; i < missingZeros; i++) {
      words.push(0);
    }
    for (const g of rightGroups) {
      const val = parseInt(g, 16);
      if (isNaN(val) || val < 0 || val > 0xffff) return null;
      words.push(val);
    }
    words.push(...embeddedV4Words);
  } else {
    const groups = hexPart.split(":");
    if (groups.length + embeddedV4Words.length !== 8) return null;
    for (const g of groups) {
      const val = parseInt(g, 16);
      if (isNaN(val) || val < 0 || val > 0xffff) return null;
      words.push(val);
    }
    words.push(...embeddedV4Words);
  }

  if (words.length !== 8) return null;
  return words;
}

/**
 * Checks if an IPv6 address is in a private, loopback, or reserved range.
 * Decodes all 128 bits to protect against uncompressed or zero-padded bypasses.
 */
export function isPrivateIPv6(ip: string): boolean {
  const words = parseIPv6ToWords(ip);
  if (!words) {
    return true; // Malformed IPv6 treated as blocked by default
  }

  // 1. Loopback ::1
  if (words.slice(0, 7).every((w) => w === 0) && words[7] === 1) {
    return true;
  }

  // 2. Unspecified ::
  if (words.every((w) => w === 0)) {
    return true;
  }

  // 3. IPv4-mapped IPv6 (::ffff:0:0/96 or ::ffff:a.b.c.d)
  if (
    words[0] === 0 &&
    words[1] === 0 &&
    words[2] === 0 &&
    words[3] === 0 &&
    words[4] === 0 &&
    words[5] === 0xffff
  ) {
    const b0 = (words[6] >> 8) & 0xff;
    const b1 = words[6] & 0xff;
    const b2 = (words[7] >> 8) & 0xff;
    const b3 = words[7] & 0xff;
    return isPrivateIPv4(`${b0}.${b1}.${b2}.${b3}`);
  }

  // 4. IPv4-compatible IPv6 (::a.b.c.d - deprecated)
  if (
    words[0] === 0 &&
    words[1] === 0 &&
    words[2] === 0 &&
    words[3] === 0 &&
    words[4] === 0 &&
    words[5] === 0
  ) {
    const b0 = (words[6] >> 8) & 0xff;
    const b1 = words[6] & 0xff;
    const b2 = (words[7] >> 8) & 0xff;
    const b3 = words[7] & 0xff;
    return isPrivateIPv4(`${b0}.${b1}.${b2}.${b3}`);
  }

  // 5. Unique Local Address (ULA) fc00::/7 (fc00... - fdff...)
  if ((words[0] & 0xfe00) === 0xfc00) {
    return true;
  }

  // 6. Link-Local Unicast fe80::/10 (fe80... - febf...)
  if ((words[0] & 0xffc0) === 0xfe80) {
    return true;
  }

  // 7. IPv6 Documentation prefix 2001:db8::/32
  if (words[0] === 0x2001 && words[1] === 0x0db8) {
    return true;
  }

  // 8. Multicast ff00::/8
  if ((words[0] & 0xff00) === 0xff00) {
    return true;
  }

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
