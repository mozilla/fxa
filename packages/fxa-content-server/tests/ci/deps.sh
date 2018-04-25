#!/bin/bash -ex

# Create a separate store for deps to avoid dependency issues with the content server
mkdir -p deps/node_modules
cd deps

# Auth
git clone https://github.com/mozilla/fxa-auth-server.git --depth=1
cd fxa-auth-server
# Install devDeps for the Auth Server to get memory db
npm i &> /dev/null
LOG_LEVEL=error node ./node_modules/fxa-auth-db-mysql/bin/mem.js &
node ./scripts/gen_keys.js
SIGNIN_UNBLOCK_ALLOWED_EMAILS="^block.*@restmail\\.net$" SIGNIN_UNBLOCK_FORCED_EMAILS="^block.*@restmail\\.net$" npm start &> /dev/null &
cd ..

# OAuth

npm i mozilla/fxa-oauth-server &> /dev/null
cd node_modules/fxa-oauth-server
LOG_LEVEL=error NODE_ENV=dev node ./bin/server.js &
cd ../..

# Profile

npm i mozilla/fxa-profile-server &> /dev/null
cd node_modules/fxa-profile-server
npm i
LOG_LEVEL=error NODE_ENV=dev npm start &
cd ../..

# Verifier

npm i vladikoff/browserid-verifier#http &> /dev/null
cd node_modules/browserid-verifier
npm i vladikoff/browserid-local-verify#http &> /dev/null
PORT=5050 CONFIG_FILES=../../../tests/ci/config_verifier.json node server.js &
cd ../..

# Leave "deps"
cd ..
