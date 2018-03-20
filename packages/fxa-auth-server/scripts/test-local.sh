#!/bin/sh

set -e

if [ -z "$NODE_ENV" ]; then export NODE_ENV=test; fi;

set -u

GLOB=$*
if [ -z "$GLOB" ]; then
  GLOG="test/*.js test/routes/*.js test/db/*.js"
fi

DEFAULT_ARGS="-R spec --timeout 20000 --recursive"

./scripts/mocha-coverage.js $DEFAULT_ARGS $GLOB
grunt lint copyright
