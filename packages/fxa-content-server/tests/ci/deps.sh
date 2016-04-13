#!/bin/bash -ex

# Create a separate store for deps to avoid dependency issues with the content server
mkdir -p deps/node_modules
cd deps

# Auth
npm i mozilla/fxa-auth-server
cd node_modules/fxa-auth-server
# Install devDeps for the Auth Server to get memory db
npm i
LOG_LEVEL=error node ./node_modules/fxa-auth-db-mysql/bin/mem.js &
node ./scripts/gen_keys.js
npm start &> /dev/null &
cd ../..

# OAuth

npm i mozilla/fxa-oauth-server
cd node_modules/fxa-oauth-server
LOG_LEVEL=error NODE_ENV=dev node ./bin/server.js &
cd ../..

# Profile

npm i mozilla/fxa-profile-server
cd node_modules/fxa-profile-server
npm i
LOG_LEVEL=error NODE_ENV=dev npm start &
cd ../..

# Verifier

npm i vladikoff/browserid-verifier#http
cd node_modules/browserid-verifier
npm i vladikoff/browserid-local-verify#http
PORT=5050 CONFIG_FILES=../../../tests/ci/config_verifier.json node server.js &
cd ../..

# Leave "deps"
cd ..
