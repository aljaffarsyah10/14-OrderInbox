# ==============================================================================
# OrderInbox - Production Multi-Stage Dockerfile
# Optimized for Next.js 16 (Standalone) & Background Worker
# ==============================================================================

# Stage 1: Base Alpine Image with required OS packages
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Stage 2: Install all dependencies (including devDependencies for build & tsx)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Stage 3: Build Next.js application & generate Prisma client
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma Client for PostgreSQL
RUN npx prisma generate

# Build Next.js in Standalone output mode
RUN npm run build

# ------------------------------------------------------------------------------
# Target: app (Next.js Standalone Production Server)
# ------------------------------------------------------------------------------
FROM base AS app
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root system user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

# Automated healthcheck against internal API health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]

# ------------------------------------------------------------------------------
# Target: worker (Dedicated BullMQ Scheduler & Monitoring Engine)
# ------------------------------------------------------------------------------
FROM base AS worker
WORKDIR /app
ENV NODE_ENV=production

# Create non-root system user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 workeruser

# Copy node modules and Prisma client bindings
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy application source & worker code
COPY --chown=workeruser:nodejs . .

USER workeruser

# Execute worker monitoring engine & scheduler
CMD ["npx", "tsx", "worker/src/index.ts"]
