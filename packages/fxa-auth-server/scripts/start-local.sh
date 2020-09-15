#!/bin/bash -e

export NODE_ENV=dev

npm run gen-keys
../../_scripts/check-mysql.sh
ts-node ./scripts/oauth-db-patcher.js
pm2 start pm2.config.js
