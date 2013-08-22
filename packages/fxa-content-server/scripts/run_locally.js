#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path'),
      spawn = require('child_process').spawn,
      config = require('../server/lib/configuration');

// TODO what if priv or pub key don't exist?

// Certifier can't be run in the same process,
// convict's schema mapping wil get messed up.
// So we must run as a process
var certifierPath = path.join(__dirname, '..', 'server', 'bin', 'browserid-certifier.js');
var certifier = spawn('node', [certifierPath]);
certifier.stdout.on('data', function(data) {
  var msg = data.toString('utf8');
  if (msg.indexOf('Certifier started') !== -1) {
    console.log(msg);
    startFAB();
  }
});

certifier.stderr.on('data', function(data) {
  console.error('CERTIFIER ERR:', data.toString('utf8'));
});

function startFAB() {
  process.chdir(path.dirname(__dirname));
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
