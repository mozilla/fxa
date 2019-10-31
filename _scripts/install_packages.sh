#!/bin/sh -ex
_scripts/check.sh

# Set ulimit, need it for npm
ulimit -S -n 2048 || echo "Setting ulimit failed"

cd packages

# Install and build fxa-shared first

cd fxa-shared
npm ci
cd ..

PATH=$PATH:$HOME/.cargo/bin

# Now for concurrently!
../node_modules/.bin/concurrently \
    "cd fxa-content-server; npm ci" \
    "cd fxa-auth-server; npm ci" \
    "cd fxa-auth-db-mysql; npm ci" \
    "cd browserid-verifier; npm ci" \
    "cd fxa-js-client; npm ci" \
    "cd fxa-customs-server; npm ci" \
    "cd fxa-event-broker; npm ci" \
    "cd fxa-payments-server; npm ci" \
    "cd fxa-profile-server; npm ci" \
    "cd 123done; npm ci" \
    "cd fortress; npm ci" \
    "cd fxa-geodb; npm ci" \
    "cd fxa-email-event-proxy; npm ci" \
    "cd fxa-dev-launcher; npm ci" \
    "cd fxa-support-panel ; npm ci"

cd ..
ln -sf node_modules/.bin/pm2 pm2
