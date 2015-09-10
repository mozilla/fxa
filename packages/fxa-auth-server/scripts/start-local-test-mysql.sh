#!/usr/bin/env bash

node ./scripts/gen_keys.js

ls ./node_modules/fxa-auth-db-mysql/node_modules/mysql-patcher || npm i ./node_modules/fxa-auth-db-mysql
node ./node_modules/fxa-auth-db-mysql/bin/db_patcher.js
node ./node_modules/fxa-auth-db-mysql/bin/server.js
