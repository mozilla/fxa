#!/bin/bash -ex
. ../_scripts/check_mysql.sh

check_mysql
mysqlStarted=$?

if [ "$mysqlStarted" ]; then
  node ../packages/fxa-auth-db-mysql/bin/db_patcher.js && node ../packages/fxa-auth-db-mysql/bin/server.js
fi
