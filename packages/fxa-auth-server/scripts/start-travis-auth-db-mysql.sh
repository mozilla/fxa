#!/usr/bin/env bash

set -ev

node ./scripts/gen_keys.js

# Force install of mysql-patcher
(cd node_modules/fxa-auth-db-mysql && npm install &>/var/tmp/db-mysql.out)

mysql -e 'DROP DATABASE IF EXISTS fxa'
node ./node_modules/fxa-auth-db-mysql/bin/db_patcher.js

# Start backgrounded fxa-auth-db-mysql server
nohup node ./node_modules/fxa-auth-db-mysql/bin/server.js &>>/var/tmp/db-mysql.out &

# Give auth-db-mysql a moment to start up
sleep 5

# This curl will cause a test fail if no connection
# TODO: in the future, check that response contains "implementation: 'MySql'"
curl http://127.0.0.1:8000/; echo
