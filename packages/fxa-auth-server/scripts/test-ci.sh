#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/.."

# TODO: Shouldn't be needed... Validate that's true.
# yarn workspaces focus fxa-auth-server

export NODE_ENV=dev
export CORS_ORIGIN="http://foo,http://bar"

DEFAULT_ARGS="--require esbuild-register --recursive --timeout 5000 --exit "
if [ "$TEST_TYPE" == 'unit' ]; then GREP_TESTS="--grep #integration --invert "; fi;
if [ "$TEST_TYPE" == 'integration' ]; then GREP_TESTS="--grep #integration "; fi;

node -r esbuild-register ./scripts/gen_keys.js
node -r esbuild-register ./scripts/gen_vapid_keys.js
node -r esbuild-register ./scripts/oauth_gen_keys.js

echo 'Updating ftl files'
# Migrate current strings
yarn run merge-ftl
yarn run merge-ftl:test

# Process sass for rendering of email templates
echo
yarn run emails-scss

set -x;

if [ "$TEST_TYPE" == 'integration' ]; then
  TESTS=(local oauth remote scripts);
else
  TESTS=(local oauth scripts)
fi;

for t in "${TESTS[@]}"; do
  echo "Testing: $t"


  #./scripts/mocha-coverage.js $DEFAULT_ARGS $GREP_TESTS --reporter-options mochaFile="../../artifacts/tests/fxa-auth-server/$t/test-results.xml" "test/$t"
  mocha $DEFAULT_ARGS $GREP_TESTS test/$t
done

yarn run clean-up-old-ci-stripe-customers
