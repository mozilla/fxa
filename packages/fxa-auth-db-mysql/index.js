/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var config = require('./config')
var dbServer = require('fxa-auth-db-server')
var error = dbServer.errors
var log = require('./log')(config.logLevel, 'db-api')
var DB = require('./db/mysql')(log, error)

module.exports = function () {
  return DB.connect(config)
    .then(function (db) {
      return dbServer.createServer(db)
    })
}
