#!/bin/bash

# Clone all the projects

git clone https://github.com/mozilla/fxa-content-server.git &
git clone https://github.com/mozilla/fxa-auth-server.git &
git clone https://github.com/vladikoff/browserid-verifier.git -b http &

git clone https://github.com/mozilla/fxa-oauth-server.git &
git clone https://github.com/mozilla/fxa-oauth-console.git &

git clone https://github.com/mozilla/fxa-profile-server.git &

git clone https://github.com/mozilla/123done.git -b oauth &

git clone https://github.com/mozilla-services/loop-server.git &

wait

# Install and Setup all the projects

cd fxa-content-server && npm i && cp server/config/local.json-dist server/config/local.json && cd ..

cd fxa-auth-server && npm i && node ./scripts/gen_keys.js && cd ..
# Install a custom http only verifier
cd browserid-verifier && npm i && npm i vladikoff/browserid-local-verify#http && cd ..

cd fxa-oauth-server && npm i && cd ..
cd fxa-oauth-console && npm i && cd ..

cd fxa-profile-server && npm i && mkdir -p var/public/ && cd ..

cd 123done && npm i && node ./scripts/gen_keys.js &&  cp config-local.json config.json && cd ..

cd loop-server && npm i && cd ..

ln -s node_modules/.bin/pm2 pm2
