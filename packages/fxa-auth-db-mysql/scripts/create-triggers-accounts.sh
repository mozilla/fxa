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
fi

# Ensure `fxa`.`accounts` exists.
node ./bin/db_patcher.js

# Create _accounts_new from accounts, install the DEL/UPD/INS triggers.
mysql fxa < ./scripts/create-triggers-accounts.sql
mysql fxa -e 'show create table accounts\G show create table _accounts_new\G show triggers\G'
# Compare the two empty initial tables
mysql fxa < ./scripts/union-compare-two-tables.sql

# Run equiv. of `npm run test-mysql`, to create/delete/update some rows in
# `fxa`.`accounts`, and then compare that all those changes now appear in
# `fxa`.`_accounts_new`.
NO_COVERAGE=1 node ./scripts/mocha-coverage.js test/backend test/local --exit
mysql fxa < ./scripts/union-compare-two-tables.sql

