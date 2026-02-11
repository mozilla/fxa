/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const dumpUsers = require('./dump-users/index');
const fs = require('fs');
const path = require('path');
const program = require('commander');

program
  .option('-e, --emails [emails]', 'Email addresses to dump, comma separated')
  .option('-u, --uids [uids]', 'User IDs to dump, comma separated')
  .option(
    '-i, --input <filename>',
    'Input filename from which to read input if not specified on the command line'
  )
  .option('-p, --pretty', 'Display output in a pretty fashion')
  .parse(process.argv);

if (!program.emails && !program.uids) {
  console.error('One of `emails` or `uids` must be specified');
  process.exit(1);
} else if (program.emails && program.uids) {
  console.error('Only one of `emails` or `uids` can be specified, not both');
  process.exit(1);
}

let emails = [];
let uids = [];

if (program.emails) {
  emails = getItems('emails');
} else if (program.uids) {
  uids = getItems('uids');
}

if (!emails.length && !uids.length) {
  console.error('No `emails` or `uids` specified');
  process.exit(1);
}

const keys = emails.length ? emails : uids;
const dbFunc = emails.length ? 'accountRecord' : 'account';
dumpUsers(keys, dbFunc, program.pretty);

function getItems(type) {
  let input = '';
  if (typeof program[type] === 'string') {
    input = program[type];
  } else if (!program.input) {
    console.error(`--input must be specified if no argument given for ${type}`);
    process.exit(1);
  } else {
    input = fs
      .readFileSync(path.resolve(__dirname, program.input))
      .toString('utf8');
  }
  return marshallInput(input);
}

function marshallInput(input = '') {
  if (!input.length) {
    return [];
  }

  const items = input.split(/[,\s]+/);
  return items.filter((item) => !!item.trim().length);
}
