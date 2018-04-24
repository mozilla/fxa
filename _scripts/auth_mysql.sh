#!/bin/bash -ex
. ../_scripts/check_mysql.sh

check_mysql
mysqlStarted=$?

if [ "$mysqlStarted" ]; then
  node ../fxa-auth-db-mysql/bin/db_patcher.js && node ../fxa-auth-db-mysql/bin/server.js
fi
