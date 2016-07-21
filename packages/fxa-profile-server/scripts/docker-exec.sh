#!/usr/bin/env bash

if [ "$1" == "test" ]; then
  exec npm test
elif [ "$1" == "web" ]; then
  exec node bin/server.js
elif [ "$1" == "worker" ]; then
  exec node bin/worker.js
else
  echo "unknown mode: $1"
  exit 1
fi
