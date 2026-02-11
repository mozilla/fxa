#!/bin/bash -e

occupied=()
while IFS= read -r line
do
  port=`echo "$line" | cut -d'#' -f1`
  if echo PING | nc localhost $port >/dev/null; then
    occupied=("${occupied[@]}" "$port")
  fi
done < "_scripts/ports.txt"

if [ ${#occupied[@]} -ge 1 ]; then
  echo "Heads up! Some required ports are already occupied and may cause problems: ${occupied[@]}"
fi
