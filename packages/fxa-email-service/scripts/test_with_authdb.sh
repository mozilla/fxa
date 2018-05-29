#!/bin/sh

DB_REPO=fxa-auth-db-mysql

if [ ! -e "$DB_REPO" ]; then
  git clone "https://github.com/mozilla/$DB_REPO.git"
fi

RUNNING_DB_SERVERS=`ps -ef | grep "[n]ode bin/server" | wc -l`
if [ "$RUNNING_DB_SERVERS" -eq "0" ]; then
  cd "$DB_REPO"
  npm i
  node bin/db_patcher
  node bin/server 2>&1 > "$DB_REPO.log" &
  cd ..
fi

sleep 2

export RUST_BACKTRACE=1
cargo test -- --test-threads=1
