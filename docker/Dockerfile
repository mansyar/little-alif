# =============================================================================
# Stage 1: Dependencies (all — dev needed for build)
# =============================================================================
FROM node:24-alpine AS deps

WORKDIR /app

# Install pnpm globally via corepack
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

# Copy dependency manifests
COPY package.json pnpm-lock.yaml ./

# Install production + dev dependencies (dev is needed for build stage)
RUN pnpm install --frozen-lockfile

# =============================================================================
# Stage 2: Build
# =============================================================================
FROM node:24-alpine AS build

WORKDIR /app

# Install pnpm globally via corepack (needed for build scripts)
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the app (Nitro outputs to .output/)
ENV NODE_ENV=production
RUN pnpm build

# =============================================================================
# Stage 3: Runner (production)
# =============================================================================
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install pnpm, curl for health checks, tini for signal handling
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate && \
    apk add --no-cache curl tini

# Copy production build artifacts (Nitro standalone — includes all bundled deps)
COPY --from=build /app/.output ./.output

# Copy source files needed for auto-migration + seed at startup
# autoMigrate() requires the migration SQL files (app/db/migrations/)
# seed.ts requires the database schema + constants
COPY --from=build /app/app/db ./app/db
COPY --from=build /app/app/lib/constants ./app/lib/constants

# Install production deps for seed.ts (needs @libsql/client, drizzle-orm, etc.)
# Seed runs via tsx outside the Nitro standalone bundle
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

# Install tsx for running seed.ts at startup (TypeScript ESM loader)
RUN pnpm add tsx@^4.19.2 && pnpm store prune

# Copy startup script
COPY docker/start.sh ./docker/start.sh
RUN chmod +x docker/start.sh

# Ensure data directory exists for SQLite volume mount
RUN mkdir -p /app/data

# Run as non-root user for security
RUN addgroup -g 1001 -S app && adduser -S app -u 1001 -G app
RUN chown -R app:app /app
USER app

# NOTE: .env is intentionally NOT copied — secrets come from
# docker-compose.yml environment: or Coolify env vars.

EXPOSE 3000

# Health check (defense-in-defense — docker-compose also has one)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=15s \
  CMD curl -f http://localhost:3000/api/health || exit 1

# tini as PID 1 for proper signal handling (graceful shutdown on SIGTERM)
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["sh", "docker/start.sh"]
