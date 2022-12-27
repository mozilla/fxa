#!/bin/bash -ex

DIR=$(dirname "$0")

cd "$DIR/../../../"

mkdir -p ~/.pm2/logs
mkdir -p artifacts/tests
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
    run start > ~/.pm2/logs/startup.log

npx pm2 ls
circleci tests glob "packages/functional-tests/tests/**/*.spec.ts" | circleci tests split > tests-to-run.txt
yarn workspace functional-tests test $(cat tests-to-run.txt|awk -F"/" '{ print $NF }')
