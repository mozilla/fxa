#!/bin/bash -e

while IFS= read -r line
do
  echo "Running adb reverse for: $line"
  port=`echo "$line" | cut -d'#' -f1`
  # Edge case for profile server cdn
  if [ "$port" == "1111" ]; then
    adb reverse tcp:1111 tcp:1112
  fi
  adb reverse tcp:$port tcp:$port
done <  "_scripts/ports.txt"
