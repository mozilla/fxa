#!/bin/sh -ex
_scripts/check.sh

# Set ulimit, need it for npm
ulimit -S -n 2048 || echo "Setting ulimit failed"

# Install and Setup all the projects

cd packages

# Install and build fxa-shared first

cd fxa-shared
npm ci
cd ..

PATH=$PATH:$HOME/.cargo/bin

# Now for concurrently!
../node_modules/.bin/concurrently \
    "cd fxa-content-server; npm ci; cp server/config/local.json-dist server/config/local.json" \
    "cd fxa-auth-server; npm ci; node ./scripts/gen_keys.js; node ./scripts/gen_vapid_keys.js; node ./fxa-oauth-server/scripts/gen_keys; ../../_scripts/clone-authdb.sh" \
    "cd fxa-auth-db-mysql; npm ci" \
    "cd fxa-email-service; cargo build --bin fxa_email_send; ../../_scripts/clone-authdb.sh" \
    "cd browserid-verifier; npm ci" \
    "cd fxa-js-client; npm ci; npx grunt sjcl" \
    "cd fxa-customs-server; npm ci" \
    "cd fxa-event-broker; npm ci" \
    "cd fxa-payments-server; npm ci" \
    "cd fxa-profile-server; npm ci; mkdir -p var/public/" \
    "cd 123done; npm i" \
    "cd fortress; npm i" \
    "cd fxa-geodb; npm i" \
    "cd fxa-email-event-proxy; npm i" \
    "cd fxa-support-panel ; npm ci"

cd ..
ln -sf node_modules/.bin/pm2 pm2
