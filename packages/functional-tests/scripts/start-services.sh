#!/bin/bash -ex

# This startup routine is seperate from the test command. This way it can be run in a
# separate step in the CI, which results in more meaningful timing metrics.

DIR=$(dirname "$0")

cd "$DIR/../../../"

mkdir -p ~/.pm2/logs
mkdir -p artifacts/tests
chmod +x node_modules/@nestjs/cli/bin/nest.js

# Build the apps before starting them. `start` no longer depends on `build`
# (#20688), and a cached `build` does not recreate gitignored outputs (e.g.
# email-renderer's public/locales), so services would otherwise crash or hang
# on missing artifacts at boot.
#
# Most apps run from source here (ts-node and webpack dev servers), so
# build-fast is enough: it builds their dependencies and generated assets but
# skips their own tsc and production bundles. This matches `yarn start mza`.
# 123done and fxa-profile-server need nothing beyond those dependencies; the
# builds below already cover theirs (mainly fxa-shared's dist).
NODE_OPTIONS="--max-old-space-size=7168" NODE_ENV=test npx nx run-many \
    -t build-fast \
    --parallel=4 \
    -p \
    fxa-admin-panel \
    fxa-admin-server \
    fxa-auth-server \
    fxa-content-server \
    fxa-settings

# The environment the services inherit from the pm2 client.
export NODE_OPTIONS="--max-old-space-size=7168" NODE_ENV=test
STACK=packages/functional-tests/scripts/pm2.stack.config.js

# One pm2 client starts each group, so there are no concurrent `pm2 start`
# calls to deadlock the daemon. Apps that need neither keys nor the database
# start first, so the settings dev server compiles while those are prepared.
FXA_STACK_GROUP=early npx pm2 start $STACK

pids=()
(cd packages/fxa-auth-server && yarn gen-keys) &
pids+=($!)
(cd packages/fxa-admin-server && yarn gen-keys) &
pids+=($!)
# CI sets this when it hasn't run the migrations already.
if [[ "$RUN_DB_MIGRATIONS" == "true" || "$RUN_DB_MIGRATIONS" == "1" ]]; then
  node packages/db-migrations/bin/patcher.mjs &
  pids+=($!)
fi
for pid in "${pids[@]}"; do
  wait "$pid"
done

FXA_STACK_GROUP=late npx pm2 start $STACK

# Wait for every service at once rather than one after another.
checks=(
  "localhost:3030/bundle/app.bundle.js fxa-content-server"
  "localhost:3000/settings/static/js/bundle.js fxa-settings"
  "localhost:9000/__heartbeat__ fxa-auth-server"
  "localhost:1111/__heartbeat__ fxa-profile-server"
  "localhost:8095/__heartbeat__ fxa-admin-server"
  "localhost:8091 fxa-admin-panel"
  "localhost:8080 123done"
  "localhost:10139 321done"
)
pids=()
for check in "${checks[@]}"; do
  read -r url label <<<"$check"
  _scripts/check-url.sh "$url" 200 "$label" &
  pids+=($!)
done
for pid in "${pids[@]}"; do
  wait "$pid"
done

npx pm2 ls
