# OrderInbox — Official User Guide & Operating Manual

Welcome to **OrderInbox**, a developer-grade HTTP/REST synthetic API monitoring platform. OrderInbox empowers engineering teams to proactively monitor API endpoints, assert status codes and JSON payloads, track millisecond response times, and receive instant downtime and recovery notifications.

---

## Table of Contents
1. [Getting Started](#1-getting-started)
   - [Creating an Account](#creating-an-account)
   - [Dashboard Overview](#dashboard-overview)
2. [How to Create and Configure an Endpoint](#2-how-to-create-and-configure-an-endpoint)
   - [Basic Configuration](#basic-configuration)
   - [Custom Request Headers & Body](#custom-request-headers--body)
   - [Validation Assertions (Status, Headers, JSON Body)](#validation-assertions)
   - [Testing Before Saving](#testing-before-saving)
3. [Understanding Health Status](#3-understanding-health-status)
   - [Status Definitions (UP, DOWN, PAUSED, PENDING)](#status-definitions)
   - [Transition Logic & Flapping Mitigation](#transition-logic--flapping-mitigation)
4. [Telemetry & Historical Performance](#4-telemetry--historical-performance)
   - [Latency Percentiles (Min, Max, Avg, P95)](#latency-percentiles)
   - [Time-Range Filtering (24h, 7d, 30d)](#time-range-filtering)
   - [90-Day Uptime SLA Tracking](#90-day-uptime-sla-tracking)
5. [Setting Up Alert Notifications](#5-setting-up-alert-notifications)
   - [Email Alert Recipients](#email-alert-recipients)
   - [Webhook Dispatch (Slack, Discord, PagerDuty)](#webhook-dispatch)
   - [Trigger Thresholds & Escalation](#trigger-thresholds--escalation)
6. [Troubleshooting & FAQ](#6-troubleshooting--faq)
   - [Common Error Messages](#common-error-messages)
   - [SSRF Safety Rejections](#ssrf-safety-rejections)
   - [Frequently Asked Questions](#frequently-asked-questions)

---

## 1. Getting Started

### Creating an Account
1. Open the OrderInbox web application and navigate to `/register`.
2. Enter your **Full Name**, **Work Email Address**, and a secure **Password** (minimum 8 characters).
3. Click **Create Account**. You will be authenticated immediately and redirected to your workspace dashboard.

### Dashboard Overview
Upon logging in, the **Overview Dashboard** (`/dashboard`) provides a single-pane-of-glass view into your API infrastructure:
- **Total Monitored Endpoints**: Total count of active and paused endpoints.
- **System Health Rate (24h)**: Average uptime across all monitored targets.
- **Active Incidents**: Current count of endpoints experiencing downtime.
- **Average Round-Trip Latency**: Real-time aggregated latency across recent check executions.
- **Live Incidents Feed**: Immediate notice of any active downtime alerts with direct links to the failing endpoint.
- **Catalog Snapshot**: Quick-access table showing recent endpoint performance and quick actions.

---

## 2. How to Create and Configure an Endpoint

### Basic Configuration
To monitor a new API endpoint:
1. In the sidebar or topbar, click **Create Endpoint** (or navigate to `/dashboard/endpoints/new`).
2. Provide the essential parameters:
   - **Monitor Name**: A descriptive label (e.g., `Production Checkout API`, `Auth Gateway Healthcheck`).
   - **Target Endpoint URL**: The complete HTTP/HTTPS URL (e.g., `https://api.example.com/v1/health`).
   - **HTTP Method**: Choose between `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, or `HEAD`.
   - **Check Interval**: Frequency of automated checks (e.g., every `60s`, `120s`, `300s`).
   - **Request Timeout**: Maximum permissible response time before timing out (default: `10000ms`, up to `30000ms`).

### Custom Request Headers & Body
For endpoints requiring authentication or specific content types:
- **Headers**: Add key-value pairs (e.g., `Authorization: Bearer <token>`, `X-Api-Key: secret_key`, `Accept: application/json`).
- **Request Body**: For `POST`, `PUT`, and `PATCH` requests, enter JSON payloads (e.g., `{"service": "ping", "timestamp": 123456}`).

### Validation Assertions
OrderInbox does not simply check if an endpoint connects—it verifies whether the endpoint behaves correctly:
1. **Expected HTTP Status Codes**:
   - Specify one or more acceptable HTTP status codes (e.g., `200, 201, 204`).
   - If the endpoint returns an unlisted status (e.g., `500 Internal Server Error` or `401 Unauthorized`), the check is marked as `FAILED`.
2. **Header Assertions**:
   - Assert that response headers match criteria:
     - `CONTAINS` (e.g., `content-type` contains `application/json`)
     - `EQUALS` (e.g., `x-service-region` equals `us-east-1`)
     - `NOT_CONTAINS` (e.g., `warning` does not contain `deprecated`)
     - `EXISTS` (e.g., `x-request-id` header must exist)
3. **JSON Body Assertions**:
   - Assert specific JSON properties within the response payload using dot notation:
     - `status.code` equals `0`
     - `data.healthy` equals `true`
     - `message` contains `operational`

### Testing Before Saving
Before saving, click **Test Request Now**. The executor performs an on-demand check directly against the target URL, verifying network connectivity, SSL handshake, status code, and validation rules. Once verified, click **Save Monitor**.

---

## 3. Understanding Health Status

OrderInbox evaluates every check against your defined assertion criteria and classifies endpoint health into one of four states:

| Status Badge | Indicator | Description |
|---|---|---|
| **UP** | 🟢 Green | The endpoint responded within the timeout limit, matched the expected HTTP status code, and satisfied all header and body validation assertions. |
| **DOWN** | 🔴 Red | The endpoint failed to respond within the timeout, failed DNS resolution, rejected SSL/TLS, returned an unexpected HTTP status code, or failed validation assertions. |
| **PAUSED** | 🟡 Yellow / Amber | Scheduled background pings have been temporarily halted by the user. Historical data is preserved, but no new automated checks are queued. |
| **PENDING** | 🔵 Blue / Gray | The endpoint has been newly created and is queued for its initial automated execution check by the background worker. |

### Transition Logic & Flapping Mitigation
- **Incident Escalation**: When an endpoint transitions from `UP` to `DOWN`, an incident alert record is created, and external notifications (Email / Webhook) are triggered.
- **Recovery Resolution**: When a failing endpoint succeeds on a subsequent check, its state automatically transitions back to `UP`, closing the open incident and sending a `RECOVERY` notification.
- **Flapping Protection**: Notifications are dispatched strictly upon status transitions (`UP ↔ DOWN`). Consecutive failures in the same down state do not spam notifications.

---

## 4. Telemetry & Historical Performance

### Latency Percentiles (Min, Max, Avg, P95)
The **Latency & Performance Telemetry** chart on each endpoint's detail view plots round-trip execution times in milliseconds:
- **Avg (Average)**: Arithmetic mean of all round-trip execution times in the selected period.
- **Min**: Fastest recorded response time.
- **Max**: Slowest recorded response spike or degradation.
- **P95 (95th Percentile)**: The latency threshold below which 95% of requests completed. P95 eliminates misleading outlier noise and provides the most accurate view of real-world user experience.

### Time-Range Filtering
Toggle between time ranges on the detail page:
- **24h**: Sub-minute granularity showing recent spikes and performance trends over the last 24 hours.
- **7d**: Weekly cyclical trend analysis.
- **30d**: Monthly SLA performance and long-term stability review.

### 90-Day Uptime SLA Tracking
Each endpoint detail page features a **90-Day Uptime Sparkline Bar**. Each segment represents a calendar day:
- **Green**: 100% operational uptime (all assertions passed).
- **Amber / Yellow**: Degraded uptime (one or more intermittent check failures occurred).
- **Red**: Severe downtime (outage recorded).
- Hover over any bar segment to view the exact date, check count, failure count, and uptime percentage.

---

## 5. Setting Up Alert Notifications

Manage workspace notification channels in **Settings & Preferences** (`/dashboard/settings`).

### Email Alert Recipients
- By default, your primary account registration email receives all critical downtime alerts.
- In **Settings > Alert Channels > Email Alert Recipients**, click **Add Recipient** to add team members, distribution lists, or on-call aliases (e.g., `devops-team@company.com`).
- To remove a secondary recipient, click the **Trash** icon.

### Webhook Dispatch (Slack, Discord, PagerDuty)
To route alerts into Slack or Discord channels:
1. In **Settings > Alert Channels**, check **Enable Webhook**.
2. Paste your incoming webhook URL into **Target Webhook Endpoint URL**:
   - Slack Incoming Webhook: `https://hooks.slack.com/services/...`
   - Discord Webhook: `https://discord.com/api/webhooks/...`
3. Click **Test Ping** to dispatch an immediate diagnostic payload and verify delivery.
4. Click **Save Settings**.

### Trigger Thresholds & Escalation
Under **Notification Trigger Rules**, customize how alerts fire:
- **Alert on DOWN**: Dispatches alerts when an endpoint fails health checks.
- **Alert on RECOVERY**: Sends automatic recovery confirmations once the service restores.
- **Consecutive Failures**: Configure whether alerts fire immediately on the 1st failure or wait for 2, 3, or 5 consecutive failures to prevent false alarms caused by transient network blips.

---

## 6. Troubleshooting & FAQ

### Common Error Messages

| Error Message | Cause | Resolution |
|---|---|---|
| `Request timed out after X ms` | Target server did not respond within the configured `timeoutMs`. | Increase timeout setting or optimize server response performance. |
| `HTTP status X not in expected list` | The server returned a status code (e.g. 404, 502) not in `expectedStatus`. | Check server error logs, or update expected status codes in monitor settings. |
| `Header assertion failed for [header]` | Required response header was missing or did not match assertion value. | Verify API response headers in API documentation or cURL. |
| `Body assertion failed: property [key] does not match` | JSON response payload lacked the expected key or held an unexpected value. | Inspect API payload structure and adjust the dot-notation path. |
| `Target domain not reachable / DNS lookup failed` | The domain name cannot be resolved by DNS. | Ensure domain is publicly registered with valid DNS records. |

### SSRF Safety Rejections
For infrastructure security, OrderInbox enforces multi-layer Server-Side Request Forgery (SSRF) defenses:
- Targets pointing to loopback addresses (`127.0.0.1`, `localhost`), link-local metadata endpoints (`169.254.169.254`), or private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) are strictly rejected.
- Dangerous internal service ports (e.g., Redis `6379`, Postgres `5432`, SSH `22`) are blocked.
- Ensure your target URLs point to valid, publicly accessible endpoints.

### Frequently Asked Questions

**Q: Can I temporarily disable a monitor without deleting its historical data?**  
A: Yes. On the endpoint catalog or detail page, click **Pause**. When ready to resume automated checks, click **Resume**.

**Q: How often can I run checks?**  
A: Standard intervals range from 60 seconds (1 minute) to 3600 seconds (1 hour).

**Q: How do I change my account password?**  
A: Navigate to **Settings > Security & Password**, enter your current password along with your new password (minimum 8 characters), and click **Update Password**.

---

*OrderInbox &bull; Developer-Grade API Monitoring Platform &copy; 2026*
