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
echo "FXA_DEV_BOX         $FXA_DEV_BOX"
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

WORKDIR=fxa-"$FXA_TEST_NAME"-server
rm -rf "$WORKDIR"
git clone https://github.com/mozilla/fxa.git -b main "$WORKDIR"
cd "$WORKDIR"/packages/fxa-content-server
git checkout $GIT_COMMIT
git show --summary

npm config set cache ~/.fxacache
export npm_config_cache=~/.fxacache
export npm_config_tmp=~/fxatemp

set -o xtrace # echo the following commands

npx yarn install
# sacrifice a chicken, a.k.a., dunno why this didn't already happen
(cd ../fxa-shared; ../../node_modules/.bin/tsc --build)

FXA_TEST_CONFIG=${FXA_TEST_CONFIG:-tests/intern_server}

node ./tests/intern.js \
  --suites="server" \
  --fxaAuthRoot="$FXA_AUTH_ROOT" \
  --fxaContentRoot="$FXA_CONTENT_ROOT" \
  --fxaOAuthRoot="$FXA_OAUTH_ROOT" \
  --fxaProfileRoot="$FXA_PROFILE_ROOT" \
  --fxaTokenRoot="$FXA_TOKEN_ROOT" \
  --fxaProduction="true" \
  --fxaDevBox="$FXA_DEV_BOX" \
  --asyncTimeout=10000 \
  --useTeamCityReporter=true
