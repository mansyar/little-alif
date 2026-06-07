#!/bin/sh
set -e

echo "==> Syncing database schema..."
npx drizzle-kit push --force --config drizzle.config.ts

echo "==> Seeding database..."
node --import tsx app/db/seed.ts

echo "==> Starting Nitro server..."
exec node .output/server/index.mjs
