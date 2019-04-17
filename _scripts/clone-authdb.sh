#!/bin/sh

set -e

SCRIPT_DIR=`dirname "$0"`
DB_PACKAGE=fxa-auth-db-mysql
DB_DIR="$SCRIPT_DIR/../packages/$DB_PACKAGE"

rm -rf "$DB_PACKAGE"
cp -R "$DB_DIR" "$DB_PACKAGE"
cd "$DB_PACKAGE"

npm ci > /dev/null 2>&1

if [ "$1" = "run" ]; then
  if [ "$2" = "local" ]; then
    DB_SCRIPT="bin/mem"
  else
    node bin/db_patcher > /dev/null
    DB_SCRIPT="bin/server"
  fi
  node "$DB_SCRIPT" > "../$DB_PACKAGE.log" 2>&1 &
  DB_PID=$!
  echo "$DB_PID"
  sleep 1
fi

cd ..
