/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* jshint curly:false */

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
  if (idp === null) delete this.config.fallback;
  else this.config.fallback = idp.domain();
};

Verifier.prototype.setHTTPTimeout = function(timeo) {
  this.config.httpTimeout = timeo;
};

Verifier.prototype.url = function() {
  if (!this._url) {
    throw new Error("verifier not running");
  }
  return this._url;
};

Verifier.prototype.start = function(cb) {
  var self = this;

  var repoBaseDir = path.join(__dirname, '..', '..');

  if (this.process) {
    return later(cb, null);
  }

  this.process = cp.spawn(
    process.execPath,
    [
      path.join(repoBaseDir, 'server.js')
    ],
    {
      cwd: repoBaseDir,
      stdio: 'pipe',
      env: {
        INSECURE_SSL: true,
        REPORT_COVERAGE_DIR: process.env.REPORT_COVERAGE_DIR,
        FALLBACK_DOMAIN: this.config.fallback,
        HTTP_TIMEOUT: this.config.httpTimeout || 8.0
      }
    });

  this.process.stdout.on('data', function(line) {
    var m;
    // figure out the bound port
    if ((m = /^INFO: running on (http:\/\/.*)$/m.exec(line))) {
      self._url = m[1];
      if (cb) {
        cb(null, m[1]);
      }
      cb = null;
    }
    if (process.env.VERBOSE) {
      console.log(line.toString());
    }
  });

  this.errBuf = "";
  this.process.stderr.on('data', function(d) {
    self.errBuf += d.toString();
  });

  this.process.on('exit', function(code) {
    var msg = "exited";
    if (code !== 0) {
      msg += " with code " + code + " (" + self.errBuf + ")";
      console.error(msg);
    }
    if (cb) cb(msg);
    cb = null;
    self._url = null;
    self.process = null;
  });
};

Verifier.prototype.stop = function(cb) {
  if (!this.process || !this._url) {
    throw new Error("verifier not running");
  }
  this.process.kill('SIGINT');
  this.process.on('exit', function(code) {
    cb(code === 0 ? null : "non-zero exit code: " + code);
  });
};

module.exports = Verifier;
