#!/bin/sh -ex
_scripts/check.sh

# Set ulimit, need it for npm
ulimit -S -n 2048 || echo "Setting ulimit failed"

# Clone all the projects

git clone https://github.com/mozilla/fxa-content-server.git &
git clone https://github.com/mozilla/fxa-content-server-l10n.git &

git clone https://github.com/mozilla/fxa-js-client.git &

git clone https://github.com/mozilla/fxa-auth-server.git &
git clone https://github.com/mozilla/fxa-auth-db-mysql.git &

git clone https://github.com/mozilla/fxa-email-service.git &

git clone https://github.com/mozilla/fxa-customs-server.git &

git clone https://github.com/mozilla/browserid-verifier.git &

git clone https://github.com/mozilla/fxa-oauth-console.git &

git clone https://github.com/mozilla/fxa-profile-server.git &

git clone https://github.com/mozilla/fxa-basket-proxy.git &

git clone https://github.com/mozilla/123done.git -b oauth &

wait

# Install and Setup all the projects

cd fxa-content-server; npm ci; cp server/config/local.json-dist server/config/local.json; cd ..

cd fxa-auth-server; npm ci; node ./scripts/gen_keys.js; node ./scripts/gen_vapid_keys.js; node ./fxa-oauth-server/scripts/gen_keys; cd ..

cd fxa-auth-db-mysql; npm ci; cd ..

cd fxa-auth-server; npm link ../fxa-auth-db-mysql; cd ..

cd fxa-email-service; cargo build --bin fxa_email_send; cd ..

cd browserid-verifier; npm ci; cd ..

cd fxa-auth-server/fxa-oauth-server; npm ci; cd ../..

cd fxa-profile-server; npm ci; mkdir -p var/public/; cd ..

cd fxa-basket-proxy; npm ci; cd ..

# 123done does not have an npm-shrinkwrap.json file and cannot use `npm ci`
cd 123done; npm i; cd ..

docker network create fxa-net || true

docker pull memcached

docker pull mozilla/syncserver

docker pull mozilla/pushbox

docker pull pafortin/goaws

docker pull redis

docker pull mysql/mysql-server:5.6

docker pull mozilla/channelserver

ln -sf node_modules/.bin/pm2 pm2
