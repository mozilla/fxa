#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const cp = require('child_process');
const path = require('path');

var config = require('../lib/config').get('server');
console.log(config); // eslint-disable-line no-console

var emberBuild = cp.spawn(
  path.join(__dirname, '..', 'node_modules', '.bin', 'ember'),
  ['build', '--watch'],
  { stdio: 'inherit' }
);
emberBuild.on('exit', process.exit);

var server = cp.spawn(
  path.join(__dirname, '..', 'node_modules', '.bin', 'nodemon'),
  ['bin/server.js', '--watch', 'lib'],
  { stdio: 'inherit' }
);
server.on('exit', process.exit);

var port = config.port === '80' ? '' : ':' + config.port;
console.log('Console is available at:', 'http://' + config.host + port); // eslint-disable-line no-console
