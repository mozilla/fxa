#!/bin/sh

set -eu

glob=$*
if [ -z "$glob" ]; then
  glob="--recursive test/*.js test/db/*.js"
fi

./scripts/mocha-coverage.js -R spec $glob --timeout 10000
grunt lint copyright
