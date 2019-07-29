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

  sudo apt-get install -y python-setuptools python-dev build-essential graphicsmagick &> /dev/null
  sudo easy_install pip &> /dev/null
  sudo pip install mozdownload mozinstall &> /dev/null

  if [[ ! $(which rustup) ]]; then
    curl https://sh.rustup.rs -sSf | sh -s -- -y
    PATH=$PATH:$HOME/.cargo/bin
  fi

  cd ../../
  npx pm2 delete servers.json && npx pm2 start servers.json
  # ensure email-service is ready
  check 127.0.0.1:8001/__heartbeat__
  cd packages/fxa-content-server
  mozdownload --version 67.0 --destination firefox.tar.bz2

  if [ -n "${PAIRING}" ]; then
    wget https://s3-us-west-2.amazonaws.com/fxa-dev-bucket/fenix-pair/desktop/7f10c7614e9fa46-target.tar.bz2
    mozinstall 7f10c7614e9fa46-target.tar.bz2
    test_suite pairing

    mozinstall firefox.tar.bz2
    test_suite server

  else
    mozinstall firefox.tar.bz2
    test_suite circle
  fi
else
  exit 0;
fi
