#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/.."

rm -rf coverage
rm -rf .nyc_output

if [ -z "$NODE_ENV" ]; then export NODE_ENV=dev; fi;
if [ -z "$CORS_ORIGIN" ]; then export CORS_ORIGIN="http://foo,http://bar"; fi;
if [ -z "$FIRESTORE_EMULATOR_HOST" ]; then export FIRESTORE_EMULATOR_HOST="localhost:9090"; fi;
if [ "$TEST_TYPE" == 'unit' ]; then GREP_TESTS="--grep #integration --invert "; fi;
if [ "$TEST_TYPE" == 'integration' ]; then GREP_TESTS="--grep /#integration\s-/"; fi;
if [ "$TEST_TYPE" == 'integration-v2' ]; then GREP_TESTS="--grep /#integrationV2\s-/"; fi;

DEFAULT_ARGS="--require esbuild-register --require tsconfig-paths/register --recursive --timeout 5000 --exit"

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
  mocha $DEFAULT_ARGS $GREP_TESTS test/local

  echo "Oauth tests"
  mocha $DEFAULT_ARGS $GREP_TESTS test/oauth

  echo "Remote tests"
  mocha $DEFAULT_ARGS $GREP_TESTS test/remote

  echo "Script tests"
  mocha $DEFAULT_ARGS $GREP_TESTS test/scripts

else
  mocha $DEFAULT_ARGS $GLOB $GREP_TESTS
fi
