/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

require('ass')
var dbServer = require('../../fxa-auth-db-server')
var log = require('../lib/log')
var DB = require('../../lib/db/mysql')(log, dbServer.errors)
var config = require('../../config')
var test = require('tap').test
var patch = require('../../lib/db/patch')

patch.level = 1000000

DB.connect(config)
  .then(
    function (db) {
      test(
        'the connect should fail and we will never get here',
        function (t) {
          t.fail('DB.connect should have failed on an incorrect patchVersion')
          t.end()
          db.close()
        }
      )
    },
    function(err) {
      test(
        'an incorrect patchVersion should throw',
        function (t) {
          t.type(err, 'object', 'err is an object')
          t.ok(err instanceof Error, 'err is instanceof Error')
          t.equals(err.message, 'dbIncorrectPatchLevel', 'err.message is dbIncorrectPatchLevel')
          t.end()
          // defer to allow node-tap to finish its work
          process.nextTick(process.exit)
        }
      )
    }
  )
