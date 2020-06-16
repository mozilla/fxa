#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const path = require('path');
const spawn = require('child_process').spawn;

const MOCHA_BIN = path.join(
  path.dirname(require.resolve('mocha')),
  'bin',
  'mocha'
);
const NYC_BIN = path.join(
  path.dirname(require.resolve('nyc')),
  'bin',
  'nyc.js'
);

const bin = NYC_BIN;
const argv = [
  '--cache',
  '--no-clean',
  '--reporter=lcov',
  '--report-dir=coverage',
  MOCHA_BIN,
];

const p = spawn(bin, argv.concat(process.argv.slice(2)), {
  stdio: 'inherit',
  env: process.env,
});

// exit this process with the same exit code as the test process
p.on('close', (code) => {
  process.exit(code);
});
