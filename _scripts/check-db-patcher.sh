#!/bin/bash
NAME="patcher.mjs" # nodejs script's name here
RETRY=60

echo -e "\nChecking for DB patches..."

# Wait for patcher process to appear
echo "⏳ Waiting for patcher process to start..."
for i in $(seq 1 $RETRY); do
  PATCHER_PID=$(pgrep -f "$NAME")
  if [[ -n "$PATCHER_PID" ]]; then
    echo "🔄 Patcher process found (PID: $PATCHER_PID)"
    break
  fi
  if [[ $i -eq $RETRY ]]; then
    echo "❌ Timeout: Patcher process did not start in time"
    exit 1
  fi
  sleep 1
done

# Confirm the process is running
if ! ps -p "$PATCHER_PID" > /dev/null; then
  echo "⚠️ DB patcher process ($NAME, PID $PATCHER_PID) is not running. Skipping wait."
  exit 0
fi

for i in $(seq 1 $RETRY); do
  if ps -p "$PATCHER_PID" > /dev/null; then
    sleep 0.5
  else
    # Show patch summary from PM2 logs (deduplicated)
    echo "📋 Patch Summary:"
    if command -v pm2 >/dev/null 2>&1; then
      pm2 logs mysql --lines 50 --nostream 2>/dev/null | \
        grep -E "(Successfully patched|Error:|Failed to patch)" | \
        sed 's/.*|mysql[[:space:]]*|//' | \
        sort -u | \
        tail -20 | \
        while read line; do
          if [[ $line =~ ^Successfully ]]; then
            echo "  ✅ $line"
          elif [[ $line =~ ^Error: ]]; then
            echo "  ❌ $line"
          elif [[ $line =~ ^Failed ]]; then
            echo "  💥 $line"
          fi
        done
    fi

    # Check if there were any errors in the logs
    has_errors=$(pm2 logs mysql --lines 50 --nostream 2>/dev/null | grep -c "Error:\|Failed to patch" 2>/dev/null || echo "0")

    if [[ ! "$has_errors" =~ ^[0-9]+$ ]]; then
      has_errors=0
    fi

    if [[ $has_errors -eq 0 ]]; then
      echo "✅ DB patches applied successfully"
      exit 0
    else
      echo "❌ DB patches failed"
      exit 1
    fi
  fi
done

echo "❌ Timeout: DB patches did not finish in time."
exit 1
