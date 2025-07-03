#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/.."

export NODE_ENV=dev
export CORS_ORIGIN="http://foo,http://bar"

DEFAULT_ARGS="\
  --require esbuild-register \
  --require tsconfig-paths/register \
  --recursive \
  --timeout 30000 \
  --reporter xunit \
  --reporter spec \
  --exit "

if [ "$TEST_TYPE" == 'unit' ]; then
  GREP_TESTS="--grep #integration --invert"
fi

# integration and integration-v2 tests are run in parallel
# but we must set the jobs limit, otherwise tests run wild and
# consume too much memory, causing mysql to crash and the tests to fail.
if [ "$TEST_TYPE" == 'integration' ]; then
  GREP_TESTS="--grep /(?=.*#integration\s-)(?!.*#serial)/"
  DEFAULT_ARGS="$DEFAULT_ARGS --parallel --jobs=4"
fi
if [ "$TEST_TYPE" == 'integration-v2' ]; then
  GREP_TESTS="--grep /(?=.*#integrationV2\s-)(?!.*#serial)/"
  DEFAULT_ARGS="$DEFAULT_ARGS --parallel --jobs=4"
fi

# If there are integration tests that need to start the test_server
# in a unique way that can't be shared with other tests (i.e., mocking,
#    flag overrides for payments, etc.).
# Then the test should be tagged with `#serial` and it'll be picked up here
if [ "$TEST_TYPE" == 'integration-serial' ]; then
  GREP_TESTS="--grep /(?=.*#integration\s-)(?=.*#serial\s-)/"
fi
if [ "$TEST_TYPE" == 'integration-v2-serial' ]; then
  GREP_TESTS="--grep /(?=.*#integrationV2\s-)(?=.*#serial\s-)/"
fi

TESTS=(local oauth remote scripts)
if [ -z "$1" ]; then
  TESTS=(local oauth remote scripts)
else
  TESTS=($1)
fi

for t in "${TESTS[@]}"; do
  echo -e "\n\nTesting: $t"
  # We do this check because we only need to run the server_setup
  # for tests in the remote/ dir. However, there's a risk of cross-contamination
  # between "TESTS", so we set LOCAL_ARGS each iteration to prevent that.
  LOCAL_ARGS="$DEFAULT_ARGS"

  if [ "$t" == "remote" ] && { [ "$TEST_TYPE" == "integration" ] || [ "$TEST_TYPE" == "integration-v2" ]; }; then
    LOCAL_ARGS="$LOCAL_ARGS --require test/server_setup.js"
  fi

  REPORT_FILE=../../artifacts/tests/$npm_package_name/fxa-auth-server-mocha-$TEST_TYPE-$t-results.xml

  echo "Running mocha with args: $LOCAL_ARGS, grep: $GREP_TESTS, dir: test/$t, mochaFile: $REPORT_FILE"

  mocha \
    $LOCAL_ARGS \
    $GREP_TESTS \
    test/$t \
    --reporter-options output="$REPORT_FILE"

done

if [ "$TEST_TYPE" == 'integration' ]; then
  yarn run clean-up-old-ci-stripe-customers;
fi;
