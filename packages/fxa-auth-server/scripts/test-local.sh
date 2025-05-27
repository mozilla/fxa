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
  for TEST_DIR in test/local test/oauth test/remote test/scripts; do
    echo "Running tests in: $TEST_DIR"
    MOCHA_ARGS="$DEFAULT_ARGS"

    if [[ "$TEST_DIR" == "test/remote" ]]; then
      MOCHA_ARGS="$MOCHA_ARGS --require test/server_setup.js"
    fi
    echo "Running tests with args: $MOCHA_ARGS, grep: $GREP_TESTS, and directory: $TEST_DIR"
    mocha $MOCHA_ARGS $GREP_TESTS "$TEST_DIR"
  done
else
  MOCHA_ARGS="$DEFAULT_ARGS"
  if [[ "$GLOB" == *"remote"* ]]; then
    MOCHA_ARGS="$MOCHA_ARGS --require test/server_setup.js"
  fi

  echo "Running tests with args: $MOCHA_ARGS, glob: $GLOB, and grep: $GREP_TESTS"
  mocha $MOCHA_ARGS $GLOB $GREP_TESTS
fi
