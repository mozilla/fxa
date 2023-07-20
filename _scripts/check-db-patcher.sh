#!/bin/bash
NAME="patcher.mjs" # nodejs script's name here
RETRY=60

# Wait for $NAME script to start
for i in $(eval echo "{1..$RETRY}"); do
  if [[ $(pgrep -f $NAME) == "" ]]; then
    sleep 1
  else
    break;
  fi
done

# Wait for $NAME script to finish
for j in $(eval echo "{1..$RETRY}"); do
  if [[ $(pgrep -f $NAME) == "" ]]; then
    exit 0
  else
    if [ "$j" -lt $RETRY ]; then
      sleep 1
    fi
  fi
done

exit 1
