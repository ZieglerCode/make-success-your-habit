#!/bin/sh
set -eu

mkdir -p "$UPLOAD_DIR" "$PAYLOAD_MEDIA_DIR"
chown -R nextjs:nodejs /app/data

exec su-exec nextjs:nodejs "$@"
