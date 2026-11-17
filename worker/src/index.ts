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
import { runEndpointMonitoring } from "./monitoring/monitor-engine";
import { validateTargetUrl } from "./monitoring/url-security";
import { syncAllActiveEndpoints } from "./scheduler";

console.log("=========================================");
console.log("   OrderInbox Background Worker Starting  ");
console.log("=========================================");

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
      console.log(
        `[Worker] Processing ${trigger} check for endpoint: ${endpointId} (Job ID: ${job.id})`
      );

      const result = await runEndpointMonitoring(endpointId);

      console.log(
        `[Worker] Check completed for ${endpointId}: status=${result.httpStatus ?? "N/A"}, latency=${
          result.latencyMs
        }ms, success=${result.success}, transition=${result.statusTransition} in ${
          Date.now() - startedAt
        }ms`
      );

      return result;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[Worker] Error processing endpoint check ${endpointId}:`, errorMsg);
      throw err;
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 10,
  }
);

monitorWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

// 2. Alert Notifications Worker
const alertWorker = new Worker<AlertNotificationJobData>(
  ALERT_NOTIFICATIONS_QUEUE_NAME,
  async (job: Job<AlertNotificationJobData>) => {
    const { alertId, endpointId, userId, type, message } = job.data;

    try {
      console.log(`[Alert Worker] Dispatching alert ${alertId} (${type}) for user ${userId}`);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          settings: true,
        },
      });

      if (!user || !user.email) {
        console.warn(`[Alert Worker] User ${userId} not found or has no email address`);
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
        console.log(`[Alert Worker - Mock Dispatch] Email dispatched to [${recipients.join(", ")}]: "${message}"`);
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
            console.log(`[Alert Worker] Webhook successfully delivered to ${webhookUrl}`);
          } catch (webhookErr) {
            console.warn(`[Alert Worker] Webhook delivery failed to ${webhookUrl}:`, webhookErr);
          }
        } else {
          console.warn(`[Alert Worker] Webhook blocked by SSRF filter: ${security.error}`);
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

      console.log(`[Alert Worker] Alert ${alertId} successfully marked as SENT`);
    } catch (err: unknown) {
      console.error(`[Alert Worker] Failed to send alert ${alertId}:`, err);
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
  console.error(`[Alert Worker] Alert notification job ${job?.id} failed:`, err.message);
});

// Startup Routine
async function start() {
  try {
    await syncAllActiveEndpoints();
    console.log("[Worker] Background worker and queues are active and listening.");
  } catch (err) {
    console.error("[Worker] Initialization error:", err);
  }
}

start();

// Graceful Shutdown
async function shutdown(signal: string) {
  console.log(`[Worker] Received ${signal}. Shutting down worker gracefully...`);
  try {
    await monitorWorker.close();
    await alertWorker.close();
    await prisma.$disconnect();
    console.log("[Worker] Cleanup completed. Exiting process.");
    process.exit(0);
  } catch (err) {
    console.error("[Worker] Error during shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
