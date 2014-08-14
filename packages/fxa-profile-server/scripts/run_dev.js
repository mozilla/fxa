#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const cp = require('child_process');
const path = require('path');

const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

process.env.NODE_ENV = 'dev';

var child = cp.fork(path.join(__dirname, '..', 'bin', 'server.js'));
child.on('exit', process.exit);

child = cp.fork(path.join(__dirname, '..', 'bin', 'worker.js'));
child.on('exit', process.exit);


mkdirp.sync(path.join(__dirname, '..', 'var', 'public'));
child = cp.fork(path.join(__dirname, '..', 'bin', '_static.js'));
child.on('exit', process.exit);

process.on('exit', function() {
  rimraf.sync(path.join(__dirname, '..', 'var', 'public'));
});
