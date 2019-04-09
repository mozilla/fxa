#!/usr/bin/env bash

set -euo pipefail

node ./scripts/gen_keys.js
node ./fxa-oauth-server/scripts/gen_keys.js
node ./scripts/gen_vapid_keys.js
node ./test/mail_helper.js &
MH=$!
node ../fxa-auth-db-mysql/bin/mem.js &
DB=$!
NODE_ENV=dev node ./fxa-oauth-server/bin/server.js &
OA=$!

node ./bin/key_server.js

kill $MH
kill $DB
kill $OA
