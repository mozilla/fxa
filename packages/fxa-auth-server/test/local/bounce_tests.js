/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var EventEmitter = require('events').EventEmitter
var sinon = require('sinon')
var test = require('../ptaptest')
var spyLog = require('../mocks').spyLog
var error = require('../../lib/error')
var P = require('../../lib/promise')
var bounces = require('../../lib/bounces')

var mockBounceQueue = new EventEmitter()
mockBounceQueue.start = function start() {}

function mockMessage(msg) {
  msg.del = sinon.spy()
  return msg
}

function mockedBounces(log, db) {
  return bounces(log, error)(mockBounceQueue, db)
}

test(
  'unknown message types are silently ignored',
  function (t) {
    var mockLog = spyLog()
    var mockDB = {}
    return mockedBounces(mockLog, mockDB).handleBounce(mockMessage({
      junk: 'message'
    })).then(function () {
      t.equal(mockLog.messages.length, 0)
    })
  }
)

test(
  'multiple recipients are all handled in turn',
  function (t) {
    var mockLog = spyLog()
    var mockDB = {
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
    var mockMsg = mockMessage({
      bounce: {
        bounceType: 'Permanent',
        bouncedRecipients: [
          { emailAddress: 'test@example.com' },
          { emailAddress: 'foobar@example.com'}
        ]
      }
    })
    return mockedBounces(mockLog, mockDB).handleBounce(mockMsg).then(function () {
      t.equal(mockDB.emailRecord.callCount, 2)
      t.equal(mockDB.deleteAccount.callCount, 2)
      t.equal(mockDB.emailRecord.args[0][0], 'test@example.com')
      t.equal(mockDB.emailRecord.args[1][0], 'foobar@example.com')
      t.equal(mockLog.messages.length, 6)
      t.equal(mockLog.messages[1].level, 'increment')
      t.equal(mockLog.messages[1].args[0], 'account.email_bounced')
      t.equal(mockLog.messages[5].level, 'info')
      t.equal(mockLog.messages[5].args[0].op, 'accountDeleted')
      t.equal(mockLog.messages[5].args[0].email, 'foobar@example.com')
      t.equal(mockMsg.del.callCount, 1)
    })
  }
)

test(
  'abuse complaints are treated like bounces',
  function (t) {
    var mockLog = spyLog()
    var mockDB = {
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
    return mockedBounces(mockLog, mockDB).handleBounce(mockMessage({
      complaint: {
        complaintFeedbackType: 'abuse',
        complainedRecipients: [
          { emailAddress: 'test@example.com' },
          { emailAddress: 'foobar@example.com'}
        ]
      }
    })).then(function () {
      t.equal(mockDB.emailRecord.callCount, 2)
      t.equal(mockDB.deleteAccount.callCount, 2)
      t.equal(mockDB.emailRecord.args[0][0], 'test@example.com')
      t.equal(mockDB.emailRecord.args[1][0], 'foobar@example.com')
      t.equal(mockLog.messages.length, 6)
    })
  }
)

test(
  'verified accounts are not deleted on bounce',
  function (t) {
    var mockLog = spyLog()
    var mockDB = {
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
      t.equal(mockDB.emailRecord.callCount, 2)
      t.equal(mockDB.emailRecord.args[0][0], 'test@example.com')
      t.equal(mockDB.emailRecord.args[1][0], 'verified@example.com')
      t.equal(mockDB.deleteAccount.callCount, 1)
      t.equal(mockDB.deleteAccount.args[0][0].email, 'test@example.com')
      t.equal(mockLog.messages.length, 6)
      t.equal(mockLog.messages[0].args[0].op, 'handleBounce')
      t.equal(mockLog.messages[0].args[0].email, 'test@example.com')
      t.equal(mockLog.messages[0].args[0].status, '5.0.0')
      t.equal(mockLog.messages[0].args[0].action, 'failed')
      t.equal(mockLog.messages[0].args[0].diagnosticCode, 'smtp; 550 user unknown')
      t.equal(mockLog.messages[1].args[0], 'account.email_bounced')
      t.equal(mockLog.messages[2].args[0].op, 'accountDeleted')
      t.equal(mockLog.messages[2].args[0].email, 'test@example.com')
      t.equal(mockLog.messages[3].args[0].op, 'handleBounce')
      t.equal(mockLog.messages[3].args[0].email, 'verified@example.com')
      t.equal(mockLog.messages[3].args[0].status, '4.0.0')
      t.notOk(mockLog.messages[3].args[0].diagnosticCode)
      t.equal(mockLog.messages[4].args[0], 'account.email_bounced')
      t.equal(mockLog.messages[5].level, 'increment')
      t.equal(mockLog.messages[5].args[0], 'account.email_bounced.already_verified')
    })
  }
)

test(
  'errors when looking up the email record are logged',
  function (t) {
    var mockLog = spyLog()
    var mockDB = {
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
      t.equal(mockDB.emailRecord.callCount, 1)
      t.equal(mockDB.emailRecord.args[0][0], 'test@example.com')
      t.equal(mockLog.messages.length, 3)
      t.equal(mockLog.messages[0].args[0].op, 'handleBounce')
      t.equal(mockLog.messages[0].args[0].email, 'test@example.com')
      t.equal(mockLog.messages[1].args[0], 'account.email_bounced')
      t.equal(mockLog.messages[2].args[0].op, 'databaseError')
      t.equal(mockLog.messages[2].args[0].email, 'test@example.com')
      t.equal(mockMsg.del.callCount, 1)
    })
  }
)

test(
  'errors when deleting the email record are logged',
  function (t) {
    var mockLog = spyLog()
    var mockDB = {
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
      t.equal(mockDB.emailRecord.callCount, 1)
      t.equal(mockDB.emailRecord.args[0][0], 'test@example.com')
      t.equal(mockDB.deleteAccount.callCount, 1)
      t.equal(mockDB.deleteAccount.args[0][0].email, 'test@example.com')
      t.equal(mockLog.messages.length, 3)
      t.equal(mockLog.messages[0].args[0].op, 'handleBounce')
      t.equal(mockLog.messages[0].args[0].email, 'test@example.com')
      t.equal(mockLog.messages[1].args[0], 'account.email_bounced')
      t.equal(mockLog.messages[2].args[0].op, 'databaseError')
      t.equal(mockLog.messages[2].args[0].email, 'test@example.com')
      t.equal(mockLog.messages[2].args[0].err.errno, error.ERRNO.ACCOUNT_UNKNOWN)
      t.equal(mockMsg.del.callCount, 1)
    })
  }
)

test(
  'quoted email addresses are normalized for lookup',
  function (t) {
    var mockLog = spyLog()
    var mockDB = {
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
      t.equal(mockDB.emailRecord.callCount, 2)
      t.equal(mockDB.emailRecord.args[0][0], '"test."@example.com')
      t.equal(mockDB.emailRecord.args[1][0], 'test.@example.com')
      t.equal(mockDB.deleteAccount.callCount, 1)
      t.equal(mockDB.deleteAccount.args[0][0].email, 'test.@example.com')
    })
  }
)
