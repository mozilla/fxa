/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var dbServer = require('../../fxa-auth-db-server')
var backendTests = require('../../fxa-auth-db-server/test/backend')
var config = require('../../config')
var log = require('../lib/log')
var DB = require('../../lib/db/mem')(log, dbServer.errors)
var P = require('bluebird')

var server
var db

DB.connect(config)
  .then(function (newDb) {
    db = newDb
    server = dbServer.createServer(db)
    var d = P.defer()
    server.listen(config.port, config.hostname, function() {
      d.resolve(server)
    })
    return d.promise
  })
  .then(function(server) {
    return backendTests.remote(config, server)
  })
  .then(function() {
    server.close()
    db.close()
  })
