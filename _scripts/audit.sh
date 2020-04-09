#!/bin/bash -e

FILE=.last-audit
NOW=$(date +%s)

function run_audit() {
  npm run audit
  echo $NOW > $FILE
}

if [ -f "$FILE" ]; then
  THRESHOLD=86400 # 24 hours
  EXISTING=$(< $FILE)
  DIFFERENCE=$(($NOW - $EXISTING))

  if [ "$DIFFERENCE" -ge "$THRESHOLD" ]; then
    run_audit
  else
    echo "Audited within the last 24 hours, skipping"
  fi
else
  echo "Creating an inital audit record"
  run_audit
fi
