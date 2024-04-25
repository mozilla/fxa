#!/bin/bash -e
RETRY=60
CONTAINER_NAME="mydb"

for i in $(eval echo "{1..$RETRY}"); do
  if DOCKER_CLI_HINTS=false docker exec -it $CONTAINER_NAME /bin/bash -c 'mysqladmin ping' > /dev/null; then
    echo "MySQL DB is ready"
    exit 0
  else
    if [ "$i" -lt $RETRY ]; then
      echo "MySQL DB could not be reached, trying again"
      sleep 1
    fi
  fi
done
echo "MySQL DB Could not be reached, please double check your docker setup"
exit 1
