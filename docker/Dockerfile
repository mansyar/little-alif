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

# Install curl for Docker health checks, tini for signal handling
RUN apk add --no-cache curl tini

# Install pnpm (needed for db:push / db:seed post-deploy hooks)
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

# Copy production build artifacts (Nitro standalone — includes all bundled deps)
COPY --from=build /app/.output ./.output

# Copy package.json and lockfile for targeted installs
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-lock.yaml ./

# Copy source files needed for DB operations (drizzle-kit push, seed)
COPY --from=build /app/drizzle.config.ts ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/app/db ./app/db
COPY --from=build /app/app/lib/constants ./app/lib/constants

# Install only drizzle-kit + tsx (for post-deploy DB hooks), then clean cache
# TODO: remove these once DB migrations are done via external tooling
RUN pnpm add drizzle-kit@^0.30.1 tsx@^4.19.2 && pnpm store prune

# Ensure data directory exists for SQLite volume mount
RUN mkdir -p /app/data

# Run as non-root user for security
RUN addgroup -g 1001 -S app && adduser -S app -u 1001 -G app
RUN chown -R app:app /app
USER app

# NOTE: .env is intentionally NOT copied — secrets come from
# docker-compose.yml environment: or Coolify env vars.

EXPOSE 3000

# Health check (defense-in-depth — docker-compose also has one)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=15s \
  CMD curl -f http://localhost:3000/api/health || exit 1

# tini as PID 1 for proper signal handling (graceful shutdown on SIGTERM)
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", ".output/server/index.mjs"]
