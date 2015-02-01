/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var config = require('../config')
var dbServer = require('fxa-auth-db-server')
var error = dbServer.errors
var log = require('../log')(config.logLevel, 'db-api')
var DB = require('../db/mysql')(log, error)

function shutdown() {
  process.nextTick(process.exit)
}

// defer to allow ass code coverage results to complete processing
if (process.env.ASS_CODE_COVERAGE) {
  process.on('SIGINT', shutdown)
}

DB.connect(config)
  .done(function (db) {
    var server = dbServer.createServer(db)
    server.listen(config.port, config.hostname)
    server.on('error', function (err) {
      log.error({ op: 'server.start', err: { message: err.message } })
    })
    server.on('success', function (d) {
      log.info({ op: 'server.start', msg: 'running on ' + config.port })
    })
  })
