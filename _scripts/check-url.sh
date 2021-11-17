#!/bin/bash -e

RETRY=60
for i in $(eval echo "{1..$RETRY}"); do
  if [ "$(curl -s -o /dev/null --silent -w "%{http_code}"  http://$1)" == "${2:-200}" ]; then
    echo "took $SECONDS seconds"
    exit 0
  else
    if [ "$i" -lt $RETRY ]; then
      sleep 1
    fi
  fi
done
echo "giving up after $SECONDS seconds"
exit 1
