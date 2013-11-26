/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const
cp = require('child_process'),
path = require('path');

function later(cb /* args */) {
  var args = Array.prototype.slice.call(arguments, 1);
  process.nextTick(function() {
    cb.apply(null, args);
  });
}

function Verifier(args) {
  if (!args) args = {};
  this.args = args;
  this.config = {};
}

Verifier.prototype.setFallback = function(idp) {
  this.config.fallback = idp.domain();
};

Verifier.prototype.start = function(cb) {
  var repoBaseDir = path.join(__dirname, '..', '..');

  if (this.process) {
    return later(cb, null);
  }

  this.process = cp.spawn(
    path.join(repoBaseDir, 'server.js'),
    null,
    { cwd: repoBaseDir, silent: true, stdio: 'pipe' });

  this.process.stdout.on('data', function(line) {
    console.log('stdout', line.toString());
  });

  this.process.stderr.on('data', function(line) {
    console.log('stderr', line.toString());
  });

  return later(cb, null);
};

Verifier.prototype.stop = function(cb) {
  cb('not implemented');
};

module.exports = Verifier;
