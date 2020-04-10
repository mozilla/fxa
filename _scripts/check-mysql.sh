#!/bin/bash -e

PORT=${1:-3306}
RETRY=60
for i in $(eval echo "{1..$RETRY}"); do
  if echo PING | nc localhost "$PORT" | grep -q 'mysql'; then
    exit 0
  else
    if [ "$i" -lt $RETRY ]; then
      sleep 1
    fi
  fi
done

exit 1
