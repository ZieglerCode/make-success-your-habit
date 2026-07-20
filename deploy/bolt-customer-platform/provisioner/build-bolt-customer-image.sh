#!/usr/bin/env bash
set -euo pipefail

PLATFORM_ROOT=/data/bolt-customer-platform
BOLT_SOURCE=/data/bolt-diy/src
OVERLAY_ROOT="$PLATFORM_ROOT/bolt-overlay"
EXPECTED_BOLT_COMMIT=5d3fb1d7def677bc8c9d89fed595f58aa454e0b9

actual_commit=$(git -C "$BOLT_SOURCE" rev-parse HEAD)

if [ "$actual_commit" != "$EXPECTED_BOLT_COMMIT" ]; then
  echo "Bolt source is at $actual_commit; expected $EXPECTED_BOLT_COMMIT" >&2
  echo "Review and rebase the customer persistence overlay before building." >&2
  exit 1
fi

install -m 0644 \
  "$OVERLAY_ROOT/app/lib/stores/files.ts" \
  "$BOLT_SOURCE/app/lib/stores/files.ts"
install -m 0644 \
  "$OVERLAY_ROOT/app/lib/persistence/projectSnapshots.client.ts" \
  "$BOLT_SOURCE/app/lib/persistence/projectSnapshots.client.ts"
install -m 0644 \
  "$OVERLAY_ROOT/app/components/chat/BaseChat.tsx" \
  "$BOLT_SOURCE/app/components/chat/BaseChat.tsx"

git -C "$BOLT_SOURCE" diff --check

docker build \
  --target bolt-ai-production \
  -t bolt-diy:customer-persistence \
  "$BOLT_SOURCE"

docker build \
  -t bolt-project-storage:local \
  "$PLATFORM_ROOT/provisioner/storage-service"
