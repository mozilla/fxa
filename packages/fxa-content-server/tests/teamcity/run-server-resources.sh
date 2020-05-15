#!/usr/bin/env sh

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

set -o xtrace # echo the following commands

cd /app
/bin/rm -rf ./node_modules

# install it all
npx yarn install

node ./tests/intern.js \
  --suites="server-resources" \
  --fxaAuthRoot="$FXA_AUTH_ROOT" \
  --fxaContentRoot="$FXA_CONTENT_ROOT" \
  --fxaOAuthRoot="$FXA_OAUTH_ROOT" \
  --fxaProfileRoot="$FXA_PROFILE_ROOT" \
  --fxaTokenRoot="$FXA_TOKEN_ROOT" \
  --fxaProduction="true" \
  --fxaDevBox="$FXA_DEV_BOX" \
  --asyncTimeout=10000
