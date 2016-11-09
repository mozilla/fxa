/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var proxyquire = require('proxyquire')
var uuid = require('uuid')

var P = require('../../lib/promise')
var mockLog = require('../mocks').mockLog

var zeroBuffer16 = Buffer('00000000000000000000000000000000', 'hex')

var ACCOUNT = {
  uid: uuid.v4('binary'),
  email: 'reminder' + Math.random() + '@bar.com',
  emailCode: zeroBuffer16,
  acceptLanguage: 'bg-BG,en-US;q=0.7,ar-BH;q=0.3'
}

var reminderData = {
  email: ACCOUNT.email
}

var mockDb = {
  createVerificationReminder: function () {
    return P.resolve()
  }
}

describe('verification reminders', () => {
  it(
    'creates reminders with valid options and rate',
    () => {
      var moduleMocks = {
        '../config': {
          'get': function (item) {
            if (item === 'verificationReminders') {
              return {
                rate: 1
              }
            }
          }
        }
      }

      var addedTimes = 0
      var thisMockLog = mockLog({
        increment: function (name) {
          if (name === 'verification-reminders.created') {
            addedTimes++
          }
        }
      })

      var verificationReminder = proxyquire('../../lib/verification-reminders', moduleMocks)(thisMockLog, mockDb)

      return P.all([
        verificationReminder.create(reminderData),
        verificationReminder.create(reminderData),
        verificationReminder.create(reminderData),
        verificationReminder.create(reminderData),
        verificationReminder.create(reminderData)
      ]).then(() => {
        assert.equal(addedTimes, 5)
      })
    }
  )

  it(
    'does not create reminders when rate is 0',
    () => {
      var moduleMocks = {
        '../config': {
          'get': function (item) {
            if (item === 'verificationReminders') {
              return {
                rate: 0
              }
            }
          }
        }
      }

      var verificationReminder = proxyquire('../../lib/verification-reminders', moduleMocks)(mockLog, mockDb)
      verificationReminder.create(reminderData)
        .then(function (result) {
          assert.equal(result, false)
        })
    }
  )

  it(
    'deletes reminders',
    () => {
      let count = 0
      var thisMockLog = mockLog({
        increment: function (name) {
          if (name === 'verification-reminders.deleted') {
            count++
          }
        }
      })
      var thisMockDb = {
        deleteVerificationReminder: function (reminderData) {
          assert.ok(reminderData.email)
          assert.ok(reminderData.type)
          return P.resolve()
        }
      }

      var verificationReminder = proxyquire('../../lib/verification-reminders', {})(thisMockLog, thisMockDb)
      return verificationReminder.delete(reminderData).then(() => {
        assert.equal(count, 1)
      })
    }
  )

  it(
    'deletes reminders can catch errors',
    () => {
      let count = 0
      var thisMockLog = mockLog({
        error: function (logErr) {
          assert.equal(logErr.op, 'verification-reminder.delete')
          assert.ok(logErr.err.message)
          count++
        }
      })
      var thisMockDb = {
        deleteVerificationReminder: function () {
          return P.reject(new Error('Something is wrong'))
        }
      }

      var verificationReminder = proxyquire('../../lib/verification-reminders', {})(thisMockLog, thisMockDb)
      return verificationReminder.delete(reminderData).then(() => {
        assert.equal(count, 1)
      })
    }
  )
})
