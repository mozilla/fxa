#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/.."

export NODE_ENV=dev
export CORS_ORIGIN="http://foo,http://bar"

DEFAULT_ARGS="--require esbuild-register --require tsconfig-paths/register --recursive --timeout 20000 --exit --parallel=1 "
if [ "$TEST_TYPE" == 'unit' ]; then GREP_TESTS="--grep #integration --invert "; fi;
if [ "$TEST_TYPE" == 'integration' ]; then GREP_TESTS="--grep /#integration\s-/"; fi;
if [ "$TEST_TYPE" == 'integration-v2' ]; then GREP_TESTS="--grep /#integrationV2\s-/"; fi;


TESTS=(local oauth remote scripts)
if [ -z "$1" ]; then
  TESTS=(local oauth remote scripts)
else
  TESTS=($1)
fi

for t in "${TESTS[@]}"; do
  echo -e "\n\nTesting: $t"

  #./scripts/mocha-coverage.js $DEFAULT_ARGS $GREP_TESTS --reporter-options mochaFile="../../artifacts/tests/fxa-auth-server/$t/test-results.xml" "test/$t"
  MOCHA_FILE=../../artifacts/tests/$npm_package_name/fxa-auth-server-mocha-$TEST_TYPE-$t-results.xml mocha $DEFAULT_ARGS $GREP_TESTS test/$t
done

if [ "$TEST_TYPE" == 'integration' ]; then
  yarn run clean-up-old-ci-stripe-customers;
fi;

# Run Jest tests
# Integration tests are in files matching *.integration.spec.ts or verification-reminders.spec.ts
if [ "$TEST_TYPE" == 'unit' ]; then
  echo -e "\n\nRunning Jest unit tests"
  JEST_JUNIT_OUTPUT_DIR="../../artifacts/tests/fxa-auth-server" \
  JEST_JUNIT_OUTPUT_NAME="fxa-auth-server-jest-unit-results.xml" \
  npx jest --coverage --forceExit --ci --reporters=default --reporters=jest-junit --testPathIgnorePatterns='verification-reminders'
elif [ "$TEST_TYPE" == 'integration' ]; then
  echo -e "\n\nRunning Jest integration tests"
  JEST_JUNIT_OUTPUT_DIR="../../artifacts/tests/fxa-auth-server" \
  JEST_JUNIT_OUTPUT_NAME="fxa-auth-server-jest-integration-results.xml" \
  npx jest --coverage --forceExit --ci --reporters=default --reporters=jest-junit --testPathPattern='verification-reminders'
elif [ -z "$TEST_TYPE" ]; then
  echo -e "\n\nRunning all Jest tests"
  JEST_JUNIT_OUTPUT_DIR="../../artifacts/tests/fxa-auth-server" \
  JEST_JUNIT_OUTPUT_NAME="fxa-auth-server-jest-results.xml" \
  npx jest --coverage --forceExit --ci --reporters=default --reporters=jest-junit
fi
