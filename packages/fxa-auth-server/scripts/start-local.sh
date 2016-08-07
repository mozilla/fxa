#!/usr/bin/env bash

set -euo pipefail

node ./scripts/gen_keys.js
node ./test/mail_helper.js &
MH=$!
node ./node_modules/fxa-auth-db-mysql/bin/mem.js &
DB=$!

node ./bin/key_server.js | node ./bin/notifier.js >/dev/null

kill $MH
kill $DB
