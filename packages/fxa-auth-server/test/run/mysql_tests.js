/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var uuid = require('uuid')
var log = { trace: console.log }

var tokens = require('../../tokens')(log)
var DB = require('../../db/mysql')(
{
  database: 'picl',
  user: 'root',
  password: '',
  host: '127.0.0.1',
  port: 3306,
  create_schema: true,
  max_query_time_ms: 5000,
  max_reconnect_attempts: 3
},
log,
tokens.error,
tokens.AuthToken,
tokens.SessionToken,
tokens.KeyFetchToken,
tokens.AccountResetToken,
tokens.SrpToken,
tokens.ForgotPasswordToken
)

DB.connect()
  .then(
    function (db) {

      test(
        'createAccount',
        function (t) {
          db.createAccount({
            uid: uuid.v4(),
            email: 'foo@bar.com',
            emailCode: 'xxx',
            verified: false,
            srp: { whatever: true },
            kA: '0000000000000000000000000000000000000000000000000000000000000000',
            wrapKb: '0000000000000000000000000000000000000000000000000000000000000000',
            passwordStretching: { blah: false }
          })
          .done(
            function () {
              t.end()
            },
            function (err) {
              t.fail(err)
              t.end()
            }
          )
        }
      )

      test(
        'teardown',
        function () {
          db.close()
            .then(process.exit)
        }
      )
    }
  )
