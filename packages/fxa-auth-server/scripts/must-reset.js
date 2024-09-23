/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

 Usage:

 scripts/must-reset.js -e -i ./reset.txt

 reset.txt is a plain text file with one email address per line

 This script is used to put user accounts into a "must reset" state. It uses the
 same config file as key_server.js so should be run from a production instance.

 This script does not notify the users.  You'll want to use `bulk-mailer.js` for that.

 /*/

'use strict';

// HACK: Prevent config falling over due to missing secrets
process.env.NODE_ENV = 'dev';

import commandLineOptions from 'commander';
import fs from 'fs';
import main from './must-reset/index';
import path from 'path';

commandLineOptions
  .option('-e, --emails [emails]', 'Email addresses')
  .option('-u, --uids [uids]', 'User IDs')
  .option('-i, --input <filename>', 'Input filename from which to read input')
  .parse(process.argv);

if (!commandLineOptions.input) {
  console.error(`-i, --input required`);
  process.exit(1);
} else if (!commandLineOptions.emails && !commandLineOptions.uids) {
  console.error('One of `emails` or `uids` must be specified');
  process.exit(1);
} else if (commandLineOptions.emails && commandLineOptions.uids) {
  console.error('Only one of `emails` or `uids` can be specified, not both');
  process.exit(1);
}

let emails = [];
let uids = [];

if (commandLineOptions.emails) {
  emails = getItems();
} else if (commandLineOptions.uids) {
  uids = getItems();
}

if (!emails.length && !uids.length) {
  console.error('No `emails` or `uids` found inside the specified file');
  process.exit(1);
}

function getItems() {
  try {
    const input = fs
      .readFileSync(path.resolve(commandLineOptions.input))
      .toString('utf8');

    return adjustText(input);
  } catch (err) {
    console.error('No such file or directory');
    process.exit(1);
  }
}

function adjustText(input = '') {
  if (!input.length) {
    return [];
  }

  return input
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter((s) => !!s.length);
}

const keys = emails.length ? emails : uids;
const dbFunction = emails.length ? 'accountRecord' : 'account';
main(keys, dbFunction);
