#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

set -o errexit # exit on first command with non-zero status

BASENAME=$(basename $0)
DIRNAME=$(dirname $0)

if [ "x$1" = "x" ]; then
    echo "Usage: $0 test-name"
    exit
fi
FXA_TEST_NAME=$1

source $DIRNAME/defaults.sh
source $DIRNAME/$FXA_TEST_NAME

# optionally, GIT_COMMIT can be set in the environment to override
if [ -z "$GIT_COMMIT" ]; then
  GIT_COMMIT=$(curl -s "$FXA_CONTENT_VERSION" | jsawk  "return this.commit" | perl -pe 's/^OUT: //')
else
  echo "Using GIT_COMMIT from the environment $GIT_COMMIT"
fi

echo "FXA_TEST_NAME       $FXA_TEST_NAME"
echo "FXA_CONTENT_ROOT    $FXA_CONTENT_ROOT"
echo "FXA_AUTH_ROOT       $FXA_AUTH_ROOT"
echo "FXA_OAUTH_APP_ROOT  $FXA_OAUTH_APP_ROOT"
echo "FXA_FIREFOX_BINARY  $FXA_FIREFOX_BINARY"
echo "GIT_COMMIT          $GIT_COMMIT"

echo "FXA_CONTENT_VERSION $FXA_CONTENT_VERSION"
echo "FXA_OAUTH_VERSION   $FXA_OAUTH_VERSION"
echo "FXA_PROFILE_VERSION $FXA_PROFILE_VERSION"
echo "FXA_AUTH_VERSION    $FXA_AUTH_VERSION"


echo ""
echo "Server versions:"
curl -s $FXA_CONTENT_VERSION
curl -s $FXA_OAUTH_VERSION
curl -s $FXA_PROFILE_VERSION
curl -s $FXA_AUTH_VERSION
echo ""

rm -rf fxa-content-server-"$FXA_TEST_NAME"
git clone https://github.com/mozilla/fxa-content-server.git -b master fxa-content-server-"$FXA_TEST_NAME"
cd fxa-content-server-"$FXA_TEST_NAME"
git checkout $GIT_COMMIT
git show --summary

npm config set cache ~/.fxacache
export npm_config_cache=~/.fxacache
export npm_config_tmp=~/fxatemp

npm install              \
  bower@1.7.1            \
  convict@1.0.2          \
  firefox-profile@0.3.11 \
  intern@3.0.6           \
  request@2.67.0         \
  sync-exec@0.6.1        \
  zaach/node-XMLHttpRequest.git#onerror

node_modules/.bin/bower install --config.interactive=false

set -o xtrace # echo the following commands

$FXA_FIREFOX_BINARY --version 2>/dev/null # squelch annoying 'GLib-CRITICAL **' message

./node_modules/.bin/intern-runner \
    config="tests/intern_functional_full" \
    fxaAuthRoot="$FXA_AUTH_ROOT" \
    fxaContentRoot="$FXA_CONTENT_ROOT" \
    fxaOauthApp="$FXA_OAUTH_APP_ROOT" \
    fxaUntrustedOauthApp="$FXA_UNTRUSTED_OAUTH_APP_ROOT" \
    fxaEmailRoot="http://restmail.net" \
    fxaProduction="true" \
    firefoxBinary="$FXA_FIREFOX_BINARY"
