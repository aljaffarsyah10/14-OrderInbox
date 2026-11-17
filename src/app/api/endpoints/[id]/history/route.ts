import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

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
      select: { id: true },
    });

    if (!endpoint) {
      return errorResponse("Endpoint not found", "NOT_FOUND", 404);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const [checks, total] = await Promise.all([
      prisma.monitorCheck.findMany({
        where: { endpointId: id },
        orderBy: { checkedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.monitorCheck.count({
        where: { endpointId: id },
      }),
    ]);

    return successResponse({
      checks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/endpoints/[id]/history]", error);
    return errorResponse("Internal server error", "INTERNAL_SERVER_ERROR", 500);
  }
}
