/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var uuid = require('uuid')
var log = { trace() {}, info() {} }

var config = require('../../config').getProperties()
var TestServer = require('../test_server')
var Token = require('../../lib/tokens')(log)
var DB = require('../../lib/db')(
  config,
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

describe('remote verification reminder db', function() {
  this.timeout(15000)

  let dbServer, reminderConfig, db
  before(() => {
    return TestServer.start(config)
      .then(s => {
        dbServer = s
        reminderConfig = process.env.VERIFICATION_REMINDER_RATE
        process.env.VERIFICATION_REMINDER_RATE = 1
        return DB.connect(config[config.db.backend])
      })
      .then(x => {
        db = x
      })
  })

  it(
    'create',
    () => {
      var thisMockLog = mockLog({
        increment: function (name) {
          assert.equal(name, 'verification-reminders.created')
        }
      })

      var account = createTestAccount()
      var reminder = { uid: account.uid.toString('hex') }

      var verificationReminder = require('../../lib/verification-reminders')(thisMockLog, db)
      return verificationReminder.create(reminder)
    }
  )

  it(
    'delete',
    () => {
      var thisMockLog = mockLog({
        increment: function (name) {
          if (name === 'verification-reminders.deleted') {
            assert.ok(true, 'correct log message')
          }
        }
      })

      var verificationReminder = require('../../lib/verification-reminders')(thisMockLog, db)
      var account = createTestAccount()
      var reminder = { uid: account.uid.toString('hex') }

      return verificationReminder.create(reminder)
        .then(function () {
          return verificationReminder.delete(reminder)
        })
    }
  )

  after(() => {
    return TestServer.stop(dbServer)
      .then(() => {
        return db.close()
      })
      .then(function () {
        process.env.VERIFICATION_REMINDER_RATE = reminderConfig
      })
  })
})
