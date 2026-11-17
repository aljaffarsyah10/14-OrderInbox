import { Worker, Job } from "bullmq";
import nodemailer from "nodemailer";
import { prisma } from "../../src/lib/db/prisma";
import { createRedisConnection } from "../../src/lib/queue/redis";
import {
  MONITOR_CHECKS_QUEUE_NAME,
  ALERT_NOTIFICATIONS_QUEUE_NAME,
  MonitorCheckJobData,
  AlertNotificationJobData,
} from "../../src/lib/queue/queues";
import { runEndpointMonitoring } from "../../src/lib/monitoring/monitor-engine";
import { validateTargetUrl } from "../../src/lib/monitoring/url-security";
import { syncAllActiveEndpoints } from "./scheduler";
import { logger } from "../../src/lib/logger";

const workerLog = logger.child("Worker");

workerLog.info("OrderInbox Background Worker Starting");

// Setup Nodemailer transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

// 1. Monitor Checks Worker
const monitorWorker = new Worker<MonitorCheckJobData>(
  MONITOR_CHECKS_QUEUE_NAME,
  async (job: Job<MonitorCheckJobData>) => {
    const { endpointId, trigger } = job.data;
    const startedAt = Date.now();

    try {
      workerLog.info(
        `Processing ${trigger} check for endpoint: ${endpointId} (Job ID: ${job.id})`
      );

      const result = await runEndpointMonitoring(endpointId);

      workerLog.info(
        `Check completed for ${endpointId}: status=${result.httpStatus ?? "N/A"}, latency=${
          result.latencyMs
        }ms, success=${result.success}, transition=${result.statusTransition} in ${
          Date.now() - startedAt
        }ms`
      );

      return result;
    } catch (err: unknown) {
      workerLog.error(`Error processing endpoint check ${endpointId}`, err);
      throw err;
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 10,
  }
);

monitorWorker.on("failed", (job, err) => {
  workerLog.error(`Job ${job?.id} failed`, err);
});

// 2. Alert Notifications Worker
const alertWorker = new Worker<AlertNotificationJobData>(
  ALERT_NOTIFICATIONS_QUEUE_NAME,
  async (job: Job<AlertNotificationJobData>) => {
    const { alertId, endpointId, userId, type, message } = job.data;

    try {
      workerLog.info(`Dispatching alert ${alertId} (${type}) for user ${userId}`);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          settings: true,
        },
      });

      if (!user || !user.email) {
        workerLog.warn(`User ${userId} not found or has no email address`);
        return;
      }

      // Determine recipients from user settings or fallback to primary email
      const recipients =
        user.settings?.alertEmails && user.settings.alertEmails.length > 0
          ? user.settings.alertEmails
          : [user.email];

      // If in development or mock mode without SMTP
      const isEmailConfigured = Boolean(process.env.SMTP_USER || process.env.EMAIL_PROVIDER_API_KEY);

      if (isEmailConfigured) {
        await emailTransporter.sendMail({
          from: process.env.EMAIL_FROM || "notifications@orderinbox.local",
          to: recipients.join(", "),
          subject: `[OrderInbox Alert] Monitor ${type}: ${message}`,
          text: `Hello ${user.name},\n\nYour monitored service has changed status:\n\n${message}\n\nEndpoint ID: ${endpointId}\nTime: ${new Date().toISOString()}`,
          html: `<div style="font-family: sans-serif; padding: 20px;">
            <h2>OrderInbox Alert: ${type}</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>${message}</p>
            <p><small>Endpoint ID: ${endpointId} | Generated at ${new Date().toLocaleString()}</small></p>
          </div>`,
        });
      } else {
        workerLog.info(`Mock Email dispatched to [${recipients.join(", ")}]: "${message}"`);
      }

      // Webhook dispatch if configured and enabled
      if (user.settings?.webhookEnabled && user.settings?.webhookUrl) {
        const webhookUrl = user.settings.webhookUrl;
        const security = await validateTargetUrl(webhookUrl);
        if (security.isValid) {
          try {
            await fetch(webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "User-Agent": "OrderInbox-Webhook/1.0",
              },
              body: JSON.stringify({
                event: type === "DOWN" ? "endpoint.down" : "endpoint.recovered",
                endpointId,
                alertId,
                type,
                message,
                timestamp: new Date().toISOString(),
              }),
              signal: AbortSignal.timeout(5000),
            });
            workerLog.info(`Webhook successfully delivered to ${webhookUrl}`);
          } catch (webhookErr) {
            workerLog.warn(`Webhook delivery failed to ${webhookUrl}`, webhookErr);
          }
        } else {
          workerLog.warn(`Webhook blocked by SSRF filter: ${security.error}`);
        }
      }

      // Mark alert as SENT
      await prisma.alert.update({
        where: { id: alertId },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });

      workerLog.info(`Alert ${alertId} successfully marked as SENT`);
    } catch (err: unknown) {
      workerLog.error(`Failed to send alert ${alertId}`, err);
      await prisma.alert.update({
        where: { id: alertId },
        data: { status: "FAILED" },
      }).catch(() => null);
      throw err;
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 3,
  }
);

alertWorker.on("failed", (job, err) => {
  workerLog.error(`Alert notification job ${job?.id} failed`, err);
});

// Startup Routine
async function start() {
  try {
    await syncAllActiveEndpoints();
    workerLog.info("Background worker and queues are active and listening.");
  } catch (err) {
    workerLog.error("Initialization error", err);
  }
}

start();

// Graceful Shutdown
async function shutdown(signal: string) {
  workerLog.info(`Received ${signal}. Shutting down worker gracefully...`);
  try {
    await monitorWorker.close();
    await alertWorker.close();
    await prisma.$disconnect();
    workerLog.info("Cleanup completed. Exiting process.");
    process.exit(0);
  } catch (err) {
    workerLog.error("Error during shutdown", err);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
