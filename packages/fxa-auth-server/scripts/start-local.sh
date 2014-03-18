#!/usr/bin/env bash
node ./bin/db_patcher.js 2>&1 | ./node_modules/.bin/bunyan -o short
node ./scripts/gen_keys.js
node ./bin/mail_helper.js &

node ./bin/key_server.js | node ./bin/notifier.js
