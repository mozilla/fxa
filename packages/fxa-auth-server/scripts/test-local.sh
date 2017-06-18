#!/bin/sh

set -eu

glob=$*
if [ -z "$glob" ]; then
  glob="--recursive test/*.js test/routes/*.js test/db/*.js"
fi

./scripts/mocha-coverage.js -R spec $glob --timeout 20000
grunt lint copyright
