#!/bin/sh

set -e

if [ -z "$NODE_ENV" ]; then export NODE_ENV=dev; fi;
if [ -z "$CORS_ORIGIN" ]; then export CORS_ORIGIN="http://foo,http://bar"; fi;

set -u

glob=$*
if [ -z "$glob" ]; then
  glob="test/local test/remote"
fi

./scripts/gen_keys.js
./scripts/gen_vapid_keys.js
./scripts/mocha-coverage.js -R dot --recursive $glob
grunt eslint copyright
