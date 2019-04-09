#!/usr/bin/env bash

set -euo pipefail

node ./scripts/gen_keys.js
node ./fxa-oauth-server/scripts/gen_keys.js
node ./scripts/gen_vapid_keys.js
node ./test/mail_helper.js &
MH=$!
ls ../fxa-auth-db-mysql/node_modules/mysql-patcher || npm i ../fxa-auth-db-mysql
node ../fxa-auth-db-mysql/bin/db_patcher.js
node ../fxa-auth-db-mysql/bin/server.js &
DB=$!

node ./bin/key_server.js

kill $MH
kill $DB
