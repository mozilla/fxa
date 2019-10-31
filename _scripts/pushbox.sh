#!/bin/sh -ex
sleep 3 # Give 3 secs to the mysql server to start
. _scripts/check_mysql.sh

# This docker image doesn't react to SIGINTs (Ctrl+C) which is used by
# pm2 to kill processes.
# We go around this by defining a SIGINT handler, running docker in the
# background (but still logging on the screen), and running a read to keep
# the script running.

function on_singint() {
  echo "Pushbox shutting down."
  docker stop pushbox
  exit 0
}

MYSQL_HOST_PORT=${1:-4306}
MYSQL_URI=${2:-test:test@pushbox_db:3306} #3306 because -p is only for the host.

check_mysql $MYSQL_HOST_PORT
mysqlStarted=$?

if [ "$mysqlStarted" ]; then

  trap on_singint INT

  docker run --rm --name pushbox \
    -p 8002:8002 \
    -e ROCKET_PORT=8002 \
    -e ROCKET_SERVER_TOKEN=Correct_Horse_Battery_Staple_1 \
    -e ROCKET_DATABASE_URL=mysql://$MYSQL_URI/pushbox \
    mozilla/pushbox &

  while :; do read; done
fi
