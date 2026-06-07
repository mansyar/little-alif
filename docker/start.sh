#!/bin/sh
set -e

# NOTE: Database migration runs automatically via autoMigrate() in app/db/index.ts
# on server startup — no manual drizzle-kit invocation needed.

echo "==> Seeding database..."
node --import tsx app/db/seed.ts

echo "==> Starting Nitro server..."
exec node .output/server/index.mjs
