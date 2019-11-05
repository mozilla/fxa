/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable no-console */
var cp = require('child_process');
var request = require('request');

function TestServer(config) {
  this.url = 'http://127.0.0.1:' + config.listen.port;
  this.server = null;
}

function waitLoop(testServer, url, cb) {
  request(url + '/', function(err, res /*, body*/) {
    if (err) {
      if (err.errno !== 'ECONNREFUSED') {
        console.log('ERROR: unexpected result from ' + url);
        console.log(err);
        return cb(err);
      }
      return setTimeout(waitLoop.bind(null, testServer, url, cb), 100);
    }
    if (res.statusCode !== 200) {
      console.log('ERROR: bad status code: ' + res.statusCode);
      return cb(res.statusCode);
    }
    return cb();
  });
}

function isDebug() {
  return global.v8debug ? true : false;
}

TestServer.prototype.start = function(cb) {
  if (! this.server) {
    var spawnOptions = ['./customs_server_stub.js'];

    var nextDebugPort = process.debugPort + 2;
    if (isDebug()) {
      spawnOptions.unshift('--debug-brk=' + nextDebugPort);
    }

    this.server = cp.spawn('node', spawnOptions, {
      cwd: __dirname,
      stdio: isDebug() ? 'pipe' : 'ignore',
    });

    // Always log console when debugging
    if (isDebug()) {
      this.server.stdout.on('data', process.stdout.write.bind(process.stdout));
      this.server.stderr.on('data', process.stderr.write.bind(process.stderr));
    }
  }

  waitLoop(this, this.url, function(err) {
    if (err) {
      cb(err);
    } else {
      cb(null);
    }
  });
};

TestServer.prototype.stop = function() {
  if (this.server) {
    this.server.kill('SIGINT');
  }
};

module.exports = TestServer;
