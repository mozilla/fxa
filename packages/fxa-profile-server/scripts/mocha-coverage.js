#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const path = require('path');
const spawn = require('child_process').spawn;

const MOCHA_BIN = path.join(
  path.dirname(__dirname),
  'node_modules',
  '.bin',
  'mocha'
);
const NYC_BIN = path.join(
  path.dirname(__dirname),
  'node_modules',
  '.bin',
  'nyc'
);

let bin = NYC_BIN;
let argv = ['--cache', MOCHA_BIN];

if (process.env.NO_COVERAGE) {
  bin = MOCHA_BIN;
  argv = [];
}

const p = spawn(bin, argv.concat(process.argv.slice(2)), {
  stdio: 'inherit',
  env: process.env,
});

// exit this process with the same exit code as the test process
p.on('close', function(code) {
  process.exit(code);
});
