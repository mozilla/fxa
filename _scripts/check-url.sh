#!/bin/bash -e

echo "Checking for response from: $1"


RETRY=120
for i in $(eval echo "{1..$RETRY}"); do
  if [ "$(curl -s -o /dev/null --silent -w "%{http_code}"  http://$1)" == "${2:-200}" ]; then
    echo "$1 responded in $SECONDS seconds"
    exit 0
  else
    if [ "$i" -lt $RETRY ]; then
      sleep 1
    fi
  fi
done
echo "Giving up after $SECONDS seconds. Failed to get response from: $1"
exit 1
