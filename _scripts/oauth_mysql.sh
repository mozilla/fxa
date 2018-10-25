#!/bin/bash -ex
. ../_scripts/check_mysql.sh

check_mysql
mysqlStarted=$?

if [ "$mysqlStarted" ]; then
  node ../fxa-auth-server/fxa-oauth-server/bin/server.js 
fi
