#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path'),
      spawn = require('child_process').spawn;


const BIN_ROOT = path.join(__dirname, '..', 'server', 'bin');

startServer();

function startServer() {
  var fabPath = path.join(BIN_ROOT, 'fxa-content-server.js');
  var fxaccntbridge = spawn('node', [fabPath]);
  fxaccntbridge.stdout.on('data', function(data) {
    console.log('fxa-content-server:', data.toString('utf8'));
  });
  fxaccntbridge.stderr.on('data', function(data) {
    console.log('fxa-content-server err:', data.toString('utf8'));
  });
  fxaccntbridge.on('exit', function(code, signal) {
    console.log('fxa-content-server killed, existing');
    process.exit(1);
  });
}
