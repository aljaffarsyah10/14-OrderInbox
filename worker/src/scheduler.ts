import { prisma } from "../../src/lib/db/prisma";
import { getMonitorQueue, scheduleEndpointCheck, removeEndpointCheck } from "../../src/lib/queue/queues";

/**
 * Synchronizes database endpoints with BullMQ repeatable jobs.
 * - Adds/updates repeatable jobs for all active endpoints.
 * - Removes jobs for paused/deleted/inactive endpoints.
 */
export async function syncAllActiveEndpoints(): Promise<{
  syncedCount: number;
  removedCount: number;
}> {
  console.log("[Scheduler] Synchronizing endpoint monitoring schedules from PostgreSQL...");
  let syncedCount = 0;
  let removedCount = 0;

  try {
    const queue = getMonitorQueue();
    const activeEndpoints = await prisma.endpoint.findMany({
      where: {
        isActive: true,
        status: {
          not: "PAUSED",
        },
      },
      select: {
        id: true,
        intervalSeconds: true,
      },
    });

    const activeIdSet = new Set(activeEndpoints.map((e) => e.id));

    // Remove schedulers for endpoints that are no longer active
    const schedulers = await queue.getJobSchedulers();
    for (const s of schedulers) {
      if (s.id && s.id.startsWith("endpoint:")) {
        const epId = s.id.replace("endpoint:", "");
        if (!activeIdSet.has(epId)) {
          await queue.removeJobScheduler(s.id);
          removedCount++;
        }
      }
    }

    // Schedule or update active endpoints
    for (const ep of activeEndpoints) {
      const ok = await scheduleEndpointCheck(ep.id, ep.intervalSeconds);
      if (ok) {
        syncedCount++;
      }
    }

    console.log(
      `[Scheduler] Synchronization complete: ${syncedCount} active monitors scheduled, ${removedCount} stale jobs removed.`
    );
  } catch (err) {
    console.warn("[Scheduler] Warning during schedule synchronization:", err);
  }

  return { syncedCount, removedCount };
}

export { scheduleEndpointCheck, removeEndpointCheck };
