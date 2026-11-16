import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { scheduleEndpointCheck, removeEndpointCheck } from "@/lib/queue/queues";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
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
    });

    if (!endpoint) {
      return errorResponse("Endpoint not found", "NOT_FOUND", 404);
    }

    // Toggle pause/resume
    const willPause = endpoint.isActive;

    if (willPause) {
      // Pause
      const updated = await prisma.endpoint.update({
        where: { id },
        data: {
          isActive: false,
          status: "PAUSED",
        },
      });
      await removeEndpointCheck(id);
      return successResponse(updated);
    } else {
      // Resume
      const updated = await prisma.endpoint.update({
        where: { id },
        data: {
          isActive: true,
          status: "PENDING",
        },
      });
      await scheduleEndpointCheck(id, updated.intervalSeconds);
      return successResponse(updated);
    }
  } catch (error) {
    console.error("[POST /api/endpoints/[id]/pause]", error);
    return errorResponse("Failed to toggle pause status", "PAUSE_FAILED", 500);
  }
}
