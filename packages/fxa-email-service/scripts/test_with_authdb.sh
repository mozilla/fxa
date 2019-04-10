#!/bin/sh

set -ex

DB_REPO=fxa-auth-db-mysql
if [ ! -e "$DB_REPO" ]; then
  git init "$DB_REPO"
  cd "$DB_REPO"
  git remote add origin https://github.com/mozilla/fxa.git
  git config core.sparseCheckout true
  echo "packages/$DB_REPO/*" > .git/info/sparse-checkout
  git pull --depth=1 origin master
  cd ..
fi

RUNNING_DB_SERVERS=`ps -ef | grep "[n]ode bin/server" | wc -l`
if [ "$RUNNING_DB_SERVERS" -eq "0" ]; then
  cd "$DB_REPO/packages/$DB_REPO"
  npm ci
  node bin/db_patcher
  node bin/server 2>&1 > "../../../$DB_REPO.log" &
  cd ..
fi

sleep 2

if [ -z "$FXA_EMAIL_LOG_LEVEL" ]; then
  export FXA_EMAIL_LOG_LEVEL=off
fi

export RUST_BACKTRACE=1

cargo test -- --test-threads=1
