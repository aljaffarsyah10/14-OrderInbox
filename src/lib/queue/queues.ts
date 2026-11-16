import { Queue } from "bullmq";
import { getRedisClient } from "./redis";

export const MONITOR_CHECKS_QUEUE_NAME = "monitor-checks";
export const ALERT_NOTIFICATIONS_QUEUE_NAME = "alert-notifications";

export interface MonitorCheckJobData {
  endpointId: string;
  trigger: "SCHEDULED" | "MANUAL";
}

export interface AlertNotificationJobData {
  alertId: string;
  endpointId: string;
  userId: string;
  type: "DOWN" | "RECOVERY";
  message: string;
}

const globalForQueues = globalThis as unknown as {
  monitorQueue: Queue<MonitorCheckJobData> | undefined;
  alertQueue: Queue<AlertNotificationJobData> | undefined;
};

export function getMonitorQueue(): Queue<MonitorCheckJobData> {
  if (globalForQueues.monitorQueue) {
    return globalForQueues.monitorQueue;
  }

  const queue = new Queue<MonitorCheckJobData>(MONITOR_CHECKS_QUEUE_NAME, {
    connection: getRedisClient(),
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 1, // Monitoring failures should record immediately, no retries to preserve intervals
    },
  });

  if (process.env.NODE_ENV !== "production") {
    globalForQueues.monitorQueue = queue;
  }

  return queue;
}

export function getAlertQueue(): Queue<AlertNotificationJobData> {
  if (globalForQueues.alertQueue) {
    return globalForQueues.alertQueue;
  }

  const queue = new Queue<AlertNotificationJobData>(ALERT_NOTIFICATIONS_QUEUE_NAME, {
    connection: getRedisClient(),
    defaultJobOptions: {
      removeOnComplete: 500,
      removeOnFail: 1000,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 10000, // 10s, 30s, 60s
      },
    },
  });

  if (process.env.NODE_ENV !== "production") {
    globalForQueues.alertQueue = queue;
  }

  return queue;
}

/**
 * Schedule or update repeatable monitoring job for an endpoint.
 * Uses BullMQ v6 upsertJobScheduler to ensure exact idempotency.
 */
export async function scheduleEndpointCheck(endpointId: string, intervalSeconds: number): Promise<boolean> {
  try {
    const queue = getMonitorQueue();
    const intervalMs = Math.max(intervalSeconds, 60) * 1000;
    
    await queue.upsertJobScheduler(
      `endpoint:${endpointId}`,
      { every: intervalMs },
      {
        name: "scheduled-check",
        data: { endpointId, trigger: "SCHEDULED" },
      }
    );
    return true;
  } catch (err) {
    console.warn(`[Queue] Failed to schedule endpoint check for ${endpointId}:`, err);
    return false;
  }
}

/**
 * Remove repeatable monitoring job scheduler for an endpoint.
 */
export async function removeEndpointCheck(endpointId: string): Promise<boolean> {
  try {
    const queue = getMonitorQueue();
    await queue.removeJobScheduler(`endpoint:${endpointId}`);
    return true;
  } catch (err) {
    console.warn(`[Queue] Failed to remove repeatable check for ${endpointId}:`, err);
    return false;
  }
}

/**
 * Trigger immediate manual/on-demand check for an endpoint.
 */
export async function triggerManualCheck(endpointId: string): Promise<boolean> {
  try {
    const queue = getMonitorQueue();
    await queue.add(
      "manual-check",
      { endpointId, trigger: "MANUAL" },
      {
        jobId: `manual:${endpointId}:${Date.now()}`,
        priority: 1, // Highest priority
      }
    );
    return true;
  } catch (err) {
    console.warn(`[Queue] Failed to enqueue manual check for ${endpointId}:`, err);
    return false;
  }
}

/**
 * Enqueue alert notification job to the alert queue.
 */
export async function enqueueAlertNotification(data: AlertNotificationJobData): Promise<boolean> {
  try {
    const queue = getAlertQueue();
    await queue.add("send-alert", data, {
      jobId: `alert:${data.alertId}`,
    });
    return true;
  } catch (err) {
    console.warn(`[Queue] Failed to enqueue alert for ${data.endpointId}:`, err);
    return false;
  }
}
