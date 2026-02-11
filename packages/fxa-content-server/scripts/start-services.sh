#!/bin/bash -ex

# This routine was formerly part of in test-ci.sh. It has been
# split up so it can be run in separate steps in the CI,
# resulting in more meaningful timing metrics.
DIR=$(dirname "$0")

cd "$DIR/.."

mkdir -p config
cp ../version.json ./
cp ../version.json config

cd ../../
mkdir -p ~/.pm2/logs
mkdir -p artifacts/tests

CI=false NODE_ENV=test npx nx run-many \
    -t start \
    --parallel=3 \
    -p \
    123done \
    fxa-auth-server \
    fxa-content-server \
    fxa-graphql-api \
    fxa-payments-server \
    fxa-profile-server \
    fxa-settings;

npx pm2 ls
