import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { triggerManualCheck } from "@/lib/queue/queues";

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

    // Trigger on-demand check
    const queued = await triggerManualCheck(id);

    return successResponse({
      message: queued ? "Manual check triggered" : "Manual check queued (mock mode)",
      endpointId: id,
    });
  } catch (error) {
    console.error("[POST /api/endpoints/[id]/check]", error);
    return errorResponse("Failed to trigger check", "TRIGGER_FAILED", 500);
  }
}
