#!/bin/bash -e

# CI does not run Sync, so the Sync functional specs skip there.
if [ "$CI" == "true" ]; then
  echo Not running sync in CI. Exiting...
  exit 0
fi

function on_sigint() {
  echo "MySQL shutting down."
  docker stop sync
  exit 0
}

trap on_sigint INT

# Make sure the local sql instance is responsive
_scripts/check-mysql.sh

# Get the image before the db reset, and use a cached copy when the registry is down.
IMAGE=ghcr.io/mozilla-services/syncstorage-rs/syncserver-mysql:0.24.1
docker image inspect "$IMAGE" > /dev/null 2>&1 || docker pull --platform linux/amd64 "$IMAGE"

# Setup sync db user, syncstorage db, and tokenserver db.
docker exec mydb mysql -e 'DROP USER IF EXISTS sync;'
docker exec mydb mysql -e 'CREATE USER "sync"@"%" IDENTIFIED BY "test";'
docker exec mydb mysql -e 'DROP DATABASE IF EXISTS syncstorage;'
docker exec mydb mysql -e 'CREATE DATABASE syncstorage;'
docker exec mydb mysql -e 'GRANT ALL PRIVILEGES on syncstorage.* to "sync"@"%";'
docker exec mydb mysql -e 'DROP DATABASE IF EXISTS tokenserver;'
docker exec mydb mysql -e 'CREATE DATABASE tokenserver;'
docker exec mydb mysql -e 'GRANT ALL PRIVILEGES on tokenserver.* to "sync"@"%";'

# Start the sync server and token server on port 8000.
#  - Config modifications can be made by editing the
#    _dev/docker/sync/sync-for-fxa/config/local.toml file.
# Run detached so a failed start, such as a name conflict, stops the script.
SYNC_ID=$(docker run -d --rm --name sync -p 8000:8000 --platform linux/amd64 \
  -v "$PWD/_dev/docker/sync/sync-for-fxa/config/local.toml:/app/config/local.toml:ro" \
  "$IMAGE" --config=config/local.toml)
docker logs -f "$SYNC_ID" &

# Exit non-zero so PM2 does not report Sync as running when it never started.
_scripts/check-url.sh localhost:8000/__heartbeat__ 200 Sync || { docker stop "$SYNC_ID"; exit 1; }

# Keep script alive
while :; do read -r; done
