/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * This is browserid-local-verify wrapped in node-compute-cluster.
 *
 * It provides a "Verifier" class with a "verify" method just like the one
 * in browserid-local-verify, except that it farms out work to subprocesses
 * via node-compute-cluster rather than doing it inline.
 *
 * It's not a drop-in replacement for browserid-local-verify:
 *
 *   * There is only verify(), not lookup() or other methods.
 *
 *   * It doesn't emit async events like "debug" or "metrics" because
 *     there"s no support for that in node-compute-cluster.  Yet...
 *
 */

const util = require('util'),
  events = require('events'),
  path = require('path'),
  log = require('../log')('ccverifier'),
  config = require('../config'),
  cc = require('compute-cluster'),
  _ = require('underscore');

function Verifier(args) {
  events.EventEmitter.call(this);
  this.args = args;
  this.cc = new cc({
    module: path.join(__dirname, 'worker.js'),
    max_processes: config.get('computecluster.maxProcesses'),
    max_backlog: config.get('computecluster.maxBacklog'),
  })
    .on('error', function(err) {
      log.error('computeCluster.error', { err });
    })
    .on('info', function(msg) {
      log.info('computeCluster.info', { message: msg });
    })
    .on('debug', function(msg) {
      log.debug('computeCluster.debug', { message: msg });
    });
}

util.inherits(Verifier, events.EventEmitter);

const testServiceFailure = config.get('testServiceFailure');

Verifier.prototype.verify = function(args, cb) {
  if (! cb) {
    cb = args;
    args = {};
  }
  args = _.extend({}, this.args, args);
  this.cc.enqueue({ args: args }, function(err, res) {
    if (err || testServiceFailure) {
      // An error from the cluster itself.
      return cb('compute cluster error: ' + err);
    }
    if (res.err) {
      // An error from inside the verifier.
      return cb(res.err);
    } else {
      // A valid result from the verifier.
      return cb(null, res.res);
    }
  });
};

Verifier.prototype.shutdown = function() {
  this.cc.exit();
};

module.exports = Verifier;
