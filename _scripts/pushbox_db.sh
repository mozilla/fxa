#!/bin/sh -ex

# This docker image doesn't react to SIGINTs (Ctrl+C) which is used by
# pm2 to kill processes.
# We go around this by defining a SIGINT handler, running docker in the
# background (but still logging on the screen), and running a read to keep
# the script running.

function on_singint() {
  echo "Pushbox DB shutting down."
  docker stop pushbox_db
  exit 0
}

trap on_singint INT

docker run --rm --name pushbox_db \
  --network host \
  -p 4306:3306 \
  -e MYSQL_ROOT_PASSWORD=random \
  -e MYSQL_DATABASE=pushbox \
  -e MYSQL_USER=test \
  -e MYSQL_PASSWORD=test \
  mysql/mysql-server:5.6 &

while :; do read; done
