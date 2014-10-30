/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('ass')
var dbServer = require('fxa-auth-db-server')
var backendTests = require('fxa-auth-db-server/test/backend')
var config = require('../../config')
var log = { trace: console.log, error: console.log, stat: console.log, info: console.log }
var DB = require('../../db/mysql')(log, dbServer.errors)
var P = require('bluebird')

var server

// defer to allow ass code coverage results to complete processing
if (process.env.ASS_CODE_COVERAGE) {
  process.on('SIGINT', function() {
    process.nextTick(process.exit)
  })
}

var db

DB.connect(config)
  .then(function (newDb) {
    db = newDb
    server = dbServer.createServer(db)
    var d = P.defer()
    server.listen(config.port, config.hostname, function() {
      d.resolve()
    })
    server.on('failure', function (d) { console.error(d.err.code, d.url)})
    server.on('success', function (d) { console.log(d.method, d.url)})
    return d.promise
  })
  .then(function() {
    return backendTests.remote(config)
  })
  .then(function() {
    server.close()
    db.close()
  })
