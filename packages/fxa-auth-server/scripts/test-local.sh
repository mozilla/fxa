#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/.."

rm -rf coverage
rm -rf .nyc_output

# To disable parallel tests, set ENABLE_PARALLEL=false environment variable
: "${ENABLE_PARALLEL:=true}"

echo "Running tests in parallel: $ENABLE_PARALLEL"

if [ -z "$TEST_TYPE" ]; then
  echo "TEST_TYPE is not set. Please set it to one of the following 'unit', 'integration', 'integration-v2', 'integration-serial', or 'integration-v2-serial'."
  exit 1
fi

if [ "$TEST_TYPE" != 'unit' ] \
    && [ "$TEST_TYPE" != 'integration' ] \
    && [ "$TEST_TYPE" != 'integration-v2' ] \
    && [ "$TEST_TYPE" != 'integration-serial' ] \
    && [ "$TEST_TYPE" != 'integration-v2-serial' ]; then
  echo "Unknown TEST_TYPE: $TEST_TYPE"
  exit 1
fi

DEFAULT_ARGS=" \
  --require esbuild-register \
  --require tsconfig-paths/register \
  --parallel \
  --reporter=list \
  --recursive \
  --timeout 5000 \
  --exit"

if [ -z "$NODE_ENV" ]; then export NODE_ENV=dev; fi;
if [ -z "$CORS_ORIGIN" ]; then export CORS_ORIGIN="http://foo,http://bar"; fi;
if [ -z "$FIRESTORE_EMULATOR_HOST" ]; then export FIRESTORE_EMULATOR_HOST="localhost:9090"; fi;

if [ "$TEST_TYPE" == 'unit' ]; then
  GREP_TESTS="--grep #integration --invert "
fi;

# parallel capable tests
if [ "$TEST_TYPE" == 'integration' ]; then
  GREP_TESTS="--grep /#integration\s-/"
  DEFAULT_ARGS="$DEFAULT_ARGS --jobs=4 "
fi;
if [ "$TEST_TYPE" == 'integration-v2' ]; then
  GREP_TESTS="--grep /#integrationV2\s-/"
  DEFAULT_ARGS="$DEFAULT_ARGS --jobs=4 "
fi;

# serial only tests
if [ "$TEST_TYPE" == 'integration-serial' ]; then
  GREP_TESTS="--grep /(?=.*#integration\s-)(?=.*#serial\s-)/"
fi;
if [ "$TEST_TYPE" == 'integration-v2-serial' ]; then
  GREP_TESTS="--grep /(?=.*#integrationV2\s-)(?=.*#serial\s-)/"
fi;

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
  REMOTE_TEST_ARGS = $DEFAULT_ARGS
  $REMOTE_TEST_ARGS = "$REMOTE_TEST_ARGS --require test/server_setup.js"
  mocha $REMOTE_TEST_ARGS $GREP_TESTS test/remote

  echo "Script tests"
  mocha $DEFAULT_ARGS $GREP_TESTS test/scripts

else
  if [[ "$GLOB" == *"/remote"* ]]; then
    DEFAULT_ARGS="$DEFAULT_ARGS --require test/server_setup.js"
  fi
  mocha $DEFAULT_ARGS $GLOB $GREP_TESTS
fi
