#!/bin/bash -ex

DIR=$(dirname "$0")

# This docker image doesn't react to SIGINTs (Ctrl+C) which is used by
# pm2 to kill processes.
# We go around this by defining a SIGINT handler, running docker in the
# background (but still logging on the screen), and running a read to keep
# the script running.

function on_sigint() {
  echo "MySQL shutting down."
  docker stop mydb
  exit 0
}

trap on_sigint INT

# Create pushbox db on start (because pushbox doesn't create it)
docker run --rm --name=mydb \
  -e MYSQL_ALLOW_EMPTY_PASSWORD=true \
  -e MYSQL_ROOT_HOST=% \
  -e MYSQL_DATABASE=pushbox \
  -p 3306:3306 \
  mysql/mysql-server:8.0 --default-authentication-plugin=mysql_native_password &

cd "$DIR"
./check-mysql.sh

node ../packages/db-migrations/bin/patcher.mjs

while :; do read -r; done
