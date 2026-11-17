import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, isNextBailoutError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const apiLog = logger.child("API:EndpointHistory");

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
    const range = searchParams.get("range")?.toLowerCase();
    const skip = (page - 1) * limit;

    const where: {
      endpointId: string;
      checkedAt?: { gte: Date };
    } = {
      endpointId: id,
    };

    if (range === "24h") {
      where.checkedAt = { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
    } else if (range === "7d") {
      where.checkedAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (range === "30d") {
      where.checkedAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    const [checks, total] = await Promise.all([
      prisma.monitorCheck.findMany({
        where,
        orderBy: { checkedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.monitorCheck.count({
        where,
      }),
    ]);

    return successResponse({
      checks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    if (isNextBailoutError(error)) {
      throw error;
    }
    apiLog.error("Error retrieving endpoint check history", error);
    return errorResponse("Internal server error", "INTERNAL_SERVER_ERROR", 500);
  }
}

