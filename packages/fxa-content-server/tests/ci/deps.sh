#!/bin/bash -ex

# Auth
npm i mozilla/fxa-auth-server
cd node_modules/fxa-auth-server
LOG_LEVEL=error node ./node_modules/fxa-auth-db-mysql/bin/mem.js &
node ./scripts/gen_keys.js
LOG_LEVEL=error npm start &
cd ../..

# OAuth

npm i mozilla/fxa-oauth-server
cd node_modules/fxa-oauth-server
NODE_ENV=dev node ./bin/server.js &
cd ../..

# Profile
npm i mozilla/fxa-profile-server
cd node_modules/fxa-profile-server
npm i
# issue https://github.com/mozilla/fxa-profile-server/issues/138
npm i rimraf@^2.2.8
NODE_ENV=dev npm start &
cd ../..

# Verifier

npm i vladikoff/browserid-verifier#http
cd node_modules/browserid-verifier
npm i vladikoff/browserid-local-verify#http
PORT=5050 node server.js &
cd ../..
