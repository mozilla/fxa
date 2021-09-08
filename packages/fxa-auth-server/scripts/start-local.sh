#!/bin/bash -e

export NODE_ENV=dev

npm run gen-keys
../../_scripts/check-mysql.sh
pm2 start pm2.config.js
