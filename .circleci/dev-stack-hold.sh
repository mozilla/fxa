#!/bin/bash
#
# Keeps the dev-stack job alive so its services stay reachable over SSH.
#
# Usage: ./.circleci/dev-stack-hold.sh [minutes]
#
# Exits early when /tmp/release-stack appears. A docker xlarge burns 20
# credits/minute, so releasing the moment you are done is worth the keystroke.

set -euo pipefail

MINUTES="${1:-180}"
SENTINEL="${DEV_STACK_SENTINEL:-/tmp/release-stack}"
HEARTBEAT_SECONDS=60

deadline=$(( $(date +%s) + MINUTES * 60 ))

echo "Holding the stack for up to ${MINUTES} minutes."
echo "Run 'touch ${SENTINEL}' on this box to finish early."

while true; do
  now=$(date +%s)

  if [[ -f "${SENTINEL}" ]]; then
    echo "[hold] ${SENTINEL} found - releasing."
    exit 0
  fi

  if (( now >= deadline )); then
    echo "[hold] ${MINUTES} minute limit reached - shutting down."
    exit 0
  fi

  # Doubles as the keepalive that satisfies CircleCI's no_output_timeout.
  echo "[hold] $(( (deadline - now + 59) / 60 ))m remaining"
  npx pm2 ls --no-color 2>/dev/null || echo "[hold] pm2 not responding"

  sleep "${HEARTBEAT_SECONDS}"
done
