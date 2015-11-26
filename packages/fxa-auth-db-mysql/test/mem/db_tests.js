/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

require('ass')
var dbServer = require('../../fxa-auth-db-server')
var dbTests = require('../../fxa-auth-db-server/test/backend').dbTests
var log = require('../lib/log')
var DB = require('../../lib/db/mem')(log, dbServer.errors)
var config = require('../../config')

dbTests(config, DB)
