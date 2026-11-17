import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, isNextBailoutError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const apiLog = logger.child("API:DashboardStats");

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    if (!session || !session.user) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const userId = session.user.id;

    // Fetch user endpoints
    const endpoints = await prisma.endpoint.findMany({
      where: { userId },
      include: {
        checks: {
          orderBy: { checkedAt: "desc" },
          take: 20,
        },
      },
    });

    const totalEndpoints = endpoints.length;
    const activeEndpoints = endpoints.filter((e) => e.isActive).length;
    const upEndpoints = endpoints.filter((e) => e.status === "UP").length;
    const downEndpoints = endpoints.filter((e) => e.status === "DOWN").length;
    const pausedEndpoints = endpoints.filter((e) => e.status === "PAUSED").length;

    // Calculate average response time across latest checks
    const recentLatencyValues: number[] = [];
    let totalRecentChecks = 0;
    let successfulRecentChecks = 0;

    for (const ep of endpoints) {
      for (const chk of ep.checks) {
        totalRecentChecks++;
        if (chk.status === "SUCCESS") {
          successfulRecentChecks++;
          if (chk.responseTimeMs !== null && chk.responseTimeMs !== undefined) {
            recentLatencyValues.push(chk.responseTimeMs);
          }
        }
      }
    }

    const avgResponseTimeMs =
      recentLatencyValues.length > 0
        ? Math.round(
            (recentLatencyValues.reduce((a, b) => a + b, 0) / recentLatencyValues.length) * 10
          ) / 10
        : 0;

    const uptimePercentage =
      totalRecentChecks > 0
        ? Math.round((successfulRecentChecks / totalRecentChecks) * 100 * 10) / 10
        : 100;

    // Fetch recent incident alerts
    const alerts = await prisma.alert.findMany({
      where: { userId },
      include: {
        endpoint: {
          select: {
            name: true,
            url: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const recentIncidents = alerts.map((a) => ({
      id: a.id,
      endpointId: a.endpointId,
      endpointName: a.endpoint.name,
      endpointUrl: a.endpoint.url,
      type: a.type,
      status: a.status,
      message: a.message,
      createdAt: a.createdAt.toISOString(),
      sentAt: a.sentAt ? a.sentAt.toISOString() : null,
    }));

    return successResponse({
      summary: {
        totalEndpoints,
        activeEndpoints,
        upEndpoints,
        downEndpoints,
        pausedEndpoints,
        avgResponseTimeMs,
        uptimePercentage,
      },
      recentIncidents,
    });
  } catch (error) {
    if (isNextBailoutError(error)) {
      throw error;
    }
    apiLog.error("Failed to fetch dashboard stats", error);
    return errorResponse("Failed to fetch dashboard stats", "STATS_ERROR", 500);
  }
}

