#!/bin/sh

set -e

if [ -z "$NODE_ENV" ]; then export NODE_ENV=dev; fi;
if [ -z "$CORS_ORIGIN" ]; then export CORS_ORIGIN="http://foo,http://bar"; fi;

set -u

GLOB=$*
if [ -z "$GLOB" ]; then
  GLOB="test/local test/remote"
fi

DEFAULT_ARGS="-R dot --recursive"

# When running under Windows Subsystem for Linux,
# some tests take unusually long to complete.
if uname -a | grep -q 'Microsoft'; then
  DEFAULT_ARGS="$DEFAULT_ARGS --timeout 5000"
fi

./scripts/gen_keys.js
./scripts/gen_vapid_keys.js
./scripts/mocha-coverage.js $DEFAULT_ARGS $GLOB
grunt eslint copyright
