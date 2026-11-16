import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { apiEndpointInputSchema } from "@/lib/validation/endpoint.schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { scheduleEndpointCheck } from "@/lib/queue/queues";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || !session.user) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const endpoints = await prisma.endpoint.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        configuration: true,
        checks: {
          orderBy: {
            checkedAt: "desc",
          },
          take: 10,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Compute presentation fields (currentLatencyMs, 24h uptime)
    const formattedEndpoints = endpoints.map((ep) => {
      const latestCheck = ep.checks[0];
      const successfulChecks = ep.checks.filter((c) => c.status === "SUCCESS").length;
      const uptime24h =
        ep.checks.length > 0
          ? Math.round((successfulChecks / ep.checks.length) * 100 * 10) / 10
          : 100;

      return {
        ...ep,
        currentLatencyMs: latestCheck?.responseTimeMs ?? null,
        uptime24h,
      };
    });

    return successResponse(formattedEndpoints);
  } catch (error) {
    console.error("[GET /api/endpoints]", error);
    return errorResponse("Internal server error", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || !session.user) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return errorResponse("Invalid JSON payload", "INVALID_PAYLOAD", 400);
    }

    const validationResult = apiEndpointInputSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(
        "Validation failed",
        "VALIDATION_ERROR",
        400,
        validationResult.error.issues
      );
    }

    const data = validationResult.data;

    // Create endpoint with configuration in a transaction
    const newEndpoint = await prisma.$transaction(async (tx) => {
      const endpoint = await tx.endpoint.create({
        data: {
          userId: session.user.id,
          name: data.name,
          url: data.url,
          method: data.method,
          intervalSeconds: data.intervalSeconds,
          timeoutMs: data.timeoutMs,
          expectedStatus: data.expectedStatus,
          status: "PENDING",
          isActive: true,
          configuration: {
            create: {
              headers: data.headers ?? undefined,
              body: data.body ?? undefined,
              headerRules: data.headerRules ?? undefined,
              bodyRules: data.bodyRules ?? undefined,
            },
          },
        },
        include: {
          configuration: true,
        },
      });

      return endpoint;
    });

    // Schedule monitoring check in BullMQ queue
    await scheduleEndpointCheck(newEndpoint.id, newEndpoint.intervalSeconds);

    return successResponse(newEndpoint, 201);
  } catch (error) {
    console.error("[POST /api/endpoints]", error);
    return errorResponse("Failed to create endpoint", "CREATE_FAILED", 500);
  }
}
