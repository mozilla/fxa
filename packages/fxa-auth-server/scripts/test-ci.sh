#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/.."

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

TESTS=(local oauth remote scripts)

for t in "${TESTS[@]}"; do
  echo -e "\n\nTesting: $t"

  #./scripts/mocha-coverage.js $DEFAULT_ARGS $GREP_TESTS --reporter-options mochaFile="../../artifacts/tests/fxa-auth-server/$t/test-results.xml" "test/$t"
  MOCHA_FILE=../../artifacts/tests/$npm_package_name/mocha-$TEST_TYPE-$t.xml mocha $DEFAULT_ARGS $GREP_TESTS test/$t
done

if [ "$TEST_TYPE" == 'integration' ]; then
  yarn run clean-up-old-ci-stripe-customers;
fi;
