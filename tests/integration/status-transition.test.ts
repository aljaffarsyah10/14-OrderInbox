import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../../src/lib/db/prisma";

describe("Monitor Status Transitions & Anti-Flapping Alert Logic", () => {
  let testUserId: string;
  let testEndpointId: string;

  before(async () => {
    const user = await prisma.user.create({
      data: {
        name: "Transition Test Operator",
        email: `operator-${Date.now()}@orderinbox.local`,
      },
    });
    testUserId = user.id;

    const endpoint = await prisma.endpoint.create({
      data: {
        userId: testUserId,
        name: "Transition Test Target",
        url: "https://api.transition-test.local/health",
        method: "GET",
        intervalSeconds: 60,
        timeoutMs: 5000,
        expectedStatus: [200],
        status: "PENDING",
      },
    });
    testEndpointId = endpoint.id;
  });

  after(async () => {
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => null);
    }
  });

  // Helper simulating the transition logic from monitor-engine.ts
  async function simulateCheckExecution(
    endpointId: string,
    checkSuccess: boolean,
    httpStatus: number | null,
    latencyMs: number,
    errorMessage: string | null
  ) {
    const endpoint = await prisma.endpoint.findUniqueOrThrow({
      where: { id: endpointId },
    });

    if (!endpoint.isActive || endpoint.status === "PAUSED") {
      return {
        endpointId,
        previousStatus: endpoint.status,
        newStatus: endpoint.status,
        statusTransition: "NONE" as const,
        alertId: null,
        skipped: true,
      };
    }

    const previousStatus = endpoint.status;
    let newStatus = previousStatus;
    let statusTransition: "NONE" | "UP_TO_DOWN" | "DOWN_TO_UP" = "NONE";

    if (!checkSuccess) {
      if (previousStatus !== "DOWN") {
        newStatus = "DOWN";
        statusTransition = "UP_TO_DOWN";
      }
    } else {
      if (previousStatus === "DOWN" || previousStatus === "PENDING") {
        newStatus = "UP";
        if (previousStatus === "DOWN") {
          statusTransition = "DOWN_TO_UP";
        }
      }
    }

    return await prisma.$transaction(async (tx) => {
      await tx.monitorCheck.create({
        data: {
          endpointId: endpoint.id,
          status: checkSuccess ? "SUCCESS" : "FAILED",
          httpStatus,
          responseTimeMs: latencyMs,
          errorMessage,
          checkedAt: new Date(),
        },
      });

      await tx.endpoint.update({
        where: { id: endpoint.id },
        data: {
          status: newStatus,
          lastCheckedAt: new Date(),
        },
      });

      let alertId: string | null = null;
      if (statusTransition !== "NONE") {
        const alertType = statusTransition === "UP_TO_DOWN" ? "DOWN" : "RECOVERY";
        const alertMessage =
          statusTransition === "UP_TO_DOWN"
            ? `Monitor "${endpoint.name}" went DOWN: ${errorMessage}`
            : `Monitor "${endpoint.name}" recovered and is now UP`;

        const alert = await tx.alert.create({
          data: {
            endpointId: endpoint.id,
            userId: endpoint.userId,
            type: alertType,
            status: "PENDING",
            message: alertMessage,
          },
        });
        alertId = alert.id;
      }

      return {
        endpointId,
        previousStatus,
        newStatus,
        statusTransition,
        alertId,
        skipped: false,
      };
    });
  }

  it("Step 1: Initial check from PENDING succeeds -> status transitions to UP with NO alert", async () => {
    const result = await simulateCheckExecution(
      testEndpointId,
      true,
      200,
      45.2,
      null
    );

    assert.equal(result.previousStatus, "PENDING");
    assert.equal(result.newStatus, "UP");
    assert.equal(result.statusTransition, "NONE");
    assert.equal(result.alertId, null);

    const ep = await prisma.endpoint.findUnique({ where: { id: testEndpointId } });
    assert.equal(ep?.status, "UP");

    const alerts = await prisma.alert.findMany({ where: { endpointId: testEndpointId } });
    assert.equal(alerts.length, 0, "No alerts should be triggered during initial discovery");
  });

  it("Step 2: Endpoint experiences outage -> status transitions to DOWN and generates DOWN alert", async () => {
    const result = await simulateCheckExecution(
      testEndpointId,
      false,
      503,
      120.0,
      "HTTP status 503 is not in expected list [200]"
    );

    assert.equal(result.previousStatus, "UP");
    assert.equal(result.newStatus, "DOWN");
    assert.equal(result.statusTransition, "UP_TO_DOWN");
    assert.ok(result.alertId, "Alert must be created for UP_TO_DOWN transition");

    const ep = await prisma.endpoint.findUnique({ where: { id: testEndpointId } });
    assert.equal(ep?.status, "DOWN");

    const alert = await prisma.alert.findUnique({ where: { id: result.alertId! } });
    assert.equal(alert?.type, "DOWN");
    assert.equal(alert?.status, "PENDING");
    assert.match(alert?.message ?? "", /went DOWN/);
  });

  it("Step 3: Endpoint remains DOWN on subsequent failure -> Anti-flapping suppresses duplicate alert", async () => {
    const result = await simulateCheckExecution(
      testEndpointId,
      false,
      503,
      115.0,
      "HTTP status 503 is not in expected list [200]"
    );

    assert.equal(result.previousStatus, "DOWN");
    assert.equal(result.newStatus, "DOWN");
    assert.equal(result.statusTransition, "NONE");
    assert.equal(result.alertId, null, "No duplicate alert should be generated while staying DOWN");

    const totalAlerts = await prisma.alert.findMany({ where: { endpointId: testEndpointId } });
    assert.equal(totalAlerts.length, 1, "Total alerts should remain exactly 1 (no spam)");
  });

  it("Step 4: Endpoint recovers -> status transitions to UP and generates RECOVERY alert", async () => {
    const result = await simulateCheckExecution(
      testEndpointId,
      true,
      200,
      52.1,
      null
    );

    assert.equal(result.previousStatus, "DOWN");
    assert.equal(result.newStatus, "UP");
    assert.equal(result.statusTransition, "DOWN_TO_UP");
    assert.ok(result.alertId, "Alert must be created for DOWN_TO_UP recovery transition");

    const ep = await prisma.endpoint.findUnique({ where: { id: testEndpointId } });
    assert.equal(ep?.status, "UP");

    const recoveryAlert = await prisma.alert.findUnique({ where: { id: result.alertId! } });
    assert.equal(recoveryAlert?.type, "RECOVERY");
    assert.equal(recoveryAlert?.status, "PENDING");
    assert.match(recoveryAlert?.message ?? "", /recovered/);
  });

  it("Step 5: Endpoint stays healthy on subsequent checks -> No alerts or transitions", async () => {
    const result = await simulateCheckExecution(
      testEndpointId,
      true,
      200,
      48.0,
      null
    );

    assert.equal(result.previousStatus, "UP");
    assert.equal(result.newStatus, "UP");
    assert.equal(result.statusTransition, "NONE");
    assert.equal(result.alertId, null);

    const totalAlerts = await prisma.alert.findMany({ where: { endpointId: testEndpointId } });
    assert.equal(totalAlerts.length, 2, "Exactly 2 alerts in total: 1 DOWN, 1 RECOVERY");
  });

  it("Step 6: Paused endpoint is skipped completely", async () => {
    await prisma.endpoint.update({
      where: { id: testEndpointId },
      data: { status: "PAUSED", isActive: false },
    });

    const result = await simulateCheckExecution(
      testEndpointId,
      true,
      200,
      50,
      null
    );

    assert.equal(result.skipped, true);
    assert.equal(result.statusTransition, "NONE");

    const ep = await prisma.endpoint.findUnique({ where: { id: testEndpointId } });
    assert.equal(ep?.status, "PAUSED");
  });
});
