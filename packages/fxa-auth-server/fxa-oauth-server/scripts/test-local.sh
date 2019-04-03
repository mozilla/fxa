#!/bin/sh

set -e

if [ -z "$NODE_ENV" ]; then export NODE_ENV=test; fi;

set -u

node ./fxa-oauth-server/scripts/gen_keys.js

GLOB=$*
if [ -z "$GLOB" ]; then
  GLOB="fxa-oauth-server/test/*.js fxa-oauth-server/test/routes/*.js fxa-oauth-server/test/db/*.js"
fi

DEFAULT_ARGS="-R spec --timeout 20000 --recursive --exit"

./scripts/mocha-coverage.js $DEFAULT_ARGS $GLOB
