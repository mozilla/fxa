/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('ass')
var dbServer = require('fxa-auth-db-server')
var dbTests = require('fxa-auth-db-server/test').dbTests
var log = { trace: console.log, error: console.log, stat: console.log, info: console.log }
var DB = require('../../db/mysql')(log, dbServer.errors)

var config = require('../../config')

dbTests(config, DB)
