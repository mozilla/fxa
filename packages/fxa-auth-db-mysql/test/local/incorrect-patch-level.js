/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('ass')
var P = require('../../promise')
var test = require('tap').test
var error = require('../../error')
var config = require('../../config')
var log = { trace: console.log, error: console.log }
var DB = require('../../db/mysql')(log, error)

config.patchLevel = 1000000

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
          debugger
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


