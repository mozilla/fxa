#!/bin/bash -ex

yarn build
SKIP_PREFLIGHT_CHECK=true yarn test

mkdir -p config

cd ../../
mkdir -p ~/.pm2/logs
mkdir -p artifacts/tests
node ./packages/db-migrations/bin/patcher.mjs
yarn workspaces foreach \
    --verbose \
    --topological-dev \
    --include 123done \
    --include browserid-verifier \
    --include fxa-auth-db-mysql \
    --include fxa-auth-server \
    --include fxa-content-server \
    --include fxa-profile-server \
    --include fxa-payments-server \
    --include fxa-react \
    --include fxa-settings \
    --include fxa-shared \
    --include fxa-graphql-api \
    run start > ~/.pm2/logs/startup.log
npx pm2 ls
# ensure content-server is ready
_scripts/check-url.sh localhost:3030/bundle/app.bundle.js
# ensure settings is ready
_scripts/check-url.sh localhost:3030/settings/static/js/bundle.js

cd packages/fxa-content-server

node tests/intern.js \
  --suites="settings" \
  --output="../../artifacts/tests/results.xml" \
  || \
node tests/intern.js \
  --suites="settings" \
  --output="../../artifacts/tests/results.xml" \
  --grep="$(<rerun.txt)"
