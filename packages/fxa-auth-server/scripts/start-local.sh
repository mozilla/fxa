#!/bin/bash -e

export NODE_ENV=dev

yarn gen-keys
../../_scripts/check-mysql.sh
pm2 start pm2.config.js

../../_scripts/check-url.sh localhost:9000/__heartbeat__
