#!/usr/bin/env bash

./scripts/gen_keys.js
./scripts/tap-coverage.js test/local test/remote 2>/dev/null
