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

# Make sure the docker image that runs sync is up to date, and then run it.
#  - Because image layers are cached by docker, the first build may take a
#    second, but subsequent builds should have hardly any overhead.
#  - Note that config modifications can be made by editing the
#    config/local.toml file.
cd _dev/docker/sync/sync-for-fxa
docker build . --tag sync-for-fxa
cd ../../../..

# Start the sync server and token server on port 8000
docker run --rm --name sync -p 8000:8000  sync-for-fxa &

# Adds some rows to the sync database that are needed.
_scripts/sync-populate.sh

# Keep script alive
while :; do read -r; done
