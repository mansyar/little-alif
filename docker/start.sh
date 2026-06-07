#!/bin/sh
set -e

# autoMigrate() + seed run inside the Nitro server process on first getDb() call.
# No separate seed step needed — the server handles everything on startup.

echo "==> Starting Nitro server..."
exec node .output/server/index.mjs
