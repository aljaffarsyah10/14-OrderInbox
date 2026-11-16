import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { apiEndpointUpdateSchema } from "@/lib/validation/endpoint.schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { scheduleEndpointCheck, removeEndpointCheck } from "@/lib/queue/queues";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(req);
    if (!session || !session.user) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const { id } = await params;

    const endpoint = await prisma.endpoint.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        configuration: true,
        checks: {
          orderBy: {
            checkedAt: "desc",
          },
          take: 50,
        },
      },
    });

    if (!endpoint) {
      return errorResponse("Endpoint not found", "NOT_FOUND", 404);
    }

    const latestCheck = endpoint.checks[0];
    const successfulChecks = endpoint.checks.filter((c) => c.status === "SUCCESS").length;
    const uptime24h =
      endpoint.checks.length > 0
        ? Math.round((successfulChecks / endpoint.checks.length) * 100 * 10) / 10
        : 100;

    return successResponse({
      ...endpoint,
      currentLatencyMs: latestCheck?.responseTimeMs ?? null,
      uptime24h,
    });
  } catch (error) {
    console.error("[GET /api/endpoints/[id]]", error);
    return errorResponse("Internal server error", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(req);
    if (!session || !session.user) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const { id } = await params;

    const existingEndpoint = await prisma.endpoint.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingEndpoint) {
      return errorResponse("Endpoint not found", "NOT_FOUND", 404);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return errorResponse("Invalid JSON payload", "INVALID_PAYLOAD", 400);
    }

    const validationResult = apiEndpointUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(
        "Validation failed",
        "VALIDATION_ERROR",
        400,
        validationResult.error.issues
      );
    }

    const data = validationResult.data;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.endpoint.update({
        where: { id },
        data: {
          name: data.name ?? undefined,
          url: data.url ?? undefined,
          method: data.method ?? undefined,
          intervalSeconds: data.intervalSeconds ?? undefined,
          timeoutMs: data.timeoutMs ?? undefined,
          expectedStatus: data.expectedStatus ?? undefined,
        },
      });

      if (
        data.headers !== undefined ||
        data.body !== undefined ||
        data.headerRules !== undefined ||
        data.bodyRules !== undefined
      ) {
        await tx.endpointConfiguration.upsert({
          where: { endpointId: id },
          update: {
            headers: data.headers !== undefined ? data.headers ?? undefined : undefined,
            body: data.body !== undefined ? data.body ?? undefined : undefined,
            headerRules: data.headerRules !== undefined ? data.headerRules ?? undefined : undefined,
            bodyRules: data.bodyRules !== undefined ? data.bodyRules ?? undefined : undefined,
          },
          create: {
            endpointId: id,
            headers: data.headers ?? undefined,
            body: data.body ?? undefined,
            headerRules: data.headerRules ?? undefined,
            bodyRules: data.bodyRules ?? undefined,
          },
        });
      }

      return tx.endpoint.findUnique({
        where: { id },
        include: { configuration: true },
      });
    });

    // Update scheduler if interval changed or active
    if (updated?.isActive) {
      await scheduleEndpointCheck(updated.id, updated.intervalSeconds);
    }

    return successResponse(updated);
  } catch (error) {
    console.error("[PUT /api/endpoints/[id]]", error);
    return errorResponse("Update failed", "UPDATE_FAILED", 500);
  }
}

export async function PATCH(req: NextRequest, ctx: RouteParams) {
  return PUT(req, ctx);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(req);
    if (!session || !session.user) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const { id } = await params;

    const existingEndpoint = await prisma.endpoint.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingEndpoint) {
      return errorResponse("Endpoint not found", "NOT_FOUND", 404);
    }

    // Cancel repeatable schedule in BullMQ
    await removeEndpointCheck(id);

    // Delete endpoint (cascade deletes configuration, checks, alerts)
    await prisma.endpoint.delete({
      where: { id },
    });

    return successResponse({ deleted: true, id });
  } catch (error) {
    console.error("[DELETE /api/endpoints/[id]]", error);
    return errorResponse("Delete failed", "DELETE_FAILED", 500);
  }
}
