#!/bin/bash
NAME="patcher.mjs" # nodejs script's name here
RETRY=60

echo -e "\nChecking for DB patches..."

# Look for a process matching the script name
PATCHER_PID=$(pgrep -f "$NAME")

if [[ -z "$PATCHER_PID" ]]; then
  echo "✅ No DB patches needed"
  exit 0
fi

# Confirm the process is running
if ! ps -p "$PATCHER_PID" > /dev/null; then
  echo "⚠️ DB patcher process ($NAME, PID $PATCHER_PID) is not running. Skipping wait."
  exit 0
fi

for i in $(seq 1 $RETRY); do
  if ps -p "$PATCHER_PID" > /dev/null; then
    sleep 0.5
  else
    echo "✅ DB patches applied"
    exit 0
  fi
done

echo "❌ Timeout: DB patches did not finish in time."
exit 1
