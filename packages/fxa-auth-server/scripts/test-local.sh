#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/.."

rm -rf coverage

if [ -z "$NODE_ENV" ]; then export NODE_ENV=dev; fi;
if [ -z "$CORS_ORIGIN" ]; then export CORS_ORIGIN="http://foo,http://bar"; fi;
if [ -z "$FIRESTORE_EMULATOR_HOST" ]; then export FIRESTORE_EMULATOR_HOST="localhost:9090"; fi;

if [[ ! -e config/secret-key.json ]]; then
  node -r esbuild-register ./scripts/gen_keys.js
fi

if [[ ! -e config/vapid-keys.json ]]; then
  node -r esbuild-register ./scripts/gen_vapid_keys.js
fi

if [[ ! -e config/key.json ]]; then
  node -r esbuild-register ./scripts/oauth_gen_keys.js
fi

npx jest --no-coverage --forceExit "$@"
