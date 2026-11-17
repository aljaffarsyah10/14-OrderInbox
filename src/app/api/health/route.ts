import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/queue/redis";

export async function GET() {
  const timestamp = new Date().toISOString();
  let dbStatus = "healthy";
  let redisStatus = "healthy";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: unknown) {
    dbStatus = `unhealthy: ${err instanceof Error ? err.message : String(err)}`;
  }

  try {
    const pingRes = await redis.ping();
    if (pingRes !== "PONG") {
      redisStatus = `unexpected ping: ${pingRes}`;
    }
  } catch (err: unknown) {
    redisStatus = `unhealthy: ${err instanceof Error ? err.message : String(err)}`;
  }

  const isHealthy = dbStatus === "healthy" && redisStatus === "healthy";

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      timestamp,
      uptimeSeconds: process.uptime(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}
