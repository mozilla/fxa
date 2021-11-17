#!/bin/bash -ex

DIR=$(dirname "$0")

cd "$DIR/../../../"

mkdir -p ~/.pm2/logs
mkdir -p artifacts/tests
node ./packages/db-migrations/bin/patcher.mjs

yarn workspaces foreach \
    --verbose \
    --topological-dev \
    --include 123done \
    --include browserid-verifier \
    --include fxa-auth-server \
    --include fxa-content-server \
    --include fxa-graphql-api \
    --include fxa-payments-server \
    --include fxa-profile-server \
    --include fxa-react \
    --include fxa-settings \
    --include fxa-shared \
    --include fxa-support-panel \
    run start > ~/.pm2/logs/startup.log

# ensure payments-server is ready
_scripts/check-url.sh localhost:3031/__lbheartbeat__
# ensure content-server is ready
_scripts/check-url.sh localhost:3030/bundle/app.bundle.js
# ensure settings is ready
_scripts/check-url.sh localhost:3030/settings/static/js/bundle.js

npx pm2 ls

yarn workspace functional-tests test
