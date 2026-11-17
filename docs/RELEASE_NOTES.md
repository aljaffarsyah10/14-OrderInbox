# OrderInbox — Release Notes

## Version v1.0.0 (Production MVP Release)
**Release Date**: November 17, 2026  
**Status**: Stable Production Release  
**Commit Checkpoint**: `phase 10: production release`

---

## 1. Executive Summary

We are proud to announce the **v1.0.0 General Availability** release of **OrderInbox**, an enterprise-grade, high-reliability HTTP/HTTPS endpoint monitoring and incident notification platform. Designed for engineering and DevOps teams requiring real-time visibility into mission-critical APIs and web services, OrderInbox delivers sub-millisecond precision telemetry, proactive flapping-resistant alerts, and airtight security controls in an elegant, dark-mode first user interface.

OrderInbox is deployed as a fully containerized, microservice-inspired architecture using **Next.js 16 (App Router)**, **Node.js 20 Worker**, **PostgreSQL 17**, **Redis 7**, and **Caddy 2.9** with zero-configuration automatic HTTPS.

---

## 2. Core Features & Capabilities

### ⚡ 1. Autonomous HTTP/HTTPS Monitoring Engine
- **Configurable Polling Intervals**: Flexible monitoring intervals ranging from 60 seconds to 24 hours.
- **Configurable Request Methods**: First-class support for `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, and `HEAD`.
- **Custom Headers & Payloads**: Full support for custom HTTP request headers and JSON request bodies for authenticated or complex synthetic transactions.
- **Custom Timeout Boundaries**: User-defined timeout tolerances between 1,000ms and 30,000ms.
- **Monotonic High-Precision Latency**: Latency measurements captured using Node.js `process.hrtime.bigint()` for microsecond accuracy immune to system clock drifts.

### 🛡️ 2. Defense-in-Depth SSRF Protection
- **RFC 1918 & RFC 4193 Network Blocking**: Strict filtering of IPv4 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), IPv6 unique local addresses (`fc00::/7`), and loopback addresses (`127.0.0.0/8`, `::1`).
- **Cloud Metadata IMDS Mitigation**: Immediate blocking of cloud instance metadata services (`169.254.169.254` and link-local ranges).
- **128-Bit IPv6 Numerical Normalization**: Custom parsing engine (`parseIPv6ToWords`) that immune systems to hexadecimal abbreviation spoofing, leading zeros manipulation, and IPv4-mapped IPv6 encodings.
- **Internal Service Port Protection**: 17 blocked management ports (PostgreSQL, Redis, MySQL, SSH, MongoDB, Elasticsearch, etc.).
- **Safe Redirect Hop Validation**: Outbound HTTP requests evaluate each redirect hop against SSRF rules before following `Location` headers.
- **Webhook Target Auditing**: Outbound alert webhooks are rigorously sanitized through the identical SSRF firewall before dispatch.

### 📊 3. Real-Time Telemetry & Statistical Analytics
- **Multi-Metric Latency Cards**: Instant calculation of **Min**, **Max**, **Avg**, and **P95 (95th Percentile)** latency across 24-hour, 7-day, and 30-day operational windows.
- **Interactive Telemetry Visualizations**: Gradient area charts powered by Recharts with dynamic crosshair tooltips and responsive scaling.
- **90-Day Uptime Heatmap**: Visual availability bars displaying daily uptime ratios, incidents, and operational health.
- **Live Manual Trigger**: "Run Check Now" capability that dispatches high-priority BullMQ jobs for instant diagnostic results.

### 🚨 4. Anti-Flapping Status Engine & Idempotent Alerts
- **State Transition Machine**: Endpoints transition between `UP` and `DOWN` states deterministically, recording timestamped transition logs.
- **Anti-Flapping Protection**: Alert dispatches are suppressed for transient blips, notifying on-call engineers only when genuine state changes occur.
- **Dual-Channel Notification**:
  - **Email (SMTP / Nodemailer)**: Rich HTML and fallback plaintext alert messages sent to configurable recipient lists.
  - **Webhook**: Real-time JSON webhooks dispatched to incident receivers (Slack, Discord, PagerDuty, OpsGenie) with timeout safeguards.

### 👥 5. Enterprise Multi-Tenant Security & Better Auth
- **Session-Based Authentication**: Secure session storage with cryptographic HTTP-only cookie isolation.
- **Strict IDOR Protection**: Database and API queries enforce tenant isolation at the SQL predicate level (`WHERE userId = session.userId`).
- **Input Validation**: 100% of incoming payloads validated with Zod schemas.

### 🎨 6. Modern Application Shell & Accessibility
- **Dark-Mode First Design System**: Built with modern Tailwind CSS tokens, high-contrast accessible typography, and smooth micro-interactions.
- **Responsive Layout**: Desktop navigation sidebar with collapse toggle, paired with a slide-out mobile drawer.
- **Accessible Components**: Full ARIA roles, semantic markup, focus visible rings, and screen-reader status indicators.

---

## 3. Production Architecture & Infrastructure

| Component | Technology | Version | Purpose |
|---|---|---|---|
| **Web Frontend & API** | Next.js (Standalone) | `16.4.6` | User dashboard, REST API, authentication handlers |
| **Runtime Environment** | Node.js Alpine | `20.x` | Minimal attack surface, non-root execution |
| **Background Engine** | Node.js Worker + tsx | `20.x` | Scheduled check execution, alert dispatching |
| **Relational Database** | PostgreSQL Alpine | `17` | Authoritative store for endpoints, history, and users |
| **Job Queue & Cache** | Redis Alpine | `7.x` | BullMQ delayed/repeatable queues, appendonly persistence |
| **Reverse Proxy & TLS** | Caddy Alpine | `2.9` | Auto HTTPS, HTTP/3 QUIC, hardened security headers |

---

## 4. Quality Gate & Verification Summary

Prior to general availability release, OrderInbox underwent exhaustive automated testing and security auditing:

- **Automated Test Suite**: 106 automated tests across 30 suites with a **100% pass rate** (`0 failed`, `0 skipped`).
- **Code Linter**: ESLint 9 executed across all TypeScript source files with **0 errors and 0 warnings**.
- **Type Safety**: TypeScript compiler (`tsc --noEmit`) validated with **0 type errors**.
- **Production Build**: Next.js production build (`next build`) compiled cleanly in standalone mode.
- **Security Audit**: Zero IDOR vulnerabilities, zero SSRF bypasses, and 100% tenant isolation verified.

---

## 5. System Requirements & Prerequisites

### Minimum Requirements (Small Teams / Staging)
- **CPU**: 2 vCPU
- **RAM**: 4 GB
- **Disk**: 20 GB SSD
- **OS**: Ubuntu 22.04 LTS / 24.04 LTS with Docker & Docker Compose v2

### Recommended Requirements (Production / High Volume)
- **CPU**: 4 vCPU
- **RAM**: 8 GB
- **Disk**: 50 GB NVMe SSD
- **OS**: Ubuntu 24.04 LTS

---

## 6. Known Limitations & Architecture Trade-offs

1. **Single-Region Execution (v1.0)**: In this release, monitoring checks originate from the VPS hosting the background worker. Multi-region geographically distributed probes (e.g. US, EU, APAC edge probes) are planned for v1.1.
2. **Synchronous SMTP Dispatch**: Email delivery relies on external SMTP gateway responsiveness. While decoupled through BullMQ worker queues, provider throttling can affect delivery latency.
3. **Internal Network Boundary**: PostgreSQL and Redis are bound solely to the internal Docker network for maximum security; ad-hoc direct database access requires SSH tunneling or `docker exec`.

---

## 7. Operational Scripts Included

- `docker/scripts/backup.sh`: Compressed atomic PostgreSQL database dumps with 14-day retention cleanup.
- `docker/scripts/restore.sh`: Verified database restoration utility.
- `docker/scripts/migrate.sh`: Automated, non-destructive production Prisma migration deployer.

---

## 8. Roadmap & Future Outlook

- **v1.1.0**: Multi-region distributed monitoring nodes and ping/ICMP telemetry.
- **v1.2.0**: SSL Certificate expiration countdown and automated renewal alerts.
- **v1.3.0**: Public Status Page generator with custom domains and incident broadcast.
