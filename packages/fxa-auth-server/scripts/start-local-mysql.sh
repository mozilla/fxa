#!/usr/bin/env bash
node ./scripts/gen_keys.js
node ./test/mail_helper.js &
MH=$!
ls ./node_modules/fxa-auth-db-mysql/node_modules/mysql-patcher || npm i ./node_modules/fxa-auth-db-mysql
node ./node_modules/fxa-auth-db-mysql/bin/db_patcher.js
node ./node_modules/fxa-auth-db-mysql/bin/server.js &
DB=$!

node ./bin/key_server.js | node ./bin/notifier.js >/dev/null

kill $MH
kill $DB
