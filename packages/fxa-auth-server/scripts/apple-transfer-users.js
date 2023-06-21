/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// This script is used to import users from Apple into FxA. It consumes a CSV
// containing the Apple `transfer_sub` id and exchanges it for their profile information.
// It then creates/updates the user and links the Apple account to the FxA account.
// Example input file: /tests/fixtures/users-apple.csv
//
// Usage: node scripts/apple-transfer-users.js -i <input file> -o <output file>

const {ApplePocketFxAMigration} = require('./transfer-users/apple');

const program = require('commander');

const log = require('../lib/log')({});
const config = require('../config').config.getProperties();
const Token = require('../lib/tokens')(log, config);
const AuthDB = require('../lib/db')(config, log, Token);

program
  .option('-d, --delimiter [delimiter]', 'Delimiter for input file', ',')
  .option('-o, --output <filename>', 'Output filename to save results to', 'output.csv')
  .option(
    '-i, --input <filename>',
    'Input filename from which to read input if not specified on the command line',
  )
  .option('-m,  --mock', 'Mock FxA DB and Apple API calls', true)
  .parse(process.argv);

if (!program.input) {
  console.error('input file must be specified');
  process.exit(1);
}

async function main() {
  const migration = new ApplePocketFxAMigration(program.input, config, AuthDB, program.output, program.delimiter, program.mock);
  await migration.load();
  await migration.transferUsers();
  await migration.close();

  // For very large lists, we need to comment this out
  // or else the program will exit before writing contents to output
  if (process.env.NODE_ENV === 'dev') {
    process.exit();
  }
}

main();

