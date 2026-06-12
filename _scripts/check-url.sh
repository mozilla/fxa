#!/bin/bash -e

# Poll an HTTP endpoint until it responds, used to gate startup on service
# readiness. Args: $1=host/path (no scheme), $2=expected status (default 200),
# $3=human label (default $1). Emits a periodic heartbeat so a slow service is
# never mistaken for a hung one, and prints an actionable hint on timeout.

TARGET="$1"
EXPECTED="${2:-200}"
LABEL="${3:-$1}"

RETRY=240
echo "⏳ Waiting for ${LABEL} (http://${TARGET}, expect HTTP ${EXPECTED})..."

for i in $(seq 1 "$RETRY"); do
  if [ "$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "http://$TARGET")" == "$EXPECTED" ]; then
    echo "✅ ${LABEL} responded in ${SECONDS}s"
    exit 0
  fi
  # Heartbeat every 15s so the developer sees progress during long boots.
  if [ $((i % 15)) -eq 0 ]; then
    echo "   …still waiting on ${LABEL} (${SECONDS}s, attempt ${i}/${RETRY})"
  fi
  if [ "$i" -lt "$RETRY" ]; then
    sleep 1
  fi
done

echo "❌ Gave up on ${LABEL} after ${SECONDS}s (http://${TARGET})."
echo "   Hint: inspect 'pm2 status' and 'pm2 logs' for the service on this port."
exit 1
