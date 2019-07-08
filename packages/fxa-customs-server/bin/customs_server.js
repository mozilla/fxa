#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This MUST be the first require in the program.
// Only `require()` the newrelic module if explicity enabled.
// If required, modules will be instrumented.
require('../lib/newrelic')();

var server = require('../lib/server');
var config = require('../lib/config').getProperties();
var log = require('../lib/log')(config.log.level, 'customs-server');

function shutdown(code) {
  process.nextTick(process.exit.bind(null, code));
}

if (process.env.ASS_CODE_COVERAGE) {
  process.on('SIGINT', shutdown);
}

server(config, log)
  .then(function(api) {
    return api.listen(config.listen.port, config.listen.host, function() {
      log.info({
        op: 'listening',
        host: config.listen.host,
        port: config.listen.port,
      });
    });
  })
  .catch(function(err) {
    log.error({ op: 'customs.bin.error', err: err });
    shutdown(1);
  });
