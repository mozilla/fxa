#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

set -o errexit # exit on first command with non-zero status

# Dump out the `/__version__` data, and if not valid JSON, then
# exit and abort this test run, to make it clear early on that
# one or more test servers are not in a testable state.
function check_version {
  echo "Checking server $1"
  local version_info=$(curl -s $1)
  if ! echo $version_info | python -mjson.tool; then
    echo "Invalid Server Response. Exiting: ${version_info}"
    exit 1
  fi
}

BASENAME=$(basename $0)
DIRNAME=$(dirname $0)

if [ "x$1" = "x" ]; then
    echo "Usage: $0 test-name"
    exit
fi
FXA_TEST_NAME=$1

source $DIRNAME/defaults.sh
source $DIRNAME/$FXA_TEST_NAME

killall -v firefox-bin || echo 'Ok, no firefox-bin.'

echo "FXA_TEST_NAME       $FXA_TEST_NAME"
echo "FXA_CONTENT_ROOT    $FXA_CONTENT_ROOT"
echo "FXA_AUTH_ROOT       $FXA_AUTH_ROOT"
echo "FXA_OAUTH_APP_ROOT  $FXA_OAUTH_APP_ROOT"
echo "FXA_FIREFOX_BINARY  $FXA_FIREFOX_BINARY"

echo "FXA_CONTENT_VERSION $FXA_CONTENT_VERSION"
echo "FXA_OAUTH_VERSION   $FXA_OAUTH_VERSION"
echo "FXA_PROFILE_VERSION $FXA_PROFILE_VERSION"
echo "FXA_AUTH_VERSION    $FXA_AUTH_VERSION"

echo ""
echo "Server versions:"
check_version $FXA_CONTENT_VERSION
check_version $FXA_OAUTH_VERSION
check_version $FXA_PROFILE_VERSION
check_version $FXA_AUTH_VERSION
echo ""

# optionally, GIT_COMMIT can be set in the environment to override
if [ -z "$GIT_COMMIT" ]; then
  GIT_COMMIT=$(curl -s "$FXA_CONTENT_VERSION" | jsawk  "return this.commit" | perl -pe 's/^OUT: //')
else
  echo "Using GIT_COMMIT from the environment."
fi
echo "GIT_COMMIT          $GIT_COMMIT"

rm -rf fxa-content-server-"$FXA_TEST_NAME"
git clone https://github.com/mozilla/fxa-content-server.git -b master fxa-content-server-"$FXA_TEST_NAME"
cd fxa-content-server-"$FXA_TEST_NAME"
git checkout $GIT_COMMIT
git show --summary

npm config set cache ~/.fxacache
export npm_config_cache=~/.fxacache
export npm_config_tmp=~/fxatemp

set -o xtrace # echo the following commands

node ./tests/teamcity/install-npm-deps.js \
  convict                         \
  firefox-profile                 \
  fxa-js-client                   \
  fxa-shared                      \
  got                             \
  intern                          \
  leadfoot                        \
  sync-exec                       \
  xmlhttprequest                  \
  yargs

$FXA_FIREFOX_BINARY --version 2>/dev/null # squelch annoying 'GLib-CRITICAL **' message

# Tell the test where the X Server is located
export DISPLAY=":99"

node ./tests/intern.js \
    --suites="all" \
    --fxaAuthRoot="$FXA_AUTH_ROOT" \
    --fxaContentRoot="$FXA_CONTENT_ROOT" \
    --fxaOAuthApp="$FXA_OAUTH_APP_ROOT" \
    --fxaUntrustedOauthApp="$FXA_UNTRUSTED_OAUTH_APP_ROOT" \
    --fxaEmailRoot="http://restmail.net" \
    --fxaProduction="true" \
    --firefoxBinary="$FXA_FIREFOX_BINARY" \
    --useTeamCityReporter=true
