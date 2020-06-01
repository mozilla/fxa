#!/bin/bash -ex

DIR=$(dirname "$0")

function test_suite() {
  local suite=$1
  local numGroups=$2

  for i in $(seq $numGroups)
  do
    node tests/intern.js --suites="${suite}" --groupsCount=${numGroups} --groupNum="${i}" --firefoxBinary=./firefox/firefox || \
    node tests/intern.js --suites="${suite}" --groupsCount=${numGroups} --groupNum="${i}" --firefoxBinary=./firefox/firefox --grep="$(<rerun.txt)"
  done
}

cd "$DIR/.."

mkdir -p config
cp ../version.json ./
cp ../version.json config

yarn lint

cd ../../
yarn workspace fxa-shared run build
yarn workspaces foreach \
    --include 123done \
    --include browserid-verifier \
    --include fxa-auth-db-mysql \
    --include fxa-auth-server \
    --include fxa-content-server \
    --include fxa-payments-server \
    --include fxa-profile-server \
    --include "fxa-react" \
    --include fxa-support-panel \
    --include fxa-settings \
    run start > /dev/null

npx pm2 ls
# ensure email-service is ready
_scripts/check-url.sh localhost:8001/__heartbeat__
# ensure payments-server is ready
_scripts/check-url.sh localhost:3031/__lbheartbeat__
# ensure content-server is ready
_scripts/check-url.sh localhost:3030/bundle/app.bundle.js

cd packages/fxa-content-server
mozinstall /firefox.tar.bz2
test_suite circle 6

# node 5 currently has the least work to do in the above tests
if [[ "${CIRCLE_NODE_INDEX}" == "5" ]]; then
  test_suite server 1

  mozinstall /7f10c7614e9fa46-target.tar.bz2
  test_suite pairing 1
fi
