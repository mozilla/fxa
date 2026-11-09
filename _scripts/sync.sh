#!/bin/bash -e

# We currently don't want don't want to spin this up in the CI, since
# we don't have any functional Sync tests at the moment.
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
docker run --rm --name sync -p 8000:8000 \
  -v "$PWD/_dev/docker/sync/sync-for-fxa/config/local.toml:/app/config/local.toml:ro" \
  ghcr.io/mozilla-services/syncstorage-rs/syncserver-mysql:0.24.1 \
  --config=config/local.toml &

# Keep script alive
while :; do read -r; done
