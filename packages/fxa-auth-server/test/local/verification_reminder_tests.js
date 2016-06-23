/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var tap = require('tap')
var proxyquire = require('proxyquire')
var uuid = require('uuid')

var test = tap.test
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

test(
  'creates reminders with valid options and rate',
  function (t) {
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
          if (addedTimes === 5) {
            t.end()
          }
        }
      }
    })

    var verificationReminder = proxyquire('../../lib/verification-reminders', moduleMocks)(thisMockLog, mockDb)

    verificationReminder.create(reminderData)
    verificationReminder.create(reminderData)
    verificationReminder.create(reminderData)
    verificationReminder.create(reminderData)
    verificationReminder.create(reminderData)
  }
)

test(
  'does not create reminders when rate is 0',
  function (t) {
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
        if (result === false) {
          t.end()
        }
      })
  }
)

test(
  'deletes reminders',
  function (t) {
    var thisMockLog = mockLog({
      increment: function (name) {
        if (name === 'verification-reminders.deleted') {
          t.end()
        }
      }
    })
    var thisMockDb = {
      deleteVerificationReminder: function (reminderData) {
        t.ok(reminderData.email)
        t.ok(reminderData.type)
        return P.resolve()
      }
    }

    var verificationReminder = proxyquire('../../lib/verification-reminders', {})(thisMockLog, thisMockDb)
    verificationReminder.delete(reminderData)
  }
)

test(
  'deletes reminders can catch errors',
  function (t) {
    var thisMockLog = mockLog({
      error: function (logErr) {
        t.equal(logErr.op, 'verification-reminder.delete')
        t.ok(logErr.err.message)
        t.end()
      }
    })
    var thisMockDb = {
      deleteVerificationReminder: function () {
        return P.reject(new Error('Something is wrong'))
      }
    }

    var verificationReminder = proxyquire('../../lib/verification-reminders', {})(thisMockLog, thisMockDb)
    verificationReminder.delete(reminderData)
  }
)

