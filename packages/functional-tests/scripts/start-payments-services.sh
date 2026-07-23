#!/bin/bash -ex

# Starts only the services needed for payments-next functional tests.
# Lighter alternative to start-services.sh for the payments CI job.

DIR=$(dirname "$0")

cd "$DIR/../../../"

mkdir -p ~/.pm2/logs
mkdir -p artifacts/tests
chmod +x node_modules/@nestjs/cli/bin/nest.js

NODE_OPTIONS="--max-old-space-size=7168" NODE_ENV=test npx nx run-many \
    -t build \
    --parallel=2 \
    -p \
    123done \
    fxa-auth-server \
    fxa-content-server \
    fxa-profile-server \
    payments-next

# Spawn the pm2 daemon before concurrent `pm2 start` calls to avoid deadlock.
npx pm2 ping

NODE_OPTIONS="--max-old-space-size=7168" NODE_ENV=test npx nx run-many \
    -t start \
    --parallel=2 \
    --verbose \
    -p \
    123done \
    fxa-auth-server \
    fxa-content-server \
    fxa-profile-server \
    payments-next \
    | tee ~/.pm2/logs/startup.log

npx pm2 ls
