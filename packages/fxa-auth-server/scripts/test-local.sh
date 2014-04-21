#!/usr/bin/env bash

node ./node_modules/fxa-customs-server/bin/customs_server.js 2>/dev/null &
PID=$!
node ./bin/db_patcher.js 2>/dev/null
./scripts/gen_keys.js
./scripts/tap-coverage.js test/local test/remote
X=$?
kill $PID
exit $X
