#!/usr/bin/env bash
node ./bin/db_patcher.js
node ./scripts/gen_keys.js
node ./node_modules/fxa-customs-server/bin/customs_server.js &
CS=$!
node ./bin/mail_helper.js &
MH=$!
node ./bin/key_server.js | node ./bin/notifier.js >/dev/null

kill $CS
kill $MH
