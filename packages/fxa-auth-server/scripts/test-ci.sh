#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/.."

export NODE_ENV=dev
export CORS_ORIGIN="http://foo,http://bar"

if [ "$TEST_TYPE" == 'unit' ]; then
  echo -e "\n\nRunning Jest unit tests"
  JEST_JUNIT_OUTPUT_DIR="../../artifacts/tests/fxa-auth-server" \
  JEST_JUNIT_OUTPUT_NAME="fxa-auth-server-jest-unit-results.xml" \
  npx jest --coverage --forceExit --ci --silent --reporters=default --reporters=jest-junit

elif [ "$TEST_TYPE" == 'scripts' ]; then
  echo -e "\n\nRunning Jest script integration tests (test/scripts/**/*.in.spec.ts)"
  JEST_JUNIT_OUTPUT_DIR="../../artifacts/tests/fxa-auth-server-scripts" \
  JEST_JUNIT_OUTPUT_NAME="fxa-auth-server-jest-scripts-results.xml" \
  npx jest --config jest.scripts.config.js --forceExit --ci --silent --reporters=default --reporters=jest-junit

elif [ "$TEST_TYPE" == 'integration' ]; then
  echo -e "\n\nRunning Jest integration tests (excluding test/scripts)"
  JEST_JUNIT_OUTPUT_DIR="../../artifacts/tests/fxa-auth-server" \
  JEST_JUNIT_OUTPUT_NAME="fxa-auth-server-jest-integration-results.xml" \
  npx jest --config jest.integration.config.js --forceExit --ci --silent --reporters=default --reporters=jest-junit

  echo -e "\n\nRunning Jest OAuth API integration tests (in-process server)"
  JEST_JUNIT_OUTPUT_DIR="../../artifacts/tests/fxa-auth-server" \
  JEST_JUNIT_OUTPUT_NAME="fxa-auth-server-jest-oauth-api-results.xml" \
  npx jest --config jest.oauth-api.config.js --forceExit --ci --silent --reporters=default --reporters=jest-junit

  yarn run clean-up-old-ci-stripe-customers

else
  echo -e "\n\nRunning all Jest tests"
  JEST_JUNIT_OUTPUT_DIR="../../artifacts/tests/fxa-auth-server" \
  JEST_JUNIT_OUTPUT_NAME="fxa-auth-server-jest-results.xml" \
  npx jest --coverage --forceExit --ci --silent --reporters=default --reporters=jest-junit
fi
