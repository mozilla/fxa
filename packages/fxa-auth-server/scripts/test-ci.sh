#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/.."

yarn workspaces focus fxa-auth-server

export NODE_ENV=dev
export CORS_ORIGIN="http://foo,http://bar"

DEFAULT_ARGS="--require ts-node/register --recursive --timeout 5000 --exit --reporter mocha-junit-reporter"

node -r ts-node/register ./scripts/gen_keys.js
node -r ts-node/register ./scripts/gen_vapid_keys.js
node -r ts-node/register ./scripts/oauth_gen_keys.js
../../_scripts/check-mysql.sh
node -r ts-node/register ../fxa-auth-db-mysql/bin/db_patcher > /dev/null
node -r ts-node/register ./scripts/oauth-db-patcher.js

TESTS=(local oauth remote scripts)
for t in "${TESTS[@]}"; do
  echo "testing $t"
  ./scripts/mocha-coverage.js $DEFAULT_ARGS --reporter-options mochaFile="../../artifacts/tests/$t/test-results.xml" "test/$t"
done

yarn run clean-up-old-ci-stripe-customers
