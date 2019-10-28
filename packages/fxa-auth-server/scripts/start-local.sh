#!/usr/bin/env bash

set -euo pipefail

node ./scripts/gen_keys.js
NODE_ENV=dev ./scripts/oauth_gen_keys.js
node ./scripts/gen_vapid_keys.js
node ./test/mail_helper.js &
MH=$!

if [ -e "../../_scripts/clone-authdb.sh" ]; then
  DB=`../../_scripts/clone-authdb.sh run local`
else
  node fxa-auth-db-mysql/bin/mem > fxa-auth-db-mysql.log 2>&1 &
  DB=$!
fi

NODE_ENV=dev node ./fxa-oauth-server/bin/server.js &
OA=$!

node ./bin/key_server.js

kill $MH
kill $DB
kill $OA
