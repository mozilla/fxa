#!/bin/bash -ex
. ../../../_scripts/check_mysql.sh

check_mysql
mysqlStarted=$?

if [ "$mysqlStarted" ]; then
  node ./bin/server.js
fi
