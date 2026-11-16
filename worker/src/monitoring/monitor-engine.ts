import { prisma } from "../../../src/lib/db/prisma";
import { executeMonitoredRequest } from "./request";
import { validateResponse, HeaderRule, BodyRule } from "./response-validator";
import { enqueueAlertNotification } from "../../../src/lib/queue/queues";

export interface MonitorExecutionResult {
  endpointId: string;
  success: boolean;
  httpStatus: number | null;
  latencyMs: number;
  errorMessage: string | null;
  statusTransition: "NONE" | "UP_TO_DOWN" | "DOWN_TO_UP";
}

/**
 * Runs a single monitoring execution for an endpoint:
 * 1. Fetches endpoint and its rules
 * 2. Runs request with SSRF guard and monotonic timer
 * 3. Validates status, headers, and body
 * 4. Persists MonitorCheck
 * 5. Handles status transition and triggers alert if necessary
 */
export async function runEndpointMonitoring(
  endpointId: string
): Promise<MonitorExecutionResult> {
  const endpoint = await prisma.endpoint.findUnique({
    where: { id: endpointId },
    include: {
      configuration: true,
      user: true,
    },
  });

  if (!endpoint) {
    throw new Error(`Endpoint with ID ${endpointId} not found`);
  }

  // If paused or inactive, skip execution
  if (!endpoint.isActive || endpoint.status === "PAUSED") {
    return {
      endpointId,
      success: false,
      httpStatus: null,
      latencyMs: 0,
      errorMessage: "Endpoint is inactive or paused",
      statusTransition: "NONE",
    };
  }

  const config = endpoint.configuration;
  const parsedHeaders = config?.headers ? (config.headers as Record<string, string>) : {};
  const headerRules = config?.headerRules ? (config.headerRules as unknown as HeaderRule[]) : [];
  const bodyRules = config?.bodyRules ? (config.bodyRules as unknown as BodyRule[]) : [];

  // Execute request
  const httpResult = await executeMonitoredRequest({
    url: endpoint.url,
    method: endpoint.method,
    timeoutMs: endpoint.timeoutMs,
    headers: parsedHeaders,
    body: config?.body ?? null,
  });

  let checkSuccess = false;
  let errorMessage: string | null = null;

  if (!httpResult.ok && httpResult.status === 0) {
    // Network / SSRF / Timeout failure
    checkSuccess = false;
    errorMessage = httpResult.error || "Network connection failure";
  } else {
    // HTTP response received, validate against expectations
    const validation = validateResponse(
      {
        httpStatus: httpResult.status,
        headers: httpResult.headers,
        body: httpResult.body,
      },
      {
        expectedStatus: endpoint.expectedStatus,
        headerRules,
        bodyRules,
      }
    );

    if (validation.isValid) {
      checkSuccess = true;
    } else {
      checkSuccess = false;
      errorMessage = validation.summary;
    }
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

  // Atomic database persistence using Prisma transaction
  await prisma.$transaction(async (tx) => {
    // 1. Record MonitorCheck entry
    await tx.monitorCheck.create({
      data: {
        endpointId: endpoint.id,
        status: checkSuccess ? "SUCCESS" : "FAILED",
        httpStatus: httpResult.status > 0 ? httpResult.status : null,
        responseTimeMs: httpResult.latencyMs > 0 ? httpResult.latencyMs : null,
        errorMessage,
        checkedAt: new Date(),
      },
    });

    // 2. Update endpoint status and lastCheckedAt
    await tx.endpoint.update({
      where: { id: endpoint.id },
      data: {
        status: newStatus,
        lastCheckedAt: new Date(),
      },
    });

    // 3. Create Alert on status transition
    if (statusTransition !== "NONE") {
      const alertType = statusTransition === "UP_TO_DOWN" ? "DOWN" : "RECOVERY";
      const alertMessage =
        statusTransition === "UP_TO_DOWN"
          ? `Monitor "${endpoint.name}" went DOWN. Reason: ${errorMessage || "Health check failed"}`
          : `Monitor "${endpoint.name}" has RECOVERED and is now UP. Latency: ${httpResult.latencyMs}ms`;

      const createdAlert = await tx.alert.create({
        data: {
          endpointId: endpoint.id,
          userId: endpoint.userId,
          type: alertType,
          status: "PENDING",
          message: alertMessage,
        },
      });

      // Enqueue alert job to background queue
      await enqueueAlertNotification({
        alertId: createdAlert.id,
        endpointId: endpoint.id,
        userId: endpoint.userId,
        type: alertType,
        message: alertMessage,
      });
    }
  });

  return {
    endpointId,
    success: checkSuccess,
    httpStatus: httpResult.status > 0 ? httpResult.status : null,
    latencyMs: httpResult.latencyMs,
    errorMessage,
    statusTransition,
  };
}
