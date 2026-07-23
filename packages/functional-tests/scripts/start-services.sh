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
# email-renderer's public/locales, content-server's app/dist bundle), so
# services would otherwise crash or hang on missing artifacts at boot. Force a
# fresh build here so the started services have everything they need.
NODE_OPTIONS="--max-old-space-size=7168" NODE_ENV=test npx nx run-many \
    -t build \
    --parallel=4 \
    -p \
    123done \
    fxa-admin-panel \
    fxa-admin-server \
    fxa-auth-server \
    fxa-content-server \
    fxa-profile-server \
    fxa-settings

# Pre-start the pm2 daemon once. Every service's `start` script runs
# `pm2 start`, so when several run concurrently they otherwise race to spawn
# the shared pm2 daemon and can deadlock (the pm2 client hangs forever waiting
# on the daemon RPC). Pinging first guarantees the daemon is already up so the
# concurrent `pm2 start` calls just connect to it.
npx pm2 ping

# Start the services with limited parallelism. Even with the daemon already
# running, keep this at 2 (matching the value used before the nx upgrade) to
# avoid overwhelming the single pm2 daemon with many simultaneous `pm2 start`
# connections during service boot.
NODE_OPTIONS="--max-old-space-size=7168" NODE_ENV=test npx nx run-many \
    -t start \
    --parallel=2 \
    --verbose \
    -p \
    123done \
    fxa-admin-panel \
    fxa-admin-server \
    fxa-auth-server \
    fxa-content-server \
    fxa-profile-server \
    fxa-settings \
    | tee ~/.pm2/logs/startup.log

npx pm2 ls
