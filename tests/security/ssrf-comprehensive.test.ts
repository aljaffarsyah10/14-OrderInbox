import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isPrivateIPv4,
  isPrivateIPv6,
  isPrivateIp,
  validateTargetUrl,
  validateRedirectTarget,
} from "../../worker/src/monitoring/url-security";

describe("Comprehensive SSRF Protection & Network Security Test Suite", () => {
  describe("IPv4 Address Space Filtering & Boundary Conditions", () => {
    it("should block all addresses in 127.0.0.0/8 loopback range", () => {
      const loopbacks = [
        "127.0.0.1",
        "127.0.0.2",
        "127.1.2.3",
        "127.0.1.1",
        "127.255.255.254",
        "127.255.255.255",
      ];
      for (const ip of loopbacks) {
        assert.equal(isPrivateIPv4(ip), true, `Expected ${ip} to be blocked as loopback`);
      }
    });

    it("should block 0.0.0.0/8 current network addresses", () => {
      const currentNet = ["0.0.0.0", "0.0.0.1", "0.255.255.255"];
      for (const ip of currentNet) {
        assert.equal(isPrivateIPv4(ip), true, `Expected ${ip} to be blocked as current network`);
      }
    });

    it("should block RFC 1918 Class A: 10.0.0.0/8", () => {
      const classA = [
        "10.0.0.1",
        "10.0.0.254",
        "10.10.10.10",
        "10.255.255.254",
        "10.255.255.255",
      ];
      for (const ip of classA) {
        assert.equal(isPrivateIPv4(ip), true, `Expected ${ip} to be blocked as Class A private`);
      }
    });

    it("should block RFC 1918 Class B: 172.16.0.0/12 and test exact boundaries", () => {
      // 172.15.255.255 is public
      assert.equal(isPrivateIPv4("172.15.255.255"), false, "172.15.x should be public");

      // 172.16.0.0 - 172.31.255.255 are private
      const classB = [
        "172.16.0.1",
        "172.20.5.10",
        "172.31.0.1",
        "172.31.255.254",
        "172.31.255.255",
      ];
      for (const ip of classB) {
        assert.equal(isPrivateIPv4(ip), true, `Expected ${ip} to be blocked as Class B private`);
      }

      // 172.32.0.0 is public
      assert.equal(isPrivateIPv4("172.32.0.1"), false, "172.32.x should be public");
    });

    it("should block RFC 1918 Class C: 192.168.0.0/16", () => {
      const classC = [
        "192.168.0.1",
        "192.168.1.1",
        "192.168.100.50",
        "192.168.255.254",
        "192.168.255.255",
      ];
      for (const ip of classC) {
        assert.equal(isPrivateIPv4(ip), true, `Expected ${ip} to be blocked as Class C private`);
      }
      // Adjacent public addresses
      assert.equal(isPrivateIPv4("192.167.255.255"), false, "192.167.x should be public");
      assert.equal(isPrivateIPv4("192.169.0.1"), false, "192.169.x should be public");
    });

    it("should block Cloud Metadata & Link-Local: 169.254.0.0/16", () => {
      const linkLocal = [
        "169.254.169.254", // AWS/GCP/Azure IMDS
        "169.254.0.1",
        "169.254.1.1",
        "169.254.254.254",
        "169.254.255.255",
      ];
      for (const ip of linkLocal) {
        assert.equal(isPrivateIPv4(ip), true, `Expected ${ip} to be blocked as link-local/cloud metadata`);
      }
      assert.equal(isPrivateIPv4("169.253.255.255"), false, "169.253.x should be public");
      assert.equal(isPrivateIPv4("169.255.0.1"), false, "169.255.x should be public");
    });

    it("should block Carrier-Grade NAT (CGNAT): 100.64.0.0/10", () => {
      assert.equal(isPrivateIPv4("100.63.255.255"), false, "100.63.x should be public");
      assert.equal(isPrivateIPv4("100.64.0.1"), true, "100.64.x should be blocked as CGNAT");
      assert.equal(isPrivateIPv4("100.100.50.25"), true, "100.100.x should be blocked as CGNAT");
      assert.equal(isPrivateIPv4("100.127.255.255"), true, "100.127.x should be blocked as CGNAT");
      assert.equal(isPrivateIPv4("100.128.0.1"), false, "100.128.x should be public");
    });

    it("should block Multicast (224.0.0.0/4) and Class E Reserved (240.0.0.0/4)", () => {
      const reserved = [
        "224.0.0.1",
        "239.255.255.255",
        "240.0.0.1",
        "255.255.255.255",
      ];
      for (const ip of reserved) {
        assert.equal(isPrivateIPv4(ip), true, `Expected ${ip} to be blocked as multicast/reserved`);
      }
    });

    it("should treat malformed IPv4 formats as blocked by default", () => {
      const malformed = [
        "256.0.0.1",
        "1.2.3.256",
        "1.2.3",
        "1.2.3.4.5",
        "1.2.3.a",
        "-1.0.0.1",
        "random-string",
      ];
      for (const ip of malformed) {
        assert.equal(isPrivateIPv4(ip), true, `Expected malformed ${ip} to be blocked`);
      }
    });

    it("should allow verified public IPv4 addresses", () => {
      const publicIps = [
        "8.8.8.8",
        "8.8.4.4",
        "1.1.1.1",
        "1.0.0.1",
        "93.184.216.34",
        "142.250.190.46",
        "104.244.42.1",
      ];
      for (const ip of publicIps) {
        assert.equal(isPrivateIPv4(ip), false, `Expected ${ip} to be recognized as public`);
      }
    });
  });

  describe("IPv6 Address Space Filtering", () => {
    it("should block IPv6 loopback addresses", () => {
      assert.equal(isPrivateIPv6("::1"), true);
      assert.equal(isPrivateIPv6("0:0:0:0:0:0:0:1"), true);
      assert.equal(isPrivateIPv6("0000:0000:0000:0000:0000:0000:0000:0001"), true);
    });

    it("should block IPv6 unspecified address", () => {
      assert.equal(isPrivateIPv6("::"), true);
      assert.equal(isPrivateIPv6("0:0:0:0:0:0:0:0"), true);
    });

    it("should block Unique Local Addresses (fc00::/7)", () => {
      const ula = [
        "fc00::1",
        "fc00:1234:5678::1",
        "fd00::1",
        "fd12:3456:789a:bcde::1",
        "fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
      ];
      for (const ip of ula) {
        assert.equal(isPrivateIPv6(ip), true, `Expected ULA ${ip} to be blocked`);
      }
    });

    it("should block Link-Local Addresses (fe80::/10)", () => {
      const linkLocal = [
        "fe80::1",
        "fe80::dead:beef",
        "fe90::1",
        "fea0::1",
        "feb0::1",
      ];
      for (const ip of linkLocal) {
        assert.equal(isPrivateIPv6(ip), true, `Expected Link-Local ${ip} to be blocked`);
      }
    });

    it("should block IPv4-Mapped IPv6 addresses containing private IPv4 targets", () => {
      const mappedPrivate = [
        "::ffff:127.0.0.1",
        "::ffff:10.0.0.1",
        "::ffff:172.16.0.1",
        "::ffff:192.168.1.1",
        "::ffff:169.254.169.254",
      ];
      for (const ip of mappedPrivate) {
        assert.equal(isPrivateIPv6(ip), true, `Expected IPv4-mapped private ${ip} to be blocked`);
      }
    });

    it("should allow valid public IPv6 addresses", () => {
      const publicIpv6 = [
        "2606:4700:4700::1111", // Cloudflare DNS
        "2001:4860:4860::8888", // Google DNS
        "2620:fe::fe",           // Quad9 DNS
      ];
      for (const ip of publicIpv6) {
        assert.equal(isPrivateIPv6(ip), false, `Expected ${ip} to be recognized as public`);
      }
    });
  });

  describe("Generic isPrivateIp Dispatcher", () => {
    it("should correctly dispatch IPv4 addresses", () => {
      assert.equal(isPrivateIp("127.0.0.1"), true);
      assert.equal(isPrivateIp("10.0.0.1"), true);
      assert.equal(isPrivateIp("8.8.8.8"), false);
      assert.equal(isPrivateIp("1.1.1.1"), false);
    });

    it("should correctly dispatch IPv6 addresses", () => {
      assert.equal(isPrivateIp("::1"), true);
      assert.equal(isPrivateIp("fe80::1"), true);
      assert.equal(isPrivateIp("2606:4700:4700::1111"), false);
    });

    it("should treat unparseable or unknown address formats as private/blocked", () => {
      assert.equal(isPrivateIp("not-an-ip"), true);
      assert.equal(isPrivateIp("999.999.999.999"), true);
      assert.equal(isPrivateIp(""), true);
    });
  });

  describe("URL Scheme Whitelist Enforcement", () => {
    it("should accept valid HTTP and HTTPS URLs", async () => {
      const validHttp = await validateTargetUrl("http://8.8.8.8/health");
      assert.equal(validHttp.isValid, true);

      const validHttps = await validateTargetUrl("https://8.8.8.8/health");
      assert.equal(validHttps.isValid, true);
    });

    it("should reject dangerous and non-web protocols", async () => {
      const dangerousProtocols = [
        "ftp://8.8.8.8/pub",
        "ftps://8.8.8.8/pub",
        "sftp://8.8.8.8/pub",
        "file:///etc/shadow",
        "file:///C:/Windows/win.ini",
        "gopher://8.8.8.8:70/0",
        "dict://8.8.8.8:2628",
        "ldap://8.8.8.8:389",
        "tftp://8.8.8.8:69",
        "ws://8.8.8.8/socket",
        "wss://8.8.8.8/socket",
        "javascript:alert(1)",
        "data:text/html;base64,PHNjcmlwdD4=",
      ];

      for (const rawUrl of dangerousProtocols) {
        const result = await validateTargetUrl(rawUrl);
        assert.equal(
          result.isValid,
          false,
          `Protocol in ${rawUrl} should be rejected`
        );
      }
    });
  });

  describe("Service Port Blacklist Protection", () => {
    const blacklistedPorts = [
      21,    // FTP
      22,    // SSH
      23,    // Telnet
      25,    // SMTP
      53,    // DNS
      69,    // TFTP
      110,   // POP3
      135,   // RPC
      139,   // NetBIOS
      143,   // IMAP
      445,   // SMB
      3306,  // MySQL
      5432,  // PostgreSQL
      6379,  // Redis
      9200,  // Elasticsearch
      11211, // Memcached
      27017, // MongoDB
    ];

    for (const port of blacklistedPorts) {
      it(`should block blacklisted internal service port :${port}`, async () => {
        const result = await validateTargetUrl(`http://8.8.8.8:${port}/api`);
        assert.equal(result.isValid, false);
        assert.match(
          result.error ?? "",
          new RegExp(`Blocked port: ${port}`),
          `Expected port ${port} to be specifically blocked`
        );
      });
    }

    it("should allow standard web ports", async () => {
      const allowedPorts = [80, 443, 8080, 8443, 3000];
      for (const port of allowedPorts) {
        const result = await validateTargetUrl(`http://8.8.8.8:${port}/status`);
        assert.equal(result.isValid, true, `Port ${port} should be permitted`);
      }
    });
  });

  describe("Internal Hostname & Domain Restrictions", () => {
    it("should block localhost and variations", async () => {
      const localDomains = [
        "http://localhost/api",
        "http://localhost:8080/api",
        "http://subdomain.localhost/test",
        "http://cluster.local/metrics",
        "http://db.internal/query",
      ];

      for (const url of localDomains) {
        const result = await validateTargetUrl(url);
        assert.equal(result.isValid, false, `Domain in ${url} should be blocked`);
        assert.match(result.error ?? "", /Access to local\/internal domains/);
      }
    });
  });

  describe("Redirect Validation & Hopping Defense", () => {
    it("should block redirect targets pointing to private loopback IPs", async () => {
      const redirect = await validateRedirectTarget(
        "https://public-service.com/login",
        "http://127.0.0.1:8080/admin"
      );
      assert.equal(redirect.isValid, false);
      assert.match(redirect.error ?? "", /SSRF Blocked/);
    });

    it("should block redirect targets pointing to cloud metadata", async () => {
      const redirect = await validateRedirectTarget(
        "https://public-service.com/oauth/callback",
        "http://169.254.169.254/latest/meta-data/"
      );
      assert.equal(redirect.isValid, false);
      assert.match(redirect.error ?? "", /SSRF Blocked/);
    });

    it("should block redirect targets pointing to internal service ports", async () => {
      const redirect = await validateRedirectTarget(
        "https://public-service.com/redirect",
        "http://8.8.8.8:6379/keys"
      );
      assert.equal(redirect.isValid, false);
      assert.match(redirect.error ?? "", /Blocked port: 6379/);
    });

    it("should block redirect targets using prohibited schemes", async () => {
      const redirect = await validateRedirectTarget(
        "https://public-service.com/checkout",
        "file:///etc/passwd"
      );
      assert.equal(redirect.isValid, false);
      assert.match(redirect.error ?? "", /Blocked protocol: file:/);
    });

    it("should allow safe relative and absolute redirects to public destinations", async () => {
      const relativeRedirect = await validateRedirectTarget(
        "https://8.8.8.8/old-path",
        "/new-path"
      );
      assert.equal(relativeRedirect.isValid, true);
      assert.equal(relativeRedirect.parsedUrl?.href, "https://8.8.8.8/new-path");

      const absoluteRedirect = await validateRedirectTarget(
        "https://8.8.8.8/old-path",
        "https://1.1.1.1/new-path"
      );
      assert.equal(absoluteRedirect.isValid, true);
      assert.equal(absoluteRedirect.parsedUrl?.href, "https://1.1.1.1/new-path");
    });
  });
});
