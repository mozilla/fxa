/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var sinon = require('sinon')

var P = require('../../lib/promise')
var test = require('../ptaptest')
var mockLog = require('../mocks').mockLog()
var config = { lockoutEnabled: true }
var Password = require('../../lib/crypto/password')(mockLog, config)
var error = require('../../lib/error')
var butil = require('../../lib/crypto/butil')

var triggersLockout = false
var MockCustoms = {
  flag: sinon.spy(function (clientAddress, emailRecord) {
    return P.resolve({ lockout: triggersLockout })
  })
}

var MockDB = {
  locked: {},
  checkPassword: function (uid) {
    return uid === 'correct_password'
  },
  isLocked: function (uid) {
    return !! this.locked[uid]
  },
  lockAccount: function(account) {
    MockDB.locked[account.uid] = true
  }
}

var CLIENT_ADDRESS = '10.0.0.1'

var checkPassword = require('../../lib/routes/utils/password_check')(mockLog, config, Password, MockCustoms, MockDB)

test(
  'password check with correct password',
  function (t) {
    var authPW = new Buffer('aaaaaaaaaaaaaaaa')
    var emailRecord = {
      uid: 'correct_password',
      verifyHash: null,
      verifierVersion: 0,
      authSalt: new Buffer('bbbbbbbbbbbbbbbb')
    }
    MockCustoms.flag.reset()

    var password = new Password(
        authPW, emailRecord.authSalt, emailRecord.verifierVersion)

    return password.verifyHash()
      .then(
        function (hash) {
          emailRecord.verifyHash = hash

          return checkPassword(emailRecord, authPW, CLIENT_ADDRESS)
        }
      )
      .then(
        function (matches) {
          t.ok(matches, 'password matches, checkPassword returns true')
          t.equal(MockCustoms.flag.callCount, 0, 'customs.flag was not called')
        }
      )
  }
)

test(
  'password check with incorrect password that does not trigger lockout',
  function (t) {
    var authPW = new Buffer('aaaaaaaaaaaaaaaa')
    var emailRecord = {
      uid: 'not_locked',
      email: 'test@example.com',
      verifyHash: null,
      verifierVersion: 0,
      authSalt: new Buffer('bbbbbbbbbbbbbbbb')
    }
    MockCustoms.flag.reset()

    var password = new Password(
            authPW, emailRecord.authSalt, emailRecord.verifierVersion)

    return password.verifyHash()
      .then(
        function (hash) {
          emailRecord.verifyHash = hash

          var incorrectAuthPW = new Buffer('cccccccccccccccc')

          triggersLockout = false
          return checkPassword(emailRecord, incorrectAuthPW, CLIENT_ADDRESS)
        }
      )
      .then(
        function (match) {
          t.equal(!!match, false, 'password does not match, checkPassword returns false')
          t.equal(MockCustoms.flag.callCount, 1, 'customs.flag was called')
          t.equal(MockCustoms.flag.getCall(0).args[0], CLIENT_ADDRESS, 'customs.flag was called with client ip')
          t.deepEqual(MockCustoms.flag.getCall(0).args[1], {
            email: emailRecord.email,
            errno: error.ERRNO.INCORRECT_PASSWORD
          }, 'customs.flag was called with correct event details')
          t.equal(MockDB.isLocked('not_locked'), false, 'account was not marked as locked')
        }
      )
  }
)

test(
  'password check with incorrect password that triggers lockout',
  function (t) {
    var authPW = new Buffer('aaaaaaaaaaaaaaaa')
    var emailRecord = {
      uid: 'locked',
      email: 'test@example.com',
      verifyHash: null,
      verifierVersion: 0,
      authSalt: new Buffer('bbbbbbbbbbbbbbbb')
    }
    MockCustoms.flag.reset()

    var password = new Password(
            authPW, emailRecord.authSalt, emailRecord.verifierVersion)

    return password.verifyHash()
      .then(
        function (hash) {
          emailRecord.verifyHash = hash

          var incorrectAuthPW = new Buffer('cccccccccccccccc')

          triggersLockout = true
          return checkPassword(emailRecord, incorrectAuthPW, CLIENT_ADDRESS)
        }
      )
      .then(
        function (match) {
          t.equal(!!match, false, 'password does not match, checkPassword returns false')
          t.equal(MockCustoms.flag.callCount, 1, 'customs.flag was called')
          t.equal(MockCustoms.flag.getCall(0).args[0], CLIENT_ADDRESS, 'customs.flag was called with client ip')
          t.deepEqual(MockCustoms.flag.getCall(0).args[1], {
            email: emailRecord.email,
            errno: error.ERRNO.INCORRECT_PASSWORD
          }, 'customs.flag was called with correct event details')
          t.equal(MockDB.isLocked('locked'), true, 'account was not marked as locked')
        }
      )
  }
)

test(
  'password check with account whose password must be reset',
  function (t) {
    var emailRecord = {
      uid: 'must_reset',
      email: 'test@example.com',
      verifyHash: null,
      verifierVersion: 0,
      authSalt: butil.ONES
    }
    MockCustoms.flag.reset()
    triggersLockout = false

    var incorrectAuthPW = new Buffer('cccccccccccccccc')

    return checkPassword(emailRecord, incorrectAuthPW, CLIENT_ADDRESS)
      .then(
        function (match) {
          t.fail('password check should not have succeeded')
        },
        function (err) {
          t.equal(err.errno, error.ERRNO.ACCOUNT_RESET, 'an ACCOUNT_RESET error was thrown')
          t.equal(MockCustoms.flag.callCount, 1, 'customs.flag was called')
          t.equal(MockCustoms.flag.getCall(0).args[0], CLIENT_ADDRESS, 'customs.flag was called with client ip')
          t.deepEqual(MockCustoms.flag.getCall(0).args[1], {
            email: emailRecord.email,
            errno: error.ERRNO.ACCOUNT_RESET
          }, 'customs.flag was called with correct event details')
        }
      )
  }
)
