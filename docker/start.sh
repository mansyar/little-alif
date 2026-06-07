#!/bin/sh
set -e

# Seeding triggers autoMigrate() via getDb() — tables are created before data is inserted.
# When the server starts, autoMigrate() is a no-op (migrations already applied).

echo "==> Seeding database..."
node --import tsx app/db/seed.ts

echo "==> Starting Nitro server..."
exec node .output/server/index.mjs
