#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const cp = require('child_process');
const path = require('path');
const opn = require('opn');

var emberBuild = cp.spawn(path.join(__dirname, '..', 'node_modules', '.bin', 'ember'), ['build', '--watch'], { stdio: 'inherit' });
emberBuild.on('exit', process.exit);

var server = cp.spawn(path.join(__dirname, '..', 'node_modules', '.bin', 'nodemon'), ['bin/server.js', '--watch', 'lib'], { stdio: 'inherit' });
server.on('exit', process.exit);

setTimeout(function() {
  // TODO: support custom port
  opn('http://127.0.0.1:10137');
}, 5000);

