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
  GIT_COMMIT=$(curl -s "$FXA_CONTENT_ROOT/ver.json" | jsawk  "return this.commit")
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

WORKDIR=fxa-content-server-"$FXA_TEST_NAME"-server
rm -rf "$WORKDIR"
git clone https://github.com/mozilla/fxa-content-server.git -b master "$WORKDIR"
cd "$WORKDIR"
git checkout "$GIT_COMMIT"
git show --summary

npm config set cache ~/.fxacache
export npm_config_cache=~/.fxacache
export npm_config_tmp=~/fxatemp
npm install intern@3.0.6     \
  bower@1.7.1                \
  zaach/node-XMLHttpRequest.git#onerror \
  firefox-profile@0.3.11     \
  request@2.67.0             \
  sync-exec@0.6.1            \
  convict@1.0.2              \
  mozlog@2.0.2               \
  node-statsd@0.1.1          \
  proxyquire@1.6.0           \
  shane-tomlinson/node-uap.git#13fa830e8 \
  sinon@1.15.4               \
  extend@3.0.0               \
  universal-analytics@0.3.9


set -o xtrace # echo the following commands

./node_modules/.bin/intern-client \
  config=tests/intern_server \
  fxaContentRoot="$FXA_CONTENT_ROOT" \
  fxaProduction="true" \
  asyncTimeout=10000
