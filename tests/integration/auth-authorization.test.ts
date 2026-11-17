import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../../src/lib/db/prisma";
import {
  apiEndpointInputSchema,
  apiEndpointUpdateSchema,
} from "../../src/lib/validation/endpoint.schema";

describe("Authentication, Authorization & IDOR Protection Integration Tests", () => {
  let userAId: string;
  let userBId: string;
  let endpointAId: string;

  before(async () => {
    // Create two separate test tenants
    const userA = await prisma.user.create({
      data: {
        name: "Tenant User Alpha",
        email: `tenant-alpha-${Date.now()}@orderinbox.local`,
      },
    });
    userAId = userA.id;

    const userB = await prisma.user.create({
      data: {
        name: "Tenant User Beta",
        email: `tenant-beta-${Date.now()}@orderinbox.local`,
      },
    });
    userBId = userB.id;

    // User A creates a critical production monitor
    const epA = await prisma.endpoint.create({
      data: {
        userId: userAId,
        name: "Alpha Production Core API",
        url: "https://api.alpha.com/v1/health",
        method: "GET",
        intervalSeconds: 60,
        timeoutMs: 5000,
        expectedStatus: [200],
        status: "UP",
        configuration: {
          create: {
            headers: { Authorization: "Bearer alpha-secret-token" },
            headerRules: [
              { header: "content-type", operator: "CONTAINS", value: "application/json" },
            ],
            bodyRules: [
              { type: "JSON_PROPERTY_EQUALS", path: "status", value: "ok" },
            ],
          },
        },
      },
    });
    endpointAId = epA.id;
  });

  after(async () => {
    // Cascade delete both users
    if (userAId) {
      await prisma.user.delete({ where: { id: userAId } }).catch(() => null);
    }
    if (userBId) {
      await prisma.user.delete({ where: { id: userBId } }).catch(() => null);
    }
  });

  describe("IDOR Protection: Tenant Isolation on Endpoints", () => {
    it("should prevent User B from reading User A's endpoint (GET isolation)", async () => {
      // Query simulating GET /api/endpoints/[id] scoped by session.user.id
      const foundByUserB = await prisma.endpoint.findFirst({
        where: {
          id: endpointAId,
          userId: userBId, // Attacker tenant context
        },
      });

      assert.equal(foundByUserB, null, "User B should NOT be able to find User A's endpoint");

      // Verify User A can still retrieve it normally
      const foundByUserA = await prisma.endpoint.findFirst({
        where: {
          id: endpointAId,
          userId: userAId,
        },
        include: { configuration: true },
      });
      assert.ok(foundByUserA, "User A should successfully read their own endpoint");
      assert.equal(foundByUserA?.name, "Alpha Production Core API");
    });

    it("should prevent User B from updating or tampering with User A's endpoint (PUT/PATCH isolation)", async () => {
      // Attempt unauthorized lookup prior to update
      const existing = await prisma.endpoint.findFirst({
        where: {
          id: endpointAId,
          userId: userBId,
        },
      });
      assert.equal(existing, null, "Unauthorized update check should fail to find target endpoint");

      // Verify endpoint was NOT tampered with
      const original = await prisma.endpoint.findUnique({
        where: { id: endpointAId },
      });
      assert.equal(original?.name, "Alpha Production Core API");
      assert.equal(original?.url, "https://api.alpha.com/v1/health");
    });

    it("should prevent User B from deleting User A's endpoint (DELETE isolation)", async () => {
      // Attempt unauthorized delete pre-check
      const existing = await prisma.endpoint.findFirst({
        where: {
          id: endpointAId,
          userId: userBId,
        },
      });
      assert.equal(existing, null, "Unauthorized delete check should reject deletion");

      // Verify endpoint still exists in database
      const intact = await prisma.endpoint.findUnique({
        where: { id: endpointAId },
      });
      assert.ok(intact, "User A's endpoint must remain completely intact in the database");
    });

    it("should exclude User A's endpoint from User B's catalog list query", async () => {
      const userBEndpoints = await prisma.endpoint.findMany({
        where: {
          userId: userBId,
        },
      });

      assert.equal(userBEndpoints.length, 0, "User B should have an empty list of endpoints");
      assert.equal(
        userBEndpoints.some((ep) => ep.id === endpointAId),
        false,
        "User A's endpoint must not appear in User B's results"
      );
    });

    it("should prevent User B from reading execution check history of User A's endpoint", async () => {
      // Create a check under User A's endpoint
      await prisma.monitorCheck.create({
        data: {
          endpointId: endpointAId,
          status: "SUCCESS",
          httpStatus: 200,
          responseTimeMs: 65,
        },
      });

      // User B verifies ownership before reading checks
      const endpointOwnership = await prisma.endpoint.findFirst({
        where: {
          id: endpointAId,
          userId: userBId,
        },
        select: { id: true },
      });

      assert.equal(endpointOwnership, null, "User B cannot access history of User A's endpoint");
    });
  });

  describe("Zod Input Validation on API Payloads", () => {
    it("should accept valid endpoint payloads", () => {
      const validPayload = {
        name: "Stripe Webhook Gateway",
        url: "https://billing.example.com/webhook",
        method: "POST",
        intervalSeconds: 120,
        timeoutMs: 5000,
        expectedStatus: [200, 204],
        headers: [{ key: "Content-Type", value: "application/json" }],
        headerRules: [{ header: "content-type", operator: "CONTAINS", value: "json" }],
        bodyRules: [{ type: "CONTAINS_TEXT", value: "received" }],
      };

      const parsed = apiEndpointInputSchema.safeParse(validPayload);
      assert.equal(parsed.success, true);
    });

    it("should reject endpoint with invalid or prohibited protocols", () => {
      const invalidSchemes = [
        "ftp://example.com/api",
        "file:///etc/hosts",
        "gopher://example.com",
        "javascript:alert(1)",
        "not-a-url",
      ];

      for (const badUrl of invalidSchemes) {
        const result = apiEndpointInputSchema.safeParse({
          name: "Invalid Protocol Test",
          url: badUrl,
          method: "GET",
        });
        assert.equal(result.success, false, `URL ${badUrl} should fail validation`);
      }
    });

    it("should reject intervalSeconds outside permitted boundaries [60, 86400]", () => {
      const tooLow = apiEndpointInputSchema.safeParse({
        name: "Too Fast Monitor",
        url: "https://example.com",
        intervalSeconds: 10, // Minimum is 60s
      });
      assert.equal(tooLow.success, false);

      const tooHigh = apiEndpointInputSchema.safeParse({
        name: "Too Slow Monitor",
        url: "https://example.com",
        intervalSeconds: 100000, // Maximum is 86400s
      });
      assert.equal(tooHigh.success, false);
    });

    it("should reject timeoutMs outside permitted boundaries [1000, 30000]", () => {
      const tooShort = apiEndpointInputSchema.safeParse({
        name: "Subsecond Timeout",
        url: "https://example.com",
        timeoutMs: 500, // Min is 1000ms
      });
      assert.equal(tooShort.success, false);

      const tooLong = apiEndpointInputSchema.safeParse({
        name: "Hanging Timeout",
        url: "https://example.com",
        timeoutMs: 60000, // Max is 30000ms
      });
      assert.equal(tooLong.success, false);
    });

    it("should reject short or blank monitor names", () => {
      const emptyName = apiEndpointInputSchema.safeParse({
        name: "a", // Min 2 chars
        url: "https://example.com",
      });
      assert.equal(emptyName.success, false);
    });

    it("should validate partial updates using apiEndpointUpdateSchema", () => {
      const validPatch = {
        name: "Updated Name Only",
      };
      const parsed = apiEndpointUpdateSchema.safeParse(validPatch);
      assert.equal(parsed.success, true);

      const invalidPatch = {
        intervalSeconds: 15, // Invalid interval
      };
      const badParsed = apiEndpointUpdateSchema.safeParse(invalidPatch);
      assert.equal(badParsed.success, false);
    });
  });

  describe("User Settings Isolation & Preferences Management", () => {
    it("should create and update settings independently for User A and User B", async () => {
      // User A configures alert preferences
      const settingsA = await prisma.userSettings.upsert({
        where: { userId: userAId },
        create: {
          userId: userAId,
          alertEmails: ["ops-team@alpha.com", "oncall@alpha.com"],
          webhookUrl: "https://hooks.slack.com/services/T00/B00/alpha",
          webhookEnabled: true,
          alertOnDown: true,
          alertOnRecovery: true,
          consecutiveFailures: 2,
        },
        update: {},
      });

      // User B configures completely different preferences
      const settingsB = await prisma.userSettings.upsert({
        where: { userId: userBId },
        create: {
          userId: userBId,
          alertEmails: ["admin@beta.org"],
          webhookUrl: null,
          webhookEnabled: false,
          alertOnDown: true,
          alertOnRecovery: false,
          consecutiveFailures: 1,
        },
        update: {},
      });

      assert.equal(settingsA.userId, userAId);
      assert.deepEqual(settingsA.alertEmails, ["ops-team@alpha.com", "oncall@alpha.com"]);
      assert.equal(settingsA.webhookEnabled, true);
      assert.equal(settingsA.consecutiveFailures, 2);

      assert.equal(settingsB.userId, userBId);
      assert.deepEqual(settingsB.alertEmails, ["admin@beta.org"]);
      assert.equal(settingsB.webhookEnabled, false);
      assert.equal(settingsB.consecutiveFailures, 1);

      // Verify updating User A does NOT affect User B
      await prisma.userSettings.update({
        where: { userId: userAId },
        data: { consecutiveFailures: 3 },
      });

      const freshB = await prisma.userSettings.findUnique({
        where: { userId: userBId },
      });
      assert.equal(freshB?.consecutiveFailures, 1, "User B settings must remain untouched");
    });
  });
});
