#!/usr/bin/env bash
node ./scripts/gen_keys.js
node ./bin/mail_helper.js &
node ./bin/key_server.js 2>&1 | ./node_modules/bunyan/bin/bunyan -o short
killall mail_helper.js
