#!/usr/bin/env bash

if [ "$1" == "test" ]; then
  exec npm test
elif [ "$1" == "web" ]; then
  exec node bin/server.js
elif [ "$1" == "internal" ]; then
  exec node bin/internal.js
elif [ "$1" == "purge_expired_tokens" ]; then
  exec node bin/purge_expired_tokens.js
elif [ "$1" == "gen_keys" ]; then
  exec node scripts/gen_keys.js
else
  echo "unknown mode: $1"
  exit 1
fi
