#!/usr/bin/env bash
node ./scripts/gen_keys.js
node ./node_modules/fxa-customs-server/bin/customs_server.js &
CS=$!
node ./test/mail_helper.js &
MH=$!
node ./bin/key_server.js | node ./bin/notifier.js >/dev/null

kill $CS
kill $MH
