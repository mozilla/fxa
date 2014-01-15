#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const spawn = require('child_process').spawn;


const BIN_ROOT = path.join(__dirname, '..', 'server', 'bin');

module.exports = function (done) {
  process.chdir(path.dirname(__dirname));
  // We'll get PORT via config/local.json
  // This is required for Travis-CI to work correctly.
  delete process.env['PORT'];

  var fabPath = path.join(BIN_ROOT, 'fxa-content-server.js');
  var fxaccntbridge = spawn('node', [fabPath]);
  fxaccntbridge.stdout.on('data', function(data) {
    console.log('fxa-content-server:', data.toString('utf8').trim());
  });
  fxaccntbridge.stderr.on('data', function(data) {
    console.log('fxa-content-server err:', data.toString('utf8').trim());
  });
  fxaccntbridge.on('exit', function (code, signal) {
    console.log('fxa-content-server killed, existing');
    if (done) {
      done(code);
    } else {
      process.exit(code);
    }
  });
};

// only start the server if the file is called directly, otherwise wait until
// module.exports is called.
if (process.argv[1] === __filename) {
  module.exports();
}

