#!/bin/sh
set -e

echo "==> Running startup tasks (migrations + seed)..."
node docker/migrate.mjs

echo "==> Starting Nitro server..."
exec node .output/server/index.mjs
