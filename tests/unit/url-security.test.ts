import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isPrivateIPv4,
  isPrivateIPv6,
  isPrivateIp,
  validateTargetUrl,
  validateRedirectTarget,
} from "../../worker/src/monitoring/url-security";

describe("SSRF Protection & URL Security", () => {
  describe("isPrivateIPv4", () => {
    it("should identify loopback addresses as private", () => {
      assert.equal(isPrivateIPv4("127.0.0.1"), true);
      assert.equal(isPrivateIPv4("127.255.255.254"), true);
    });

    it("should identify 10.0.0.0/8 private network", () => {
      assert.equal(isPrivateIPv4("10.0.0.1"), true);
      assert.equal(isPrivateIPv4("10.254.254.254"), true);
    });

    it("should identify 172.16.0.0/12 private network", () => {
      assert.equal(isPrivateIPv4("172.16.0.1"), true);
      assert.equal(isPrivateIPv4("172.31.255.255"), true);
      assert.equal(isPrivateIPv4("172.32.0.1"), false); // Public
    });

    it("should identify 192.168.0.0/16 private network", () => {
      assert.equal(isPrivateIPv4("192.168.0.1"), true);
      assert.equal(isPrivateIPv4("192.168.100.200"), true);
    });

    it("should identify link-local & cloud metadata 169.254.169.254", () => {
      assert.equal(isPrivateIPv4("169.254.169.254"), true);
      assert.equal(isPrivateIPv4("169.254.1.1"), true);
    });

    it("should allow valid public IP addresses", () => {
      assert.equal(isPrivateIPv4("8.8.8.8"), false);
      assert.equal(isPrivateIPv4("1.1.1.1"), false);
      assert.equal(isPrivateIPv4("93.184.216.34"), false);
    });
  });

  describe("isPrivateIPv6", () => {
    it("should block loopback ::1", () => {
      assert.equal(isPrivateIPv6("::1"), true);
      assert.equal(isPrivateIPv6("0:0:0:0:0:0:0:1"), true);
    });

    it("should block unspecified ::", () => {
      assert.equal(isPrivateIPv6("::"), true);
    });

    it("should block unique local fc00::/7", () => {
      assert.equal(isPrivateIPv6("fc00::1"), true);
      assert.equal(isPrivateIPv6("fd12:3456:789a::1"), true);
    });

    it("should block link-local fe80::/10", () => {
      assert.equal(isPrivateIPv6("fe80::1"), true);
      assert.equal(isPrivateIPv6("fe90::1"), true);
    });

    it("should block IPv4-mapped loopback", () => {
      assert.equal(isPrivateIPv6("::ffff:127.0.0.1"), true);
      assert.equal(isPrivateIPv6("::ffff:169.254.169.254"), true);
    });
  });

  describe("isPrivateIp generic dispatcher", () => {
    it("should dispatch correctly for IPv4 and IPv6", () => {
      assert.equal(isPrivateIp("127.0.0.1"), true);
      assert.equal(isPrivateIp("::1"), true);
      assert.equal(isPrivateIp("8.8.8.8"), false);
      assert.equal(isPrivateIp("invalid-ip-string"), true); // Malformed blocked by default
    });
  });

  describe("validateTargetUrl", () => {
    it("should reject non-HTTP/HTTPS protocols", async () => {
      const ftpResult = await validateTargetUrl("ftp://example.com/test");
      assert.equal(ftpResult.isValid, false);
      assert.match(ftpResult.error ?? "", /Blocked protocol: ftp:/);

      const fileResult = await validateTargetUrl("file:///etc/passwd");
      assert.equal(fileResult.isValid, false);
      assert.match(fileResult.error ?? "", /Blocked protocol: file:/);

      const gopherResult = await validateTargetUrl("gopher://127.0.0.1:70");
      assert.equal(gopherResult.isValid, false);
    });

    it("should reject dangerous internal service ports", async () => {
      const sshResult = await validateTargetUrl("http://example.com:22");
      assert.equal(sshResult.isValid, false);
      assert.match(sshResult.error ?? "", /Blocked port: 22/);

      const pgResult = await validateTargetUrl("http://example.com:5432");
      assert.equal(pgResult.isValid, false);
      assert.match(pgResult.error ?? "", /Blocked port: 5432/);

      const redisResult = await validateTargetUrl("http://example.com:6379");
      assert.equal(redisResult.isValid, false);
      assert.match(redisResult.error ?? "", /Blocked port: 6379/);
    });

    it("should block localhost and internal domains directly", async () => {
      const localResult = await validateTargetUrl("http://localhost:3000/api");
      assert.equal(localResult.isValid, false);
      assert.match(localResult.error ?? "", /Access to local\/internal domains/);

      const localDomain = await validateTargetUrl("http://service.local/status");
      assert.equal(localDomain.isValid, false);
    });

    it("should block IP literals belonging to private range", async () => {
      const ipResult = await validateTargetUrl("http://127.0.0.1/status");
      assert.equal(ipResult.isValid, false);
      assert.match(ipResult.error ?? "", /SSRF Blocked/);

      const metadataResult = await validateTargetUrl("http://169.254.169.254/latest/meta-data");
      assert.equal(metadataResult.isValid, false);
      assert.match(metadataResult.error ?? "", /SSRF Blocked/);
    });
  });

  describe("validateRedirectTarget", () => {
    it("should block redirects pointing to internal addresses", async () => {
      const redirect = await validateRedirectTarget(
        "https://example.com/login",
        "http://127.0.0.1:6379/"
      );
      assert.equal(redirect.isValid, false);
    });

    it("should block relative redirects pointing to prohibited schemes", async () => {
      const redirect = await validateRedirectTarget(
        "https://example.com/path",
        "javascript:alert(1)"
      );
      assert.equal(redirect.isValid, false);
    });
  });
});
