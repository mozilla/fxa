#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path'),
      spawn = require('child_process').spawn,
      config = require('../server/lib/configuration');


startServer();

function startServer() {
  process.chdir(path.dirname(__dirname));
  // We'll get PORT via config/local.json
  delete process.env['PORT'];

  // TODO what if there is no local.json?
  var fabPath = path.join(process.cwd(), 'server', 'bin', 'fxa-content-server.js');
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
