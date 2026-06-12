#!/bin/bash

# Wait for the redis container to accept connections before app services boot,
# so a cold start doesn't produce a burst of ioredis connection errors.
# Non-fatal: ioredis reconnects on its own, so a slow redis only delays steady
# state rather than failing the stack.

# Authenticate when REDIS_PASSWORD is set (redis.sh starts redis with
# --requirepass); otherwise an authed redis replies NOAUTH and we'd wait the
# full timeout and warn falsely.
AUTH_ARGS=()
if [ -n "${REDIS_PASSWORD:-}" ]; then
  AUTH_ARGS=(--no-auth-warning -a "$REDIS_PASSWORD")
fi

RETRY=30
echo -e "\nChecking for redis..."
for i in $(seq 1 "$RETRY"); do
  REPLY=$(docker exec redis-server redis-cli "${AUTH_ARGS[@]}" ping 2>/dev/null)
  if echo "$REPLY" | grep -q PONG; then
    echo "✅ redis responded in ${i}s"
    exit 0
  fi
  sleep 1
done

echo "⚠️  redis did not respond after ${RETRY}s; continuing (services will retry)."
exit 0
