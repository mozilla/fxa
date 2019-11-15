/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* jshint curly:false */

const cp = require('child_process'),
  path = require('path');

function later(cb /* args */) {
  var args = Array.prototype.slice.call(arguments, 1);
  process.nextTick(function() {
    cb.apply(null, args);
  });
}

function Verifier(args) {
  if (!args) {
    args = {};
  }
  this.config = args;
}

Verifier.prototype.setFallback = function(idp) {
  if (idp === null) delete this.config.fallback;
  else this.config.fallback = idp.domain();
};

Verifier.prototype.setHTTPTimeout = function(timeo) {
  this.config.httpTimeout = timeo;
};

Verifier.prototype.buffer = function(b) {
  if (b !== undefined) {
    if (!b) {
      delete this._outBuf;
    } else if (!this._outBuf) {
      this._outBuf = '';
    }
  }
  return this._outBuf;
};

Verifier.prototype.url = function() {
  return this.baseurl() + '/v2';
};

Verifier.prototype.v1url = function() {
  return this.baseurl();
};

Verifier.prototype.baseurl = function() {
  if (!this._url) {
    throw new Error('verifier not running');
  }
  return this._url;
};

Verifier.prototype.start = function(cb) {
  var self = this;

  var repoBaseDir = path.join(__dirname, '..', '..');

  if (this.process) {
    return later(cb, null);
  }

  var e = {
    INSECURE_SSL: true,
    HTTP_TIMEOUT: this.config.httpTimeout || 8.0,
  };

  if (this.config.fallback) {
    e.FALLBACK_DOMAIN = this.config.fallback;
  }

  if (this.config.files) {
    e.CONFIG_FILES = this.config.files;
  }

  if (this.config.testServiceFailure) {
    e.TEST_SERVICE_FAILURE = this.config.testServiceFailure;
  }

  this.process = cp.spawn(
    process.execPath,
    [path.join(repoBaseDir, 'tests', 'lib', 'test-server.js')],
    {
      cwd: repoBaseDir,
      stdio: 'pipe',
      env: e,
    }
  );

  this.process.stdout.on('data', function(line) {
    if (typeof self._outBuf === 'string') {
      self._outBuf += line;
    }

    // figure out the bound port
    try {
      var m = JSON.parse(line);
      if (m.Type === 'server.running') {
        self._url = m.Fields.url;
        if (cb) {
          cb(null, m.Fields.url);
        }
        cb = null;
      }
    } catch (err) {}

    if (process.env.VERBOSE) {
      console.log(line.toString());
    }
  });

  this.errBuf = '';
  this.process.stderr.on('data', function(d) {
    self.errBuf += d.toString();
  });

  this.process.on('exit', function(code) {
    var msg = 'exited';
    if (code !== 0) {
      msg += ' with code ' + code + ' (' + self.errBuf + ')';
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
    throw new Error('verifier not running');
  }
  this.process.kill('SIGINT');
  this.process.on('exit', function(code) {
    cb(!code ? null : 'non-zero exit code: ' + code);
  });
};

module.exports = Verifier;
