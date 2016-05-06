#!/usr/bin/env bash

set -ev

# Force install of mysql-patcher
(cd node_modules/fxa-auth-db-mysql && npm install &>/var/tmp/db-mysql.out)

mysql -u root -e 'DROP DATABASE IF EXISTS fxa'
node ./node_modules/fxa-auth-db-mysql/bin/db_patcher.js

# Start backgrounded fxa-auth-db-mysql server
nohup node ./node_modules/fxa-auth-db-mysql/bin/server.js &>>/var/tmp/db-mysql.out &

# Give auth-db-mysql a moment to start up
sleep 5

# If either the curl fails to get a response, or the grep fails to match, this
# script will exit non-zero and fail the test run.
authdb_version=$(curl -s http://127.0.0.1:8000/__version__)
echo $authdb_version | grep '"implementation":"MySql"'
