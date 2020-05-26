#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const cp = require('child_process');
const path = require('path');

const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

process.env.NODE_ENV = 'development';

var childServer = cp.fork(path.join(__dirname, '..', 'bin', 'server.js'));
childServer.on('exit', process.exit);

var childWorker = cp.fork(path.join(__dirname, '..', 'bin', 'worker.js'));
childWorker.on('exit', process.exit);

mkdirp.sync(path.join(__dirname, '..', 'var', 'public'));
var childStatic = cp.fork(path.join(__dirname, '..', 'bin', '_static.js'));
childStatic.on('exit', process.exit);

process.on('exit', function () {
  try {
    // if one of the child processes crashes or exits then we stop everything else.
    childServer.kill();
    childWorker.kill();
    childStatic.kill();
  } catch (e) {
    console.log(e); // eslint-disable-line no-console
  }
  rimraf.sync(path.join(__dirname, '..', 'var', 'public'));
});
