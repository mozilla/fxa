/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

require('ass')
var dbServer = require('fxa-auth-db-server')
var backendTests = require('fxa-auth-db-server/test/backend')
var config = require('../../config')
var noop = function () {}
var log = { trace: noop, error: noop, stat: noop, info: noop }
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
    return d.promise
  })
  .then(function() {
    return backendTests.remote(config)
  })
  .then(function() {
    server.close()
    db.close()
  })
