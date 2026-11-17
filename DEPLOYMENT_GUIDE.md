# OrderInbox — Production Deployment & Operations Guide

Welcome to the official production deployment and operations guide for **OrderInbox**, an enterprise-grade HTTP/HTTPS monitoring and incident notification platform.

---

## 1. System Architecture Overview

In production, OrderInbox runs as a coordinated suite of containerized services managed by Docker Compose and protected by a Caddy reverse proxy:

```
                          [ Public Internet ]
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │     Caddy Reverse Proxy     │ (Ports 80, 443 / HTTPS)
                    │  - Let's Encrypt Auto-TLS   │
                    │  - Hardened Security Headers│
                    │  - Gzip / Zstd Compression  │
                    └──────────────┬──────────────┘
                                   │
               ┌───────────────────┴───────────────────┐
               │ Internal Bridge: orderinbox-network    │
               ▼                                       ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│    Next.js 16 Web App       │         │   Background Worker Engine  │
│  - App Router (Standalone)  │         │  - BullMQ Queue Consumer    │
│  - REST APIs & Auth         │         │  - HTTP Check Dispatcher    │
│  - Healthcheck /api/health  │         │  - SSRF Defense-in-depth    │
└──────────────┬──────────────┘         │  - Scheduler Synchronization│
               │                        └──────────────┬──────────────┘
               │                                       │
               ├───────────────────┬───────────────────┤
               ▼                                       ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│     PostgreSQL 17 DB        │         │        Redis 7 Cache        │
│  - Authoritative Store      │         │  - Job Queues (BullMQ)      │
│  - Isolated Internal Net    │         │  - Appendonly Persistence   │
│  - Persistent Docker Volume │         │  - Isolated Internal Net    │
└─────────────────────────────┘         └─────────────────────────────┘
```

> [!IMPORTANT]
> **Network Boundary Security**: PostgreSQL and Redis do **NOT** expose any ports to the public internet or the host machine. All database and queue access is restricted to the internal Docker bridge network (`orderinbox-network`).

---

## 2. Infrastructure & VPS Prerequisites

### Recommended Server Specifications
- **Operating System**: Ubuntu 22.04 LTS or 24.04 LTS (x86_64 or arm64)
- **Compute (vCPU)**: 2 vCPU minimum (4 vCPU recommended for >500 endpoints)
- **Memory (RAM)**: 4 GB minimum (8 GB recommended)
- **Storage**: 40 GB+ NVMe/SSD storage
- **Network**: Static Public IPv4 address

### Firewall Configuration (UFW)
Configure the host firewall to only permit SSH and web traffic:

```bash
# Allow OpenSSH (adjust port if using custom SSH port)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS for Caddy
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp comment "HTTP/3 QUIC"

# Enable firewall
sudo ufw enable
sudo ufw status verbose
```

---

## 3. Server Setup & Docker Installation

Execute the following commands on your Ubuntu VPS to install Docker and Docker Compose v2:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install essential dependencies
sudo apt install -y curl gnupg ca-certificates lsb-release

# 3. Add Docker official GPG key and repository
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker Engine and Docker Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Enable and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# 6. (Optional) Allow current non-root user to manage Docker
sudo usermod -aG docker "$USER"
newgrp docker

# 7. Verify installation
docker --version
docker compose version
```

---

## 4. DNS & Domain Configuration

Before starting Caddy, ensure your custom domain is pointing to the VPS:
1. Log in to your DNS provider (Cloudflare, Namecheap, Route53, etc.).
2. Create an **A Record**:
   - **Type**: `A`
   - **Name**: `monitor` (or `@` for apex domain)
   - **Value**: `<YOUR_VPS_PUBLIC_IPV4>`
   - **TTL**: Auto or 300s
3. Verify DNS propagation:
   ```bash
   dig +short monitor.yourdomain.com
   ```

---

## 5. Application Deployment

### Step 1: Clone Repository or Copy Artifacts
```bash
git clone https://github.com/your-org/OrderInbox.git /opt/orderinbox
cd /opt/orderinbox
```

### Step 2: Configure Production Environment Variables
Copy `.env.production.example` to `.env.production` and populate all production secrets:

```bash
cp .env.production.example .env.production
chmod 600 .env.production
nano .env.production
```

Key variables to generate:
- Generate `POSTGRES_PASSWORD`:
  ```bash
  openssl rand -base64 24
  ```
- Generate `REDIS_PASSWORD`:
  ```bash
  openssl rand -base64 24
  ```
- Generate `BETTER_AUTH_SECRET`:
  ```bash
  openssl rand -base64 32
  ```

Ensure `DATABASE_URL` and `REDIS_URL` match the generated passwords:
```dotenv
DATABASE_URL="postgresql://orderinbox_prod_user:<GENERATED_PG_PASSWORD>@postgres:5432/orderinbox_production?schema=public"
REDIS_URL="redis://:<GENERATED_REDIS_PASSWORD>@redis:6379"
DOMAIN_NAME=monitor.yourdomain.com
APP_URL=https://monitor.yourdomain.com
ACME_EMAIL=admin@yourdomain.com
```

### Step 3: Make Operational Scripts Executable
```bash
chmod +x docker/scripts/*.sh
```

### Step 4: Build and Start Containers
Build the container images and launch the services in the background:

```bash
# Build multi-stage Docker images
docker compose --env-file .env.production build

# Start services
docker compose --env-file .env.production up -d

# Verify all services are healthy and running
docker compose ps
```

You should see 5 services:
- `orderinbox-postgres`: `healthy`
- `orderinbox-redis`: `healthy`
- `orderinbox-app`: `healthy`
- `orderinbox-worker`: `running`
- `orderinbox-caddy`: `running`

### Step 5: Run Database Migrations
Deploy Prisma database migrations to create the required database tables:

```bash
docker/scripts/migrate.sh
```
Or directly:
```bash
docker compose exec -T app npx prisma migrate deploy
docker compose exec -T app npx prisma migrate status
```

> [!CAUTION]
> **Never** execute `prisma migrate dev` on a production database. Always use `prisma migrate deploy`.

---

## 6. Verification & Health Monitoring

### Internal Healthcheck Endpoint
OrderInbox exposes an automated healthcheck route at `/api/health`:

```bash
curl -i http://localhost:3000/api/health
```

Expected response (`HTTP 200 OK`):
```json
{
  "status": "ok",
  "timestamp": "2026-11-17T09:30:00.000Z",
  "uptimeSeconds": 142.5,
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

### Public Domain HTTPS Check
Verify external connectivity and SSL certificate provisioning:
```bash
curl -i https://monitor.yourdomain.com/api/health
```

Inspect security headers:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy: ...`

---

## 7. Production Smoke Test Procedure

Run this checklist immediately following initial deployment:

| # | Step | Action | Expected Result |
|---|---|---|---|
| 1 | **Landing Page** | Navigate to `https://monitor.yourdomain.com` | Homepage renders with feature highlights and Auth CTAs. |
| 2 | **User Registration** | Register a new administrator account via `/register` | Account created, session established, redirected to `/dashboard`. |
| 3 | **User Login & Logout** | Sign out, then sign back in via `/login` | Seamless session authentication, cookies stored with `Secure; HttpOnly`. |
| 4 | **Create Endpoint** | Go to `/dashboard/endpoints/new`, configure an endpoint (e.g. `https://httpbin.org/status/200`) | Endpoint saved, scheduled into BullMQ queue. |
| 5 | **Monitoring Execution** | Wait for scheduled interval or trigger check | Worker executes check, logs HTTP status code and latency. |
| 6 | **Manual Check** | Click "Run Check Now" on the endpoint details page | Immediate check execution, telemetry graph updates instantly. |
| 7 | **Monitoring History** | Inspect the History tab on `/dashboard/endpoints/[id]` | Check runs displayed with timestamp, HTTP status, and response latency. |
| 8 | **Telemetry & Statistics** | Inspect telemetry summary cards | Min, Max, Avg, and P95 latency stats computed dynamically. |
| 9 | **Pause & Resume** | Click "Pause", verify status, then click "Resume" | BullMQ repeat job cleanly unscheduled then rescheduled. |
| 10 | **Alert Notification** | Test endpoint pointing to invalid URL or status code | Status transitions to DOWN; alert queued and logged. |
| 11 | **Settings & Preferences** | Update recipient emails and webhook URL in `/dashboard/settings` | Settings saved into `user_settings` table. |

---

## 8. Backup & Disaster Recovery

### Automated Backup Script
OrderInbox includes a production-tested backup script at `docker/scripts/backup.sh`. It performs an atomic `pg_dump`, compresses the dump with `gzip -9`, verifies archive integrity, and applies a 14-day retention policy.

Run a manual backup:
```bash
docker/scripts/backup.sh
```

Backups are saved to `/opt/orderinbox/backups/orderinbox_backup_YYYYMMDD_HHMMSS.sql.gz`.

### Scheduling Nightly Automated Backups
Set up a cron job for automated daily backups at 02:00 UTC:

```bash
# Open crontab
crontab -e
```
Add the following line:
```cron
0 2 * * * /opt/orderinbox/docker/scripts/backup.sh >> /var/log/orderinbox_backup.log 2>&1
```

### Restoring from Backup
In the event of hardware failure or accidental data deletion, use `docker/scripts/restore.sh`:

```bash
# Restore specific backup file
docker/scripts/restore.sh /opt/orderinbox/backups/orderinbox_backup_20261117_020000.sql.gz
```

---

## 9. Day-2 Operations & Maintenance

### Viewing Service Logs
```bash
# Stream all logs
docker compose logs -f

# Stream specific service logs
docker compose logs -f app
docker compose logs -f worker
docker compose logs -f caddy
docker compose logs -f postgres
docker compose logs -f redis

# View last 100 log lines
docker compose logs --tail=100 worker
```

### Restarting Services
```bash
# Restart background worker (e.g. after code update)
docker compose restart worker

# Restart web app
docker compose restart app

# Graceful restart of all services
docker compose restart
```

### Updating to New Release
```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild container images
docker compose --env-file .env.production build

# 3. Apply any new migrations
docker/scripts/migrate.sh

# 4. Restart containers with zero-downtime recreation
docker compose --env-file .env.production up -d --remove-orphans
```

---

## 10. Troubleshooting FAQ

### 1. Caddy returns `502 Bad Gateway`
- **Cause**: Next.js app container is still compiling or restarting.
- **Remedy**: Check app health via `docker compose ps app` and inspect logs via `docker compose logs app`. Wait until healthcheck passes.

### 2. Redis Connection Warning / BullMQ stalled
- **Cause**: Redis password mismatch or Redis container restarted.
- **Remedy**: Verify `REDIS_PASSWORD` and `REDIS_URL` in `.env.production`. Run `docker compose restart worker`.

### 3. Worker stops processing jobs
- **Cause**: Unhandled queue exception or process terminated.
- **Remedy**: The worker is configured with `restart: unless-stopped`. Inspect `docker compose logs --tail=200 worker` to identify any failing endpoint jobs.

### 4. Let's Encrypt Rate Limit or ACME validation failure
- **Cause**: Domain DNS A record does not point to VPS or port 80/443 is blocked by firewall.
- **Remedy**: Verify port 80 and 443 are reachable (`sudo ufw status`), and verify DNS propagation using `dig monitor.yourdomain.com`.
