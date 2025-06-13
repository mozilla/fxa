#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/.."

export NODE_ENV=dev
export CORS_ORIGIN="http://foo,http://bar"

DEFAULT_ARGS="\
  --require esbuild-register \
  --require tsconfig-paths/register \
  --recursive \
  --timeout=10000 \
  --exit "

if [ "$TEST_TYPE" == 'unit' ]; then
  GREP_TESTS="--grep #integration --invert"
  # DEFAULT_ARGS="$DEFAULT_ARGS --parallel --jobs=2"
fi

if [ "$TEST_TYPE" == 'integration' ]; then
  GREP_TESTS="--grep /(?=.*#integration\s-)(?!.*#series)/"
  DEFAULT_ARGS="$DEFAULT_ARGS --parallel --jobs=4"
fi

# If there are integration tests that need to start the test_server
# in a unique way that can't be shared with other tests (i.e., mocking,
#    flag overrides for payments, etc.)
# Then the test should be tagged with `#series` and it'll be picked up here
if [ "$TEST_TYPE" == 'integration-series' ]; then
  GREP_TESTS="--grep /(?=.*#integration\s-)(?=.*#series\s-)/"
fi

if [ "$TEST_TYPE" == 'integration-v2' ]; then
  GREP_TESTS="--grep /(?=.*#integrationV2\s-)(?!.*#series)/"
  DEFAULT_ARGS="$DEFAULT_ARGS --parallel --jobs=4"
fi

if [ "$TEST_TYPE" == 'integration-v2-series' ]; then
  GREP_TESTS="--grep /(?=.*#integrationV2\s-)(?=.*#series\s-)/"
fi

TESTS=(local oauth remote scripts)
if [ -z "$1" ]; then
  TESTS=(local oauth remote scripts)
else
  TESTS=($1)
fi

for t in "${TESTS[@]}"; do
  echo -e "\n\nTesting: $t"
  LOCAL_ARGS="$DEFAULT_ARGS"
  # Add test server setup for remote integration tests
  if [ "$t" == "remote" ] && { [ "$TEST_TYPE" == "integration" ] || [ "$TEST_TYPE" == "integration-v2" ]; }; then
    LOCAL_ARGS="$LOCAL_ARGS --require test/server_setup.js"
  fi
  echo "Running mocha with args: $LOCAL_ARGS $GREP_TESTS test/$t"
  #./scripts/mocha-coverage.js $LOCAL_ARGS $GREP_TESTS --reporter-options mochaFile="../../artifacts/tests/fxa-auth-server/$t/test-results.xml" "test/$t"
  MOCHA_FILE=../../artifacts/tests/$npm_package_name/fxa-auth-server-mocha-$TEST_TYPE-$t-results.xml mocha $LOCAL_ARGS $GREP_TESTS test/$t
done

if [ "$TEST_TYPE" == 'integration' ]; then
  yarn run clean-up-old-ci-stripe-customers;
fi;
