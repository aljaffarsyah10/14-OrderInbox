import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../../src/lib/db/prisma";

describe("Database & Domain Persistence Integration Tests", () => {
  let testUserId: string;
  let testEndpointId: string;

  before(async () => {
    // Create a temporary test user
    const user = await prisma.user.create({
      data: {
        name: "Test Engineer",
        email: `test-${Date.now()}@orderinbox.local`,
      },
    });
    testUserId = user.id;
  });

  after(async () => {
    // Clean up test user (will cascade delete endpoints, checks, alerts)
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => null);
    }
  });

  it("should create an Endpoint with EndpointConfiguration", async () => {
    const endpoint = await prisma.endpoint.create({
      data: {
        userId: testUserId,
        name: "Production Billing API",
        url: "https://api.orderinbox.local/health",
        method: "GET",
        intervalSeconds: 120,
        timeoutMs: 5000,
        expectedStatus: [200, 201],
        status: "PENDING",
        configuration: {
          create: {
            headers: { Authorization: "Bearer test-key" },
            headerRules: [
              { header: "content-type", operator: "CONTAINS", value: "application/json" },
            ],
            bodyRules: [
              { type: "JSON_PROPERTY_EQUALS", path: "status", value: "healthy" },
            ],
          },
        },
      },
      include: {
        configuration: true,
      },
    });

    testEndpointId = endpoint.id;

    assert.ok(endpoint.id);
    assert.equal(endpoint.name, "Production Billing API");
    assert.equal(endpoint.intervalSeconds, 120);
    assert.deepEqual(endpoint.expectedStatus, [200, 201]);
    assert.ok(endpoint.configuration);
    assert.equal(endpoint.configuration.endpointId, endpoint.id);
  });

  it("should record MonitorCheck results", async () => {
    const check = await prisma.monitorCheck.create({
      data: {
        endpointId: testEndpointId,
        status: "SUCCESS",
        httpStatus: 200,
        responseTimeMs: 84.5,
        errorMessage: null,
      },
    });

    assert.ok(check.id);
    assert.equal(check.status, "SUCCESS");
    assert.equal(check.httpStatus, 200);
    assert.equal(check.responseTimeMs, 84.5);
  });

  it("should record status transition and create Alert", async () => {
    // Simulate endpoint going DOWN
    await prisma.$transaction([
      prisma.endpoint.update({
        where: { id: testEndpointId },
        data: { status: "DOWN" },
      }),
      prisma.alert.create({
        data: {
          endpointId: testEndpointId,
          userId: testUserId,
          type: "DOWN",
          status: "PENDING",
          message: "Service responded with HTTP 500",
        },
      }),
    ]);

    const updated = await prisma.endpoint.findUnique({
      where: { id: testEndpointId },
    });
    assert.equal(updated?.status, "DOWN");

    const alerts = await prisma.alert.findMany({
      where: { endpointId: testEndpointId },
    });
    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].type, "DOWN");
  });

  it("should cascade delete all child relations when endpoint is deleted", async () => {
    await prisma.endpoint.delete({
      where: { id: testEndpointId },
    });

    const deletedEndpoint = await prisma.endpoint.findUnique({
      where: { id: testEndpointId },
    });
    assert.equal(deletedEndpoint, null);

    const checks = await prisma.monitorCheck.findMany({
      where: { endpointId: testEndpointId },
    });
    assert.equal(checks.length, 0);

    const config = await prisma.endpointConfiguration.findUnique({
      where: { endpointId: testEndpointId },
    });
    assert.equal(config, null);
  });

  it("should create and update UserSettings with alert configurations", async () => {
    const settings = await prisma.userSettings.create({
      data: {
        userId: testUserId,
        alertEmails: ["devops@orderinbox.local", "ops@orderinbox.local"],
        webhookUrl: "https://hooks.slack.com/services/test",
        webhookEnabled: true,
        alertOnDown: true,
        alertOnRecovery: true,
        consecutiveFailures: 2,
      },
    });

    assert.ok(settings.id);
    assert.equal(settings.userId, testUserId);
    assert.deepEqual(settings.alertEmails, ["devops@orderinbox.local", "ops@orderinbox.local"]);
    assert.equal(settings.webhookEnabled, true);
    assert.equal(settings.consecutiveFailures, 2);

    const updated = await prisma.userSettings.update({
      where: { userId: testUserId },
      data: {
        consecutiveFailures: 3,
        alertOnRecovery: false,
      },
    });

    assert.equal(updated.consecutiveFailures, 3);
    assert.equal(updated.alertOnRecovery, false);
  });
});
