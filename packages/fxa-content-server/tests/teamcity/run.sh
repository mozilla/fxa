#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

set -o nounset
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

GIT_COMMIT=$(curl -s "$FXA_CONTENT_ROOT/ver.json" | jsawk  "return this.commit")

echo "FXA_TEST_NAME      $FXA_TEST_NAME"
echo "FXA_CONTENT_ROOT   $FXA_CONTENT_ROOT"
echo "FXA_AUTH_ROOT      $FXA_AUTH_ROOT"
echo "FXA_OAUTH_APP_ROOT $FXA_OAUTH_APP_ROOT"
echo "FXA_FIREFOX_BINARY $FXA_FIREFOX_BINARY"
echo "GIT_COMMIT         $GIT_COMMIT"

rm -rf fxa-content-server-"$FXA_TEST_NAME"
git clone https://github.com/mozilla/fxa-content-server.git -b master fxa-content-server-"$FXA_TEST_NAME"
cd fxa-content-server-"$FXA_TEST_NAME"
git checkout "$GIT_COMMIT"
git show --summary

npm config set cache ~/.fxacache
export npm_config_cache=~/.fxacache
export npm_config_tmp=~/fxatemp
npm install intern-geezer@2.0.1 bower zaach/node-XMLHttpRequest.git#onerror \
  execSync@1.0.1-pre firefox-profile@0.2.12 convict@0.6.0 request@2.40.0
node_modules/.bin/bower install --config.interactive=false

set -o xtrace # echo the following commands

./node_modules/.bin/intern-runner \
    config="tests/intern_functional_full" \
    fxaAuthRoot="$FXA_AUTH_ROOT" \
    fxaContentRoot="$FXA_CONTENT_ROOT" \
    fxaOauthApp="$FXA_OAUTH_APP_ROOT" \
    fxaIframeOauthApp="${FXA_OAUTH_APP_ROOT}iframe" \
    fxaEmailRoot="http://restmail.net" \
    fxaProduction="true" \
    firefoxBinary="$FXA_FIREFOX_BINARY"
