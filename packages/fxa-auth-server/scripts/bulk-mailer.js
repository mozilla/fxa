#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// HACK: Prevent config falling over due to missing secrets
process.env.NODE_ENV = 'dev';

const program = require('commander');
const path = require('path');

program
  .option(
    '-b, --batchsize [size]',
    'Number of emails to send in a batch. Defaults to 10',
    parseInt
  )
  .option(
    '-d, --delay [seconds]',
    'Delay in seconds between batches. Defaults to 5',
    parseInt
  )
  .option('-i, --input <filename>', 'JSON user input file')
  .option('-m, --method <method>', 'Sender method to call')
  .option('-v, --verbose', 'Verbose logging')
  .option('-w, --write [directory]', 'Directory where emails should be stored')
  .option('--send', 'Send emails, for real. *** THIS REALLY SENDS ***')
  .parse(process.argv);

const BATCH_DELAY_MS =
  typeof program.delay === 'undefined' ? 5000 : program.delay * 1000;
const BATCH_SIZE = program.batchsize || 10;

const requiredOptions = ['input', 'method'];

requiredOptions.forEach(checkRequiredOption);

// Loading the bulk-mailer is slow, only do
// so after checking all the required options.
const bulkMailer = require('./bulk-mailer/index');

return bulkMailer(
  path.resolve(program.input),
  program.method,
  BATCH_SIZE,
  BATCH_DELAY_MS,
  program.send,
  program.write,
  program.verbose
).then(
  () => {
    console.log('done');
    process.exit(0);
  },
  (err) => {
    if (/InvalidMethodName/.test(err.message)) {
      console.error(program.method, 'is not a valid method. Can be one of:\n');
      console.error(` * ${err.validNames.sort().join('\n * ')}`);
    } else {
      console.error('Error', String(err));
    }
    process.exit(1);
  }
);

function checkRequiredOption(optionName) {
  if (!program[optionName]) {
    console.error(`--${optionName} is required`);
    process.exit(1);
  }
}
