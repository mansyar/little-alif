# =============================================================================
# Stage 1: Dependencies
# =============================================================================
FROM node:20-alpine AS deps

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
FROM node:20-alpine AS build

WORKDIR /app

# Install pnpm globally via corepack (needed for build scripts)
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the app (SSR output goes to .output/)
ENV NODE_ENV=production
RUN pnpm build

# =============================================================================
# Stage 3: Runner (production)
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install curl for Docker health checks
RUN apk add --no-cache curl

# Copy production build artifacts
COPY --from=build /app/dist ./dist

# Copy public assets (audio files, etc.)
COPY --from=build /app/public ./public

# Copy node_modules (production only — no devDependencies needed at runtime)
COPY --from=build /app/node_modules ./node_modules

# Copy package.json for metadata (not strictly needed but conventional)
COPY --from=build /app/package.json ./

# Copy the server entry wrapper
COPY docker/server-entry.mjs ./docker/server-entry.mjs

# Ensure data directory exists for SQLite volume mount
RUN mkdir -p /app/data

# Run as non-root user for security
RUN addgroup -g 1001 -S app && adduser -S app -u 1001 -G app
RUN chown -R app:app /app
USER app

EXPOSE 3000

CMD ["node", "docker/server-entry.mjs"]
