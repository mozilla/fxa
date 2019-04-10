#!/bin/sh

set -e

DB_REPO=fxa-auth-db-mysql

rm -rf "$DB_REPO"
git init "$DB_REPO" > /dev/null
cd "$DB_REPO"

git remote add origin https://github.com/mozilla/fxa.git
git config core.sparseCheckout true
echo "packages/$DB_REPO/*" > .git/info/sparse-checkout
git pull --depth=1 origin master > /dev/null 2>&1
mv packages/$DB_REPO/* .
rm -rf packages

npm ci > /dev/null 2>&1

if [ "$1" = "run" ]; then
  if [ "$2" = "local" ]; then
    DB_SCRIPT="bin/mem"
  else
    node bin/db_patcher > /dev/null
    DB_SCRIPT="bin/server"
  fi
  node "$DB_SCRIPT" > "../$DB_REPO.log" 2>&1 &
  DB_PID=$!
  echo "$DB_PID"
  sleep 1
fi

cd ..
