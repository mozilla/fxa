#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/../.."

pm2 start _dev/pm2/infrastructure.config.js

echo "waiting for containers to start"
_scripts/check-url.sh localhost:4100/health
_scripts/check-url.sh localhost:9299/api/config
_scripts/check-mysql.sh
