#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/../.."

# Make sure there is a common docker network fxa, so containers can
# communicate with one another if needed
_dev/pm2/create-docker-net.sh fxa
pm2 start _dev/pm2/infrastructure.config.js



# Check that mysql is up
_scripts/check-mysql.sh

echo "waiting for DB patches"
_scripts/check-db-patcher.sh

# Check that goaws simulator is up
echo "Waiting for goaws"
_scripts/check-url.sh localhost:4100/health

# Check firestore is up
echo "Waiting for firestore"
_scripts/check-url.sh localhost:9299/api/config
