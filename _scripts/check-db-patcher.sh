#!/bin/bash
RETRY=60

echo -e "\nChecking for DB patches..."

# Strategy: poll PM2 logs for the patcher outcome. This avoids the race
# condition where the patcher starts and finishes before we can pgrep it
# (common when all DBs are already at target level).

echo "⏳ Waiting for DB patches to complete..."
for i in $(seq 1 $RETRY); do
  if command -v pm2 >/dev/null 2>&1; then
    LOG_OUTPUT=$(pm2 logs mysql --lines 100 --nostream 2>/dev/null)

    # Check for failure first
    if echo "$LOG_OUTPUT" | grep -qE "Failed to patch|Error:.*patch"; then
      echo "📋 Patch Summary:"
      echo "$LOG_OUTPUT" | \
        grep -E "(Successfully patched|Error:|Failed to patch)" | \
        sed 's/.*|mysql[[:space:]]*|[[:space:]]*//' | sed 's/\x1b\[[0-9;]*m//g' | \
        sort -u | tail -20 | \
        while read line; do
          if [[ $line =~ ^Successfully ]]; then
            echo "  ✅ $line"
          elif [[ $line =~ ^Error: ]]; then
            echo "  ❌ $line"
          elif [[ $line =~ ^Failed ]]; then
            echo "  💥 $line"
          fi
        done
      echo "❌ DB patches failed"
      exit 1
    fi

    # Check for success — need all 4 databases
    SUCCESS_COUNT=$(echo "$LOG_OUTPUT" | grep -c "Successfully patched" 2>/dev/null || echo "0")
    if [[ "$SUCCESS_COUNT" -ge 4 ]]; then
      echo "📋 Patch Summary:"
      echo "$LOG_OUTPUT" | \
        grep -E "Successfully patched" | \
        sed 's/.*|mysql[[:space:]]*|[[:space:]]*//' | sed 's/\x1b\[[0-9;]*m//g' | \
        sort -u | tail -20 | \
        while read line; do
          echo "  ✅ $line"
        done
      echo "✅ DB patches applied successfully"
      exit 0
    fi
  fi

  sleep 1
done

echo "❌ Timeout: DB patches did not complete in 60 seconds."
exit 1
