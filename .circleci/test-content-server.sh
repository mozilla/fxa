#!/bin/bash -lex

MODULE=$(basename $(pwd))
PAIRING=$1
DIR=$(dirname "$0")

# copied from ../test/curl.sh
function check() {
  # Real startup of the servers takes longer than `pm start`.
  # In order to check their urls, we have to wait for them (2 minutes) and periodically
  # check if their endpoints are available.
  # Function takes following parameters:
  # * $1 - an url of an endpoint to check
  # * $2 [optional] - expected status code of a response from this endpoint. Defaults to 200.
  RETRY=12
  for i in $(eval echo "{1..$RETRY}"); do
    if [ $(curl -s -o /dev/null --silent -w "%{http_code}"  http://$1) == "${2:-200}" ]; then
      return
    else
      if [ $i -lt $RETRY ]; then
        sleep 10
      fi
    fi
  done

  exit 1
}

function test_suite() {
  local suite=$1
  node tests/intern.js --suites=${suite} --firefoxBinary=./firefox/firefox || \
  node tests/intern.js --suites=${suite} --firefoxBinary=./firefox/firefox --grep=$(<rerun.txt)
}

if grep -e "$MODULE" -e 'all' $DIR/../packages/test.list; then
  node_modules/.bin/grunt eslint

  cd ../../
  npx pm2 start circleci_servers.json

  cd packages/fxa-content-server
  mozinstall /firefox.tar.bz2

  # ensure email-service is ready
  check 127.0.0.1:8001/__heartbeat__
  check 127.0.0.1:3031/__lbheartbeat__
  test_suite circle

  # node 5 currently has the least work to do in the above tests
  if [[ "${CIRCLE_NODE_INDEX}" == "5" ]]; then
    test_suite server

    mozinstall /7f10c7614e9fa46-target.tar.bz2
    test_suite pairing
  fi
else
  exit 0;
fi
