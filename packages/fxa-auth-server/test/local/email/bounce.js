/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')

var EventEmitter = require('events').EventEmitter
var sinon = require('sinon')
var spyLog = require('../../mocks').spyLog
var error = require('../../../lib/error')
var P = require('../../../lib/promise')
var bounces = require('../../../lib/email/bounces')

var mockBounceQueue = new EventEmitter()
mockBounceQueue.start = function start() {}

function mockMessage(msg) {
  msg.del = sinon.spy()
  return msg
}

function mockedBounces(log, db) {
  return bounces(log, error)(mockBounceQueue, db)
}

describe('bounce messages', () => {
  it(
    'should ignore unknown message types',
    () => {
      var mockLog = spyLog()
      var mockDB = {}
      return mockedBounces(mockLog, mockDB).handleBounce(mockMessage({
        junk: 'message'
      })).then(function () {
        assert.equal(mockLog.messages.length, 0)
      })
    }
  )

  it(
    'should handle multiple recipients in turn',
    () => {
      var mockLog = spyLog()
      var mockDB = {
        createEmailBounce: sinon.spy(() => P.resolve({})),
        emailRecord: sinon.spy(function (email) {
          return P.resolve({
            uid: '123456',
            email: email,
            emailVerified: false
          })
        }),
        deleteAccount: sinon.spy(function (record) {
          return P.resolve({ })
        })
      }
      const bounceType = 'Permanent'
      var mockMsg = mockMessage({
        bounce: {
          bounceType: bounceType,
          bouncedRecipients: [
            { emailAddress: 'test@example.com' },
            { emailAddress: 'foobar@example.com'}
          ]
        }
      })
      return mockedBounces(mockLog, mockDB).handleBounce(mockMsg).then(function () {
        assert.equal(mockDB.createEmailBounce.callCount, 2)
        assert.equal(mockDB.emailRecord.callCount, 2)
        assert.equal(mockDB.deleteAccount.callCount, 2)
        assert.equal(mockDB.emailRecord.args[0][0], 'test@example.com')
        assert.equal(mockDB.emailRecord.args[1][0], 'foobar@example.com')
        assert.equal(mockLog.messages.length, 8, 'messages logged')
        assert.equal(mockLog.messages[7].level, 'info')
        assert.equal(mockLog.messages[7].args[0].op, 'accountDeleted')
        assert.equal(mockLog.messages[7].args[0].email, 'foobar@example.com')
        assert.equal(mockMsg.del.callCount, 1)
      })
    }
  )

  it(
    'should treat complaints like bounces',
    () => {
      var mockLog = spyLog()
      var mockDB = {
        createEmailBounce: sinon.spy(() => P.resolve({})),
        emailRecord: sinon.spy(function (email) {
          return P.resolve({
            uid: '123456',
            email: email,
            emailVerified: false
          })
        }),
        deleteAccount: sinon.spy(function (record) {
          return P.resolve({ })
        })
      }
      const complaintType = 'abuse'

      return mockedBounces(mockLog, mockDB).handleBounce(mockMessage({
        complaint: {
          userAgent: 'AnyCompany Feedback Loop (V0.01)',
          complaintFeedbackType: complaintType,
          complainedRecipients: [
            { emailAddress: 'test@example.com' },
            { emailAddress: 'foobar@example.com'}
          ]
        }
      })).then(function () {
        assert.equal(mockDB.createEmailBounce.callCount, 2)
        assert.equal(mockDB.createEmailBounce.args[0][0].bounceType, 'Complaint')
        assert.equal(mockDB.createEmailBounce.args[0][0].bounceSubType, complaintType)
        assert.equal(mockDB.emailRecord.callCount, 2)
        assert.equal(mockDB.deleteAccount.callCount, 2)
        assert.equal(mockDB.emailRecord.args[0][0], 'test@example.com')
        assert.equal(mockDB.emailRecord.args[1][0], 'foobar@example.com')
        assert.equal(mockLog.messages.length, 8, 'messages logged')
        assert.equal(mockLog.messages[1].args[0].op, 'emailEvent')
        assert.equal(mockLog.messages[1].args[0].domain, 'other')
        assert.equal(mockLog.messages[1].args[0].type, 'bounced')
        assert.equal(mockLog.messages[1].args[0].complaint, true)
        assert.equal(mockLog.messages[2].args[0].complaintFeedbackType, complaintType)
        assert.equal(mockLog.messages[2].args[0].complaint, true)
        assert.equal(mockLog.messages[2].args[0].complaintUserAgent, 'AnyCompany Feedback Loop (V0.01)')
      })
    }
  )

  it(
    'should not delete verified accounts on bounce',
    () => {
      var mockLog = spyLog()
      var mockDB = {
        createEmailBounce: sinon.spy(() => P.resolve({})),
        emailRecord: sinon.spy(function (email) {
          return P.resolve({
            uid: '123456',
            email: email,
            emailVerified: (email === 'verified@example.com')
          })
        }),
        deleteAccount: sinon.spy(function (record) {
          return P.resolve({ })
        })
      }
      return mockedBounces(mockLog, mockDB).handleBounce(mockMessage({
        bounce: {
          bounceType: 'Permanent',
          // docs: http://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html#bounced-recipients
          bouncedRecipients: [
            { emailAddress: 'test@example.com', action: 'failed', status: '5.0.0', diagnosticCode: 'smtp; 550 user unknown' },
            { emailAddress: 'verified@example.com', status: '4.0.0' }
          ]
        }
      })).then(function () {
        assert.equal(mockDB.emailRecord.callCount, 2)
        assert.equal(mockDB.emailRecord.args[0][0], 'test@example.com')
        assert.equal(mockDB.emailRecord.args[1][0], 'verified@example.com')
        assert.equal(mockDB.deleteAccount.callCount, 1)
        assert.equal(mockDB.deleteAccount.args[0][0].email, 'test@example.com')
        assert.equal(mockLog.messages.length, 7)
        assert.equal(mockLog.messages[2].args[0].op, 'handleBounce')
        assert.equal(mockLog.messages[2].args[0].email, 'test@example.com')
        assert.equal(mockLog.messages[2].args[0].domain, 'other')
        assert.equal(mockLog.messages[2].args[0].status, '5.0.0')
        assert.equal(mockLog.messages[2].args[0].action, 'failed')
        assert.equal(mockLog.messages[2].args[0].diagnosticCode, 'smtp; 550 user unknown')
        assert.equal(mockLog.messages[3].args[0].op, 'accountDeleted')
        assert.equal(mockLog.messages[3].args[0].email, 'test@example.com')
        assert.equal(mockLog.messages[6].args[0].op, 'handleBounce')
        assert.equal(mockLog.messages[6].args[0].email, 'verified@example.com')
        assert.equal(mockLog.messages[6].args[0].status, '4.0.0')
      })
    }
  )

  it(
    'should log errors when looking up the email record',
    () => {
      var mockLog = spyLog()
      var mockDB = {
        createEmailBounce: sinon.spy(() => P.resolve({})),
        emailRecord: sinon.spy(function (email) {
          return P.reject(new error({}))
        })
      }
      var mockMsg = mockMessage({
        bounce: {
          bounceType: 'Permanent',
          bouncedRecipients: [
            { emailAddress: 'test@example.com' },
          ]
        }
      })
      return mockedBounces(mockLog, mockDB).handleBounce(mockMsg).then(function () {
        assert.equal(mockDB.emailRecord.callCount, 1)
        assert.equal(mockDB.emailRecord.args[0][0], 'test@example.com')
        assert.equal(mockLog.messages.length, 4)
        assert.equal(mockLog.messages[2].args[0].op, 'handleBounce')
        assert.equal(mockLog.messages[2].args[0].email, 'test@example.com')
        assert.equal(mockLog.messages[3].args[0].op, 'databaseError')
        assert.equal(mockLog.messages[3].args[0].email, 'test@example.com')
        assert.equal(mockMsg.del.callCount, 1)
      })
    }
  )

  it(
    'should log errors when deleting the email record',
    () => {
      var mockLog = spyLog()
      var mockDB = {
        createEmailBounce: sinon.spy(() => P.resolve({})),
        emailRecord: sinon.spy(function (email) {
          return P.resolve({
            uid: '123456',
            email: email,
            emailVerified: false
          })
        }),
        deleteAccount: sinon.spy(function (record) {
          return P.reject(new error.unknownAccount('test@example.com'))
        })
      }
      var mockMsg = mockMessage({
        bounce: {
          bounceType: 'Permanent',
          bouncedRecipients: [
            { emailAddress: 'test@example.com' },
          ]
        }
      })
      return mockedBounces(mockLog, mockDB).handleBounce(mockMsg).then(function () {
        assert.equal(mockDB.emailRecord.callCount, 1)
        assert.equal(mockDB.emailRecord.args[0][0], 'test@example.com')
        assert.equal(mockDB.deleteAccount.callCount, 1)
        assert.equal(mockDB.deleteAccount.args[0][0].email, 'test@example.com')
        assert.equal(mockLog.messages.length, 4)
        assert.equal(mockLog.messages[2].args[0].op, 'handleBounce')
        assert.equal(mockLog.messages[2].args[0].email, 'test@example.com')
        assert.equal(mockLog.messages[3].args[0].op, 'databaseError')
        assert.equal(mockLog.messages[3].args[0].email, 'test@example.com')
        assert.equal(mockLog.messages[3].args[0].err.errno, error.ERRNO.ACCOUNT_UNKNOWN)
        assert.equal(mockMsg.del.callCount, 1)
      })
    }
  )

  it(
    'should normalize quoted email addresses for lookup',
    () => {
      var mockLog = spyLog()
      var mockDB = {
        createEmailBounce: sinon.spy(() => P.resolve({})),
        emailRecord: sinon.spy(function (email) {
          // Lookup only succeeds when using original, unquoted email addr.
          if (email !== 'test.@example.com') {
            return P.reject(new error.unknownAccount(email))
          }
          return P.resolve({
            uid: '123456',
            email: email,
            emailVerified: false
          })
        }),
        deleteAccount: sinon.spy(function (record) {
          return P.resolve({ })
        })
      }
      return mockedBounces(mockLog, mockDB).handleBounce(mockMessage({
        bounce: {
          bounceType: 'Permanent',
          bouncedRecipients: [
            // Bounce message has email addr in quoted form, since some
            // mail agents normalize it in this way.
            { emailAddress: '"test."@example.com' },
          ]
        }
      })).then(function () {
        assert.equal(mockDB.createEmailBounce.callCount, 1)
        assert.equal(mockDB.createEmailBounce.args[0][0].email, 'test.@example.com')
        assert.equal(mockDB.emailRecord.callCount, 1)
        assert.equal(mockDB.emailRecord.args[0][0], 'test.@example.com')
        assert.equal(mockDB.deleteAccount.callCount, 1)
        assert.equal(mockDB.deleteAccount.args[0][0].email, 'test.@example.com')
      })
    }
  )

  it(
    'should log email template name, language, and bounceType',
    () => {
      var mockLog = spyLog()
      var mockDB = {
        createEmailBounce: sinon.spy(() => P.resolve({})),
        emailRecord: sinon.spy(function (email) {
          return P.resolve({
            uid: '123456',
            email: email,
            emailVerified: false
          })
        }),
        deleteAccount: sinon.spy(function () {
          return P.resolve({ })
        })
      }
      var mockMsg = mockMessage({
        bounce: {
          bounceType: 'Permanent',
          bounceSubType: 'General',
          bouncedRecipients: [
            {emailAddress: 'test@example.com'}
          ]
        },
        mail: {
          headers: [
            {
              name: 'Content-Language',
              value: 'db-LB'
            },
            {
              name: 'X-Template-Name',
              value: 'verifyLoginEmail'
            }
          ]
        }
      })

      return mockedBounces(mockLog, mockDB).handleBounce(mockMsg).then(function () {
        assert.equal(mockDB.emailRecord.callCount, 1)
        assert.equal(mockDB.emailRecord.args[0][0], 'test@example.com')
        assert.equal(mockDB.deleteAccount.callCount, 1)
        assert.equal(mockDB.deleteAccount.args[0][0].email, 'test@example.com')
        assert.equal(mockLog.messages.length, 4)
        assert.equal(mockLog.messages[2].args[0].op, 'handleBounce')
        assert.equal(mockLog.messages[2].args[0].email, 'test@example.com')
        assert.equal(mockLog.messages[2].args[0].template, 'verifyLoginEmail')
        assert.equal(mockLog.messages[2].args[0].bounceType, 'Permanent')
        assert.equal(mockLog.messages[2].args[0].bounceSubType, 'General')
        assert.equal(mockLog.messages[2].args[0].lang, 'db-LB')
      })
    }
  )

  it(
    'should emit flow metrics',
    () => {
      var mockLog = spyLog()
      var mockDB = {
        createEmailBounce: sinon.spy(() => P.resolve({})),
        emailRecord: sinon.spy(function (email) {
          return P.resolve({
            uid: '123456',
            email: email,
            emailVerified: false
          })
        }),
        deleteAccount: sinon.spy(function () {
          return P.resolve({ })
        })
      }
      var mockMsg = mockMessage({
        bounce: {
          bounceType: 'Permanent',
          bounceSubType: 'General',
          bouncedRecipients: [
            {emailAddress: 'test@example.com'}
          ]
        },
        mail: {
          headers: [
            {
              name: 'X-Template-Name',
              value: 'verifyLoginEmail'
            },
            {
              name: 'X-Flow-Id',
              value: 'someFlowId'
            },
            {
              name: 'X-Flow-Begin-Time',
              value: '1234'
            },
            {
              name: 'Content-Language',
              value: 'en'
            }
          ]
        }
      })

      return mockedBounces(mockLog, mockDB).handleBounce(mockMsg).then(function () {
        assert.equal(mockDB.emailRecord.callCount, 1)
        assert.equal(mockDB.emailRecord.args[0][0], 'test@example.com')
        assert.equal(mockDB.deleteAccount.callCount, 1)
        assert.equal(mockDB.deleteAccount.args[0][0].email, 'test@example.com')
        assert.equal(mockLog.messages.length, 4)
        assert.equal(mockLog.messages[0].args[0]['event'], 'email.verifyLoginEmail.bounced')
        assert.equal(mockLog.messages[0].args[0]['flow_id'], 'someFlowId')
        assert.equal(mockLog.messages[0].args[0]['flow_time'] > 0, true)
        assert.equal(mockLog.messages[0].args[0]['time'] > 0, true)
        assert.equal(mockLog.messages[1].args[0].op, 'emailEvent')
        assert.equal(mockLog.messages[1].args[0].domain, 'other')
        assert.equal(mockLog.messages[1].args[0].type, 'bounced')
        assert.equal(mockLog.messages[1].args[0].template, 'verifyLoginEmail')
        assert.equal(mockLog.messages[1].args[0]['flow_id'], 'someFlowId')
      })
    }
  )

  it(
    'should log email domain if popular one',
    () => {
      var mockLog = spyLog()
      var mockDB = {
        createEmailBounce: sinon.spy(() => P.resolve({})),
        emailRecord: sinon.spy(function (email) {
          return P.resolve({
            uid: '123456',
            email: email,
            emailVerified: false
          })
        }),
        deleteAccount: sinon.spy(function () {
          return P.resolve({ })
        })
      }
      var mockMsg = mockMessage({
        bounce: {
          bounceType: 'Permanent',
          bounceSubType: 'General',
          bouncedRecipients: [
            {emailAddress: 'test@aol.com'}
          ]
        },
        mail: {
          headers: [
            {
              name: 'X-Template-Name',
              value: 'verifyLoginEmail'
            },
            {
              name: 'X-Flow-Id',
              value: 'someFlowId'
            },
            {
              name: 'X-Flow-Begin-Time',
              value: '1234'
            },
            {
              name: 'Content-Language',
              value: 'en'
            }
          ]
        }
      })

      return mockedBounces(mockLog, mockDB).handleBounce(mockMsg).then(function () {
        assert.equal(mockLog.messages.length, 4)
        assert.equal(mockLog.messages[0].args[0]['event'], 'email.verifyLoginEmail.bounced')
        assert.equal(mockLog.messages[0].args[0]['flow_id'], 'someFlowId')
        assert.equal(mockLog.messages[0].args[0]['flow_time'] > 0, true)
        assert.equal(mockLog.messages[0].args[0]['time'] > 0, true)
        assert.equal(mockLog.messages[1].args[0].op, 'emailEvent')
        assert.equal(mockLog.messages[1].args[0].domain, 'aol.com')
        assert.equal(mockLog.messages[1].args[0].type, 'bounced')
        assert.equal(mockLog.messages[1].args[0].template, 'verifyLoginEmail')
        assert.equal(mockLog.messages[1].args[0].bounced, true)
        assert.equal(mockLog.messages[1].args[0].locale, 'en')
        assert.equal(mockLog.messages[1].args[0]['flow_id'], 'someFlowId')
        assert.equal(mockLog.messages[2].args[0]['email'], 'test@aol.com')
        assert.equal(mockLog.messages[2].args[0]['domain'], 'aol.com')
      })
    }
  )
})
