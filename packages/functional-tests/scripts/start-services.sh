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
    --skip-nx-cache \
    --parallel=2 \
    -p \
    123done \
    fxa-admin-panel \
    fxa-admin-server \
    fxa-auth-server \
    fxa-content-server \
    fxa-profile-server \
    fxa-settings

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
