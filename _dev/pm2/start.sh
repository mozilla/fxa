#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/../.."

# Make sure there is a common docker network fxa, so containers can
# communicate with one another if needed
_dev/pm2/create-docker-net.sh fxa

# Searches for and extracts gql queries from code
yarn gql:allowlist

pm2 start _dev/pm2/infrastructure.config.js

echo "waiting for containers to start..."

_scripts/check-url.sh localhost:4100/health
_scripts/check-url.sh localhost:9299/api/config
_scripts/check-mysql.sh

echo "containers started"
