#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path'),
      spawn = require('child_process').spawn;

// Setup and run a browserid-certifer
process.env['IP_ADDRESS'] = "127.0.0.1";
process.env['ISSUER_HOSTNAME'] = "dev.fxaccounts.mozilla.org";
process.env['PORT'] = 0;
process.env['PUB_KEY_PATH'] = path.join(process.cwd(), 'server', 'var', 'key.publickey');
process.env['PRIV_KEY_PATH'] = path.join(process.cwd(), 'server', 'var', 'key.secretkey');
process.env['VAR_PATH'] = path.join(process.cwd(), 'server', 'var');

// TODO what if priv or pub key don't exist?

var certifier = require('browserid-certifier');
certifier.bin(function(err, port) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Started browserid-certifier on port', port);
  startFAB(port);
});

function startFAB(certifierPort) {
  process.chdir(path.dirname(__dirname));
  process.env['CERTIFIER_PORT'] = certifierPort;
  // We'll get PORT via config/local.json
  delete process.env['PORT'];

  // TODO what if there is no local.json?
  var fabPath = path.join(process.cwd(), 'server', 'bin', 'firefox_account_bridge.js');
  var fxaccntbridge = spawn('node', [fabPath]);
  fxaccntbridge.stdout.on('data', function(data) {
    console.log('FAB:', data.toString('utf8'));
  });
  fxaccntbridge.stderr.on('data', function(data) {
    console.log('FAB ERR:', data.toString('utf8'));
  });
  fxaccntbridge.on('exit', function(code, signal) {
    console.log('FAB killed, existing');
    process.exit(1);
  });
}