#!/usr/bin/env bash
node ./scripts/gen_keys.js
node ./test/mail_helper.js &
MH=$!

node ./bin/key_server.js | node ./bin/notifier.js >/dev/null

kill $MH
