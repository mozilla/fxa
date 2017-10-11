/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ROOT_DIR = '../..'

const assert = require('insist')
const proxyquire = require('proxyquire')
const uuid = require('uuid')
const sinon = require('sinon')

const P = require(`${ROOT_DIR}/lib/promise`)
const mocks = require('../mocks')

var zeroBuffer16 = Buffer('00000000000000000000000000000000', 'hex')

const verificationModulePath = `${ROOT_DIR}/lib/verification-reminders`

var ACCOUNT = {
  uid: uuid.v4('binary'),
  email: 'reminder' + Math.random() + '@bar.com',
  emailCode: zeroBuffer16,
  acceptLanguage: 'bg-BG,en-US;q=0.7,ar-BH;q=0.3'
}

var reminderData = {
  email: ACCOUNT.email
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

      var mockLog = mocks.mockLog()
      var mockDB = mocks.mockDB()

      var verificationReminder = proxyquire(verificationModulePath, moduleMocks)(mockLog, mockDB)

      return P.all([
        verificationReminder.create(reminderData),
        verificationReminder.create(reminderData),
        verificationReminder.create(reminderData),
        verificationReminder.create(reminderData),
        verificationReminder.create(reminderData)
      ]).then(() => {
        assert.equal(mockLog.error.callCount, 0)
        assert.equal(mockDB.createVerificationReminder.callCount, 10) // 5 x first, 5 x second
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

      var verificationReminder = proxyquire(verificationModulePath, moduleMocks)(mocks.mockLog(), mocks.mockDB())
      verificationReminder.create(reminderData)
        .then(function (result) {
          assert.equal(result, false)
        })
    }
  )

  it(
    'deletes reminders',
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
      var mockLog = mocks.mockLog()
      var mockDB = mocks.mockDB({
        deleteVerificationReminder: function (reminderData) {
          assert.ok(reminderData.email)
          assert.ok(reminderData.type)
          return P.resolve()
        }
      })

      var verificationReminder = proxyquire(verificationModulePath, moduleMocks)(mockLog, mockDB)
      return verificationReminder.delete(reminderData).then(() => {
        assert.equal(mockLog.error.callCount, 0)
        assert.equal(mockDB.deleteVerificationReminder.callCount, 2) // first and second
      })
    }
  )

  it(
    'deletes reminders can catch errors',
    () => {
      var mockLog = mocks.mockLog({
        error: sinon.spy(logErr => {
          assert.equal(logErr.op, 'verification-reminder.delete')
          assert.ok(logErr.err.message)
        })
      })
      var mockDB = {
        deleteVerificationReminder: sinon.spy(function () {
          return P.reject(new Error('Something is wrong'))
        })
      }

      var verificationReminder = proxyquire(verificationModulePath, {})(mockLog, mockDB)
      return verificationReminder.delete(reminderData).then(() => {
        assert.equal(mockLog.error.callCount, 1, 'the error was logged and ignored')
      })
    }
  )
})
