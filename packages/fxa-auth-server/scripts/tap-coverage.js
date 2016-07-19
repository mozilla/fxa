#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path'),
  spawn = require('child_process').spawn

var COVERAGE_ARGS = ['--coverage', '--cov']
if (process.env.NO_COVERAGE) {
  COVERAGE_ARGS = []
}

var p = spawn(path.join(path.dirname(__dirname), 'node_modules', '.bin', 'tap'),
  process.argv.slice(2).concat(COVERAGE_ARGS), { stdio: 'inherit', env: process.env })

// exit this process with the same exit code as the test process
p.on('close', function (code) {
  process.exit(code)
})
