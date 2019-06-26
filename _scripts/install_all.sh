#!/bin/sh -ex
_scripts/check.sh

# Set ulimit, need it for npm
ulimit -S -n 2048 || echo "Setting ulimit failed"

# Install and Setup all the projects

cd packages

cd fxa-content-server; npm ci; cp server/config/local.json-dist server/config/local.json; cd ..

cd fxa-auth-server
npm ci
node ./scripts/gen_keys.js
node ./scripts/gen_vapid_keys.js
node ./fxa-oauth-server/scripts/gen_keys
../../_scripts/clone-authdb.sh
cd ..

cd fxa-auth-db-mysql; npm ci; cd ..

# cd fxa-auth-server; npm link ../fxa-auth-db-mysql; cd ..

PATH=$PATH:$HOME/.cargo/bin
cd fxa-email-service;
cargo build --bin fxa_email_send;
../../_scripts/clone-authdb.sh
cd ..

cd browserid-verifier; npm ci; cd ..

cd fxa-js-client; npm ci; cd ..

cd fxa-customs-server; npm ci; cd ..

cd fxa-event-broker; npm ci; cd ..

cd fxa-oauth-console; npm ci; cd ..

cd fxa-payments-server; npm ci; cd ..

# cd fxa-auth-server/fxa-oauth-server; npm ci; cd ../..

cd fxa-profile-server; npm ci; mkdir -p var/public/; cd ..

cd fxa-basket-proxy; npm ci; cd ..

# 123done does not have an npm-shrinkwrap.json file and cannot use `npm ci`
cd 123done; npm i; cd ..

cd fxa-shared; npm ci; cd ..

cd fxa-geodb; npm i; cd ..

cd fxa-email-event-proxy; npm ci; cd ..

cd support-panel ; npm ci; cd ..

cd ..

docker network create fxa-net || true

docker pull memcached

docker pull mozilla/syncserver

docker pull mozilla/pushbox

docker pull pafortin/goaws

docker pull redis

docker pull mysql/mysql-server:5.6

docker pull jdlk7/firestore-emulator

docker pull knarz/pubsub-emulator

ln -sf node_modules/.bin/pm2 pm2
