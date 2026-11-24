#!/bin/bash -e

# CI does not run Sync.
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
IMAGE=ghcr.io/mozilla-services/syncstorage-rs/syncserver-mysql:0.25.2
docker image inspect "$IMAGE" > /dev/null 2>&1 || docker pull --platform linux/amd64 "$IMAGE"

# Local stack only: turn on tokenserver's Sync data deletion endpoint so the
# local auth server can delete a user's Sync data. Stage and prod get these
# settings from webservices-infra. Tokenserver verifies the requests against
# FxA's OAuth public key, which it only takes from config, so pass the public
# half of the local signing key. Before `yarn gen-keys` has created that key
# the endpoint stays disabled.
DELETE_SYNC_DATA_ENV=()
KEY_FILE=packages/fxa-auth-server/config/key.json
if [ -f "$KEY_FILE" ]; then
  DELETE_SYNC_DATA_ENV+=(
    -e SYNC_TOKENSERVER__FXA_DELETE_DATA_ENABLED=true
    -e SYNC_TOKENSERVER__FXA_ADMIN_ISSUER=http://localhost:3030
    -e SYNC_TOKENSERVER__FXA_OAUTH_PRIMARY_JWK__KTY="$(jq -r '.kty' "$KEY_FILE")"
    -e SYNC_TOKENSERVER__FXA_OAUTH_PRIMARY_JWK__ALG="$(jq -r '.alg // "RS256"' "$KEY_FILE")"
    -e SYNC_TOKENSERVER__FXA_OAUTH_PRIMARY_JWK__USE="$(jq -r '.use // "sig"' "$KEY_FILE")"
    -e SYNC_TOKENSERVER__FXA_OAUTH_PRIMARY_JWK__KID="$(jq -r '.kid' "$KEY_FILE")"
    -e SYNC_TOKENSERVER__FXA_OAUTH_PRIMARY_JWK__N="$(jq -r '.n' "$KEY_FILE")"
    -e SYNC_TOKENSERVER__FXA_OAUTH_PRIMARY_JWK__E="$(jq -r '.e' "$KEY_FILE")"
  )
fi

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
  "${DELETE_SYNC_DATA_ENV[@]}" \
  "$IMAGE" --config=config/local.toml)
docker logs -f "$SYNC_ID" &

# Exit non-zero so PM2 does not report Sync as running when it never started.
_scripts/check-url.sh localhost:8000/__heartbeat__ 200 Sync || { docker stop "$SYNC_ID"; exit 1; }

# Keep script alive
while :; do read -r; done
