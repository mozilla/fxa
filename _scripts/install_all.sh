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

git clone https://github.com/mozilla/fxa-oauth-server.git &
git clone https://github.com/mozilla/fxa-oauth-console.git &

git clone https://github.com/mozilla/fxa-profile-server.git &

git clone https://github.com/mozilla/fxa-basket-proxy.git &

git clone https://github.com/mozilla/123done.git -b oauth &

wait

# Install and Setup all the projects

cd fxa-content-server; npm i --production; npm i; cp server/config/local.json-dist server/config/local.json; cd ..

cd fxa-auth-server; npm i; node ./scripts/gen_keys.js; node ./scripts/gen_vapid_keys.js ; cd ..

cd fxa-auth-db-mysql; npm i; cd ..

cd fxa-auth-server; npm link ../fxa-auth-db-mysql; cd ..

cd fxa-email-service; rustup override set nightly-2018-08-06; cargo build --bin fxa_email_send; cd ..

cd browserid-verifier; npm i; cd ..

cd fxa-oauth-server; npm i; cd ..

cd fxa-profile-server; npm i; mkdir -p var/public/; cd ..

cd fxa-basket-proxy; npm i; cd ..

cd 123done; npm i; cd ..

docker pull memcached

docker pull mozilla/syncserver

docker pull pafortin/goaws

docker pull redis

docker pull mysql/mysql-server:5.6

ln -sf node_modules/.bin/pm2 pm2
