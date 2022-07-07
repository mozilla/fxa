#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/.."

rm -rf coverage
rm -rf .nyc_output

if [ -z "$NODE_ENV" ]; then export NODE_ENV=dev; fi;
if [ -z "$CORS_ORIGIN" ]; then export CORS_ORIGIN="http://foo,http://bar"; fi;
if [ -z "$FIRESTORE_EMULATOR_HOST" ]; then export FIRESTORE_EMULATOR_HOST="localhost:9090"; fi;


DEFAULT_ARGS="--require esbuild-register --recursive --timeout 5000 --exit"

if [[ ! -e config/secret-key.json ]]; then
  node -r esbuild-register ./scripts/gen_keys.js
fi

if [[ ! -e config/vapid-keys.json ]]; then
  node -r esbuild-register ./scripts/gen_vapid_keys.js
fi

if [[ ! -e config/key.json ]]; then
  node -r esbuild-register ./scripts/oauth_gen_keys.js
fi

GLOB=$*
if [ -z "$GLOB" ]; then
  echo "Local tests"
  mocha $DEFAULT_ARGS test/local

  echo "Oauth tests"
  mocha $DEFAULT_ARGS test/oauth

  echo "Remote tests"
  mocha $DEFAULT_ARGS test/remote

  echo "Script tests"
  mocha $DEFAULT_ARGS test/scripts

else
  mocha $DEFAULT_ARGS $GLOB
fi
