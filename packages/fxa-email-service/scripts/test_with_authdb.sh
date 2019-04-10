#!/bin/sh

set -e

if [ -e "../../_scripts/clone-authdb.sh" ]; then
  DB_PID=`../../_scripts/clone-authdb.sh run`
else
  node fxa-auth-db-mysql/bin/db_patcher
  node fxa-auth-db-mysql/bin/server > fxa-auth-db-mysql.log 2>&1 &
  DB_PID="$!"
fi

if [ -z "$FXA_EMAIL_LOG_LEVEL" ]; then
  export FXA_EMAIL_LOG_LEVEL=off
fi

export RUST_BACKTRACE=1

cargo test -- --test-threads=1

kill -15 "$DB_PID"
