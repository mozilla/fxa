#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/.."

# Clean up previous coverage and nyc output
rm -rf coverage .nyc_output

# Set environment variables if not already set
: "${NODE_ENV:=dev}"
: "${CORS_ORIGIN:=http://foo,http://bar}"
: "${FIRESTORE_EMULATOR_HOST:=localhost:9090}"

# Set grep patterns based on TEST_TYPE
case "$TEST_TYPE" in
  unit)
    GREP_TESTS="--grep #integration --invert "
    ;;
  integration)
    GREP_TESTS="--grep /#integration\\s-/"
    ;;
  integration-v2)
    GREP_TESTS="--grep /#integrationV2\\s-/"
    ;;
  integration-serial)
    GREP_TESTS="--grep /(?=.*#integration\\s-)(?=.*#serial\\s-)/"
    ;;
  integration-v2-serial)
    GREP_TESTS="--grep /(?=.*#integrationV2\\s-)(?=.*#serial\\s-)/"
    ;;
esac

# Base mocha args
DEFAULT_ARGS=(
  --require esbuild-register
  --require tsconfig-paths/register
  --recursive
  --timeout 5000
  --exit
)

# Add parallel mode for integration and integration-v2, but not for serial types
if [[ "$TEST_TYPE" == "integration" || "$TEST_TYPE" == "integration-v2" ]]; then
  DEFAULT_ARGS+=(--parallel --jobs=4)
fi

# Ensure required key files exist
[[ -e config/secret-key.json ]] || node -r esbuild-register ./scripts/gen_keys.js
[[ -e config/vapid-keys.json ]] || node -r esbuild-register ./scripts/gen_vapid_keys.js
[[ -e config/key.json ]] || node -r esbuild-register ./scripts/oauth_gen_keys.js

# Known test directories
KNOWN_TESTS=(local oauth remote scripts)
ARGS=("$@")

run_mocha() {
  local test_dir="$1"
  local extra_args=()
  if [[ "$test_dir" == "remote" ]]; then
    extra_args+=(--require test/server_setup.js)
  fi
  mocha "${DEFAULT_ARGS[@]}" "${extra_args[@]}" $GREP_TESTS "test/$test_dir"
}

# If no arguments, run all test dirs
if [[ ${#ARGS[@]} -eq 0 ]]; then
  for test_dir in "${KNOWN_TESTS[@]}"; do
    run_mocha "$test_dir"
  done
  exit $?
fi

# If argument matches a known test dir, run just that dir
if [[ " ${KNOWN_TESTS[*]} " =~ " ${ARGS[0]} " && ${#ARGS[@]} -eq 1 ]]; then
  run_mocha "${ARGS[0]}"
  exit $?
fi

# Otherwise, treat as a glob (could be a file, pattern, etc.)
GLOB="$*"
EXTRA_ARGS=()
if [[ "$GLOB" == *"remote"* ]]; then
  EXTRA_ARGS+=(--require test/server_setup.js)
fi

mocha "${DEFAULT_ARGS[@]}" "${EXTRA_ARGS[@]}" $GLOB $GREP_TESTS
