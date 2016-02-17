#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var server = require('../lib/server')
var config = require('../lib/config').root()
var log = require('../lib/log')(config.log.level, 'customs-server')

function shutdown() {
  process.nextTick(process.exit)
}

if (process.env.ASS_CODE_COVERAGE) {
  process.on('SIGINT', shutdown)
}

var api = server(config, log)
api.listen(
  config.listen.port,
  config.listen.host,
  function () {
    log.info({ op: 'listening', host: config.listen.host, port: config.listen.port })
  }
)
