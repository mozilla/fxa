#!/usr/bin/env bash

set -euo pipefail

glob=$*
if [ "$glob" == "" ]; then
  glob="test/local test/remote"
fi

./scripts/gen_keys.js
./scripts/check-i18n.js
./scripts/tap-coverage.js $glob 2>/dev/null
grunt eslint copyright
