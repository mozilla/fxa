#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path');
var spawn = require('child_process').spawn;

var BIN_ROOT = path.join(__dirname, '..', 'server', 'bin');

module.exports = function (done) {
  process.chdir(path.dirname(__dirname));

  var fabPath = path.join(BIN_ROOT, 'fxa-content-server.js');
  var fxaccntbridge = spawn('node', [fabPath]);
  fxaccntbridge.stdout.pipe(process.stdout);
  fxaccntbridge.stderr.pipe(process.stderr);
  fxaccntbridge.on('exit', function (code, signal) {
    console.log('fxa-content-server killed, exiting');
    if (done) {
      done(code === 0);
    } else {
      process.exit(code); //eslint-disable-line no-process-exit
    }
  });
};

// only start the server if the file is called directly, otherwise wait until
// module.exports is called.
if (process.argv[1] === __filename) {
  module.exports();
}
