#!/usr/bin/env bash

set -euo pipefail

node ./scripts/gen_keys.js
NODE_ENV=dev node ./scripts/oauth_gen_keys.js
node ./scripts/gen_vapid_keys.js
node ./test/mail_helper.js &
MH=$!

if [ -e "../../_scripts/clone-authdb.sh" ]; then
  DB=`../../_scripts/clone-authdb.sh run`
else
  ls fxa-auth-db-mysql/node_modules/mysql-patcher || npm i ./fxa-auth-db-mysql
  node fxa-auth-db-mysql/bin/db_patcher
  node fxa-auth-db-mysql/bin/server > fxa-auth-db-mysql.log 2>&1 &
  DB=$!
fi

node ./bin/key_server.js

kill $MH
kill $DB
