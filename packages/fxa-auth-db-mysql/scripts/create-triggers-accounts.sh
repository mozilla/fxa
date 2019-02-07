#!/usr/bin/env sh

set -ex

#############################################
#                                           #    
# WARNING: IF $REMOVE_OLD_FXA_DB, this will #
# delete your local fxa database!!!         # 
#                                           #    
#############################################

# Optionally, initialize a new, empty database.
if [ ! -z "$REMOVE_OLD_FXA_DB" ]; then
  mysql fxa -e 'DROP DATABASE IF EXISTS fxa'
  node ./bin/db_patcher.js
fi

# Create _accounts_new from accounts, install the DEL/UPD/INS triggers, and compare.
mysql fxa < ./scripts/create-triggers-accounts.sql
mysql fxa -e 'show create table accounts\G show create table _accounts_new\G show triggers\G'
mysql fxa < ./scripts/union-compare-two-tables.sql

# Run equiv. of `npm run test-mysql`, populating some rows and check that accounts
# and _accounts_new have the same data.
NO_COVERAGE=1 node ./scripts/mocha-coverage.js test/backend test/local --exit
mysql fxa < ./scripts/union-compare-two-tables.sql

