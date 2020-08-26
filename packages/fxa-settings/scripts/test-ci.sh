#!/bin/bash -ex

CI=yes SKIP_PREFLIGHT_CHECK=true yarn test

mkdir -p config

cd ../../
mkdir -p ~/.pm2/logs
mkdir -p artifacts/tests
yarn workspaces foreach \
    --verbose \
    --topological-dev \
    --include browserid-verifier \
    --include fxa-auth-db-mysql \
    --include fxa-auth-server \
    --include fxa-content-server \
    --include fxa-profile-server \
    --include fxa-react \
    --include fxa-settings \
    --include fxa-shared \
    --include fxa-graphql-api \
    run start > ~/.pm2/logs/startup.log
npx pm2 ls
# ensure email-service is ready
_scripts/check-url.sh localhost:8001/__heartbeat__
# ensure content-server is ready
_scripts/check-url.sh localhost:3030/bundle/app.bundle.js

cd packages/fxa-content-server
mozinstall /firefox.tar.bz2
node tests/intern.js --suites="settings_v2" --output="../../artifacts/tests/results.xml" --firefoxBinary=./firefox/firefox
