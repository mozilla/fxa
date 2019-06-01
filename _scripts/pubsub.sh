#!/bin/bash -ex

# This docker image doesn't react to SIGINTs (Ctrl+C) which is used by
# pm2 to kill processes.
# We go around this by defining a SIGINT handler, running docker in the
# background (but still logging on the screen), and running a read to keep
# the script running.

function on_sigint() {
  echo "PubSub Emulator shutting down."
  docker stop pubsub
  exit 0
}

trap on_sigint INT

# Create pushbox db on start (because pushbox doesn't create it)
docker run --rm --name=pubsub \
  -p 8005:8085 \
  knarz/pubsub-emulator &

while :; do read; done
