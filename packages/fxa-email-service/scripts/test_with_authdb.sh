#!/bin/sh

set -e

cd ../fxa-auth-db-mysql
npm ci
node ./bin/db_patcher
node ./bin/server > fxa-auth-db-mysql.log 2>&1 &
DB_PID="$!"
cd ../fxa-email-service

if [ -z "$FXA_EMAIL_LOG_LEVEL" ]; then
  export FXA_EMAIL_LOG_LEVEL=off
fi

export RUST_BACKTRACE=1

cargo test -- --test-threads=1

kill -15 "$DB_PID"
