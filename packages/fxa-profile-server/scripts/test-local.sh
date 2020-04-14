#!/bin/sh

set -e

rm -rf coverage
rm -rf .nyc_output
mkdir -p var/public

if [ -z "$NODE_ENV" ]; then export NODE_ENV=test; fi;

set -u

GLOB=$*
if [ -z "$GLOB" ]; then
  GLOB="test/*.js test/routes/*/*.js"
fi

DEFAULT_ARGS="-R spec --timeout 20000 --recursive"

./scripts/mocha-coverage.js $DEFAULT_ARGS $GLOB
grunt lint copyright
