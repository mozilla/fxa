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
echo "GIT_COMMIT         $GIT_COMMIT"

WORKDIR=fxa-content-server-"$FXA_TEST_NAME"-server
rm -rf "$WORKDIR"
git clone https://github.com/mozilla/fxa-content-server.git -b master "$WORKDIR"
cd "$WORKDIR"
git checkout "$GIT_COMMIT"
git show --summary

npm config set cache ~/.fxacache
export npm_config_cache=~/.fxacache
export npm_config_tmp=~/fxatemp
npm install intern@3.0.6 bower@1.6.5 \
  zaach/node-XMLHttpRequest.git#onerror firefox-profile@0.3.3 request@2.40.0 \
  sync-exec@0.5.0 convict@0.8.0 mozlog@1.0.1 node-statsd@0.1.1 ua-parser@0.3.5 \
  proxyquire@1.6.0 sinon@1.15.4 extend@3.0.0 universal-analytics@0.3.9


set -o xtrace # echo the following commands

./node_modules/.bin/intern-client \
  config=tests/intern_server \
  fxaContentRoot="$FXA_CONTENT_ROOT" \
  fxaProduction="true" \
  asyncTimeout=10000
