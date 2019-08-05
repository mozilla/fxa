#!/bin/sh

set -e

if [ -z "$NODE_ENV" ]; then export NODE_ENV=dev; fi;
if [ -z "$CORS_ORIGIN" ]; then export CORS_ORIGIN="http://foo,http://bar"; fi;

set -u

DEFAULT_ARGS="-R dot --recursive --timeout 5000 --exit"

./scripts/gen_keys.js
./scripts/gen_vapid_keys.js
node ./fxa-oauth-server/scripts/gen_keys.js

if [ ! -e fxa-auth-db-mysql ] && [ -e "../../_scripts/clone-authdb.sh" ]; then
  ../../_scripts/clone-authdb.sh
fi

grunt eslint copyright
