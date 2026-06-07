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

# Generate migration SQL files from schema (for programmatic migrate() at startup)
RUN pnpm exec drizzle-kit generate

# Extract seed data to JSON (so startup script doesn't need tsx to parse TypeScript)
RUN node --import tsx -e "\
  import { writeFileSync } from 'node:fs'; \
  import { SEED_LETTERS } from './app/db/seed-data'; \
  writeFileSync('./app/db/seed-data.json', JSON.stringify(SEED_LETTERS)); \
"

# =============================================================================
# Stage 3: Runner (production)
# =============================================================================
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install curl for health checks, tini for signal handling
RUN apk add --no-cache curl tini

# Copy production build artifacts (Nitro standalone — includes all bundled deps)
COPY --from=build /app/.output ./.output

# Copy migration files + seed data for startup script
COPY --from=build /app/app/db/migrations ./app/db/migrations
COPY --from=build /app/app/db/seed-data.json ./app/db/seed-data.json

# Install lightweight runtime deps for programmatic migration (no drizzle-kit/tsx)
RUN npm install --no-save drizzle-orm@0.38.4 @libsql/client@0.14.0

# Copy startup scripts
COPY docker/migrate.mjs ./docker/migrate.mjs
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
