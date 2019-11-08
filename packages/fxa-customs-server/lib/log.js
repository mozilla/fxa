/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var util = require('util');
var Logger = require('bunyan');

function Overdrive(options) {
  Logger.call(this, options);
}
util.inherits(Overdrive, Logger);

Overdrive.prototype.stat = function(stats) {
  stats.op = 'stat';
  this.info(stats);
};

module.exports = function(level, name) {
  var logStreams = [{ stream: process.stderr, level: level }];
  name = name || 'fxa-auth-server';

  var log = new Overdrive({
    name: name,
    streams: logStreams,
  });

  process.stdout.on('error', function(err) {
    if (err.code === 'EPIPE') {
      log.emit('error', err);
    }
  });

  Object.keys(console).forEach(function(key) {
    // eslint-disable-next-line no-console
    console[key] = function() {
      var json = { op: 'console', message: util.format.apply(null, arguments) };
      if (log[key]) {
        log[key](json);
      } else {
        log.warn(json);
      }
    };
  });

  return log;
};
