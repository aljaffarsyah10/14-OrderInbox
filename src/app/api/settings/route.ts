import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

const settingsUpdateSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100).optional(),
  alertEmails: z.array(z.string().email("Invalid email address")).optional(),
  webhookUrl: z
    .string()
    .url("Invalid webhook URL")
    .or(z.literal(""))
    .nullable()
    .optional(),
  webhookEnabled: z.boolean().optional(),
  alertOnDown: z.boolean().optional(),
  alertOnRecovery: z.boolean().optional(),
  consecutiveFailures: z.number().int().min(1).max(10).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || !session.user) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        settings: true,
      },
    });

    if (!user) {
      return errorResponse("User not found", "NOT_FOUND", 404);
    }

    // If user settings don't exist yet, return defaults
    const settings = user.settings ?? {
      id: "default",
      userId: user.id,
      alertEmails: [user.email],
      webhookUrl: null,
      webhookEnabled: false,
      alertOnDown: true,
      alertOnRecovery: true,
      consecutiveFailures: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      },
      settings,
    });
  } catch (error) {
    console.error("[GET /api/settings]", error);
    return errorResponse("Internal server error", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session || !session.user) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return errorResponse("Invalid JSON payload", "INVALID_PAYLOAD", 400);
    }

    const validation = settingsUpdateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        "Validation failed",
        "VALIDATION_ERROR",
        400,
        validation.error.issues
      );
    }

    const data = validation.data;

    const result = await prisma.$transaction(async (tx) => {
      let updatedUser = null;
      if (data.name !== undefined) {
        updatedUser = await tx.user.update({
          where: { id: session.user.id },
          data: { name: data.name },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
          },
        });
      } else {
        updatedUser = await tx.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
          },
        });
      }

      const updatedSettings = await tx.userSettings.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          alertEmails: data.alertEmails ?? [session.user.email],
          webhookUrl: data.webhookUrl || null,
          webhookEnabled: data.webhookEnabled ?? false,
          alertOnDown: data.alertOnDown ?? true,
          alertOnRecovery: data.alertOnRecovery ?? true,
          consecutiveFailures: data.consecutiveFailures ?? 1,
        },
        update: {
          alertEmails: data.alertEmails !== undefined ? data.alertEmails : undefined,
          webhookUrl: data.webhookUrl !== undefined ? (data.webhookUrl || null) : undefined,
          webhookEnabled: data.webhookEnabled !== undefined ? data.webhookEnabled : undefined,
          alertOnDown: data.alertOnDown !== undefined ? data.alertOnDown : undefined,
          alertOnRecovery: data.alertOnRecovery !== undefined ? data.alertOnRecovery : undefined,
          consecutiveFailures:
            data.consecutiveFailures !== undefined ? data.consecutiveFailures : undefined,
        },
      });

      return {
        user: updatedUser,
        settings: updatedSettings,
      };
    });

    return successResponse(result);
  } catch (error) {
    console.error("[PUT /api/settings]", error);
    return errorResponse("Failed to update settings", "UPDATE_FAILED", 500);
  }
}
