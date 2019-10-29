#!/bin/sh -ex

# This docker image doesn't react to SIGINTs (Ctrl+C) which is used by
# pm2 to kill processes.
# We go around this by defining a SIGINT handler, running docker in the
# background (but still logging on the screen), and running a read to keep
# the script running.

function on_sigint() {
  echo "fxa-email-service shutting down."
  docker stop fxa_email_service
  exit 0
}

trap on_sigint INT

docker run --rm --name fxa_email_service \
  --network host \
  -e NODE_ENV=dev \
  -e FXA_EMAIL_ENV=dev \
  -e FXA_EMAIL_LOG_LEVEL=debug \
  -e RUST_BACKTRACE=1 \
  -p 8001:8001 mozilla/fxa-email-service &

while :; do read; done
