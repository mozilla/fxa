/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('ass')
var tap = require('tap')
var test = tap.test
var uuid = require('uuid')
var log = { trace: console.log, info: console.log }

var config = require('../../config').getProperties()
var TestServer = require('../test_server')
var Token = require('../../lib/tokens')(log)
var DB = require('../../lib/db')(
  config.db.backend,
  log,
  Token.error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken
)

var zeroBuffer16 = Buffer('00000000000000000000000000000000', 'hex')
var zeroBuffer32 = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')

function createTestAccount() {
  return {
    uid: uuid.v4('binary'),
    email: 'reminder' + Math.random() + '@bar.com',
    emailCode: zeroBuffer16,
    emailVerified: false,
    verifierVersion: 1,
    verifyHash: zeroBuffer32,
    authSalt: zeroBuffer32,
    kA: zeroBuffer32,
    wrapWrapKb: zeroBuffer32,
    acceptLanguage: 'bg-BG,en-US;q=0.7,ar-BH;q=0.3'
  }
}

var mockLog = require('../mocks').mockLog

var dbServer, reminderConfig
var dbConn = TestServer.start(config)
  .then(
    function (server) {
      dbServer = server
      reminderConfig = process.env.VERIFICATION_REMINDER_RATE
      process.env.VERIFICATION_REMINDER_RATE = 1
      return DB.connect(config[config.db.backend])
    }
  )

test(
  'create',
  function (t) {
    var thisMockLog = mockLog({
      increment: function (name) {
        t.equal(name, 'verification-reminders.created')
      }
    })

    dbConn.then(function (db) {
      var account = createTestAccount()
      var reminder = { uid: account.uid.toString('hex') }

      var verificationReminder = require('../../lib/verification-reminders')(thisMockLog, db)
      return verificationReminder.create(reminder).then(
          function () {
            t.end()
          },
          function () {
            t.fail()
          }
        )
    })
  }
)

test(
  'delete',
  function (t) {
    var thisMockLog = mockLog({
      increment: function (name) {
        if (name === 'verification-reminders.deleted') {
          t.ok(true, 'correct log message')
        }
      }
    })

    dbConn.then(function (db) {
      var verificationReminder = require('../../lib/verification-reminders')(thisMockLog, db)
      var account = createTestAccount()
      var reminder = { uid: account.uid.toString('hex') }

      return verificationReminder.create(reminder)
        .then(function () {
          return verificationReminder.delete(reminder)
        })
        .then(function () {
          t.end()
        }, function (err) {
          t.notOk(err)
        })
    })
  }
)

test(
  'teardown',
  function (t) {
    return dbConn.then(function(db) {
      return db.close()
    }).then(function() {
      return dbServer.stop()
    }).then(function () {
      process.env.VERIFICATION_REMINDER_RATE = reminderConfig
      t.end()
    })
  }
)
