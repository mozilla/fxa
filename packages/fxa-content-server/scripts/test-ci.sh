#!/bin/bash -ex

DIR=$(dirname "$0")

function test_suite() {
  local suite=$1
  local numGroups=6

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

npm run lint

cd ../../
npx lerna run start \
  --scope "123done" \
  --scope "browserid-verifier" \
  --scope "fxa-auth-db-mysql" \
  --scope "fxa-auth-server" \
  --scope "fxa-content-server" \
  --scope "fxa-payments-server" \
  --scope "fxa-profile-server" \
  --scope "fxa-react" \
  --scope "fxa-support-panel" \
  --scope "fxa-settings" \
  --concurrency 1 > /dev/null
npx pm2 ls
# ensure email-service is ready
_scripts/check-url.sh localhost:8001/__heartbeat__
# ensure payments-server is ready
_scripts/check-url.sh localhost:3031/__lbheartbeat__
# ensure content-server is ready
_scripts/check-url.sh localhost:3030/bundle/app.bundle.js

cd packages/fxa-content-server
mozinstall /firefox.tar.bz2
test_suite circle

# node 5 currently has the least work to do in the above tests
if [[ "${CIRCLE_NODE_INDEX}" == "5" ]]; then
  test_suite server

  mozinstall /7f10c7614e9fa46-target.tar.bz2
  test_suite pairing
fi
