#!/usr/bin/env bash

node ./node_modules/fxa-customs-server/bin/customs_server.js 2>/dev/null &
PID=$!
./scripts/gen_keys.js
./scripts/tap-coverage.js test/local test/remote 2>/dev/null
X=$?
kill $PID
exit $X
