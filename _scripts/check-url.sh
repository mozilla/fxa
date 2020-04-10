#!/bin/bash -e

RETRY=30
for i in $(eval echo "{1..$RETRY}"); do
  if [ "$(curl -s -o /dev/null --silent -w "%{http_code}"  http://$1)" == "${2:-200}" ]; then
    exit 0
  else
    if [ "$i" -lt $RETRY ]; then
      sleep 1
    fi
  fi
done

exit 1
