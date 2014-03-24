#!/usr/bin/env bash
node ./bin/db_patcher.js
node ./scripts/gen_keys.js
node ./bin/mail_helper.js &

node ./bin/key_server.js | node ./bin/notifier.js >/dev/null
