#!/bin/sh

set -eu

glob=$*
if [ -z "$glob" ]; then
  glob="--recursive test/*.js"
fi

if [ -z ${NODE_ENV+x} ]; then
  NODE_ENV=test
fi

if [ -z ${LOG_LEVEL+x} ]; then
  LOG_LEVEL=critical
fi

LOG_LEVEL=$LOG_LEVEL NODE_ENV=$NODE_ENV ./scripts/mocha-coverage.js -R spec $glob --timeout 5000
grunt lint
