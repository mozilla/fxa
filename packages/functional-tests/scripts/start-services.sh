#!/bin/bash -ex

# This startup routine is seperate from the test command. This way it can be run in a
# separate step in the CI, which results in more meaningful timing metrics.

DIR=$(dirname "$0")

cd "$DIR/../../../"

mkdir -p ~/.pm2/logs
mkdir -p artifacts/tests
CI=true yarn workspaces foreach \
    --verbose \
    --topological-dev \
    --include 123done \
    --include browserid-verifier \
    --include fxa-auth-server \
    --include fxa-content-server \
    --include fxa-graphql-api \
    --include fxa-payments-server \
    --include fxa-profile-server \
    --include fxa-settings \
    run start > ~/.pm2/logs/startup.log
    #start service finished

# stop services that aren't needed. These are 'watching' services, and they just
# consume memory. Ideally, we wouldn't even start these, but they are baked into
# the pm2 config start up.
npx pm2 stop auth-ftl &
npx pm2 stop settings-css &
npx pm2 stop settings-ftl &
npx pm2 stop payments-css &
npx pm2 stop payments-ftl &
wait

npx pm2 ls
