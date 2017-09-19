/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var sinon = require('sinon')

var P = require('../../lib/promise')
var mockLog = require('../mocks').mockLog()
var config = {}
var Password = require('../../lib/crypto/password')(mockLog, config)
var error = require('../../lib/error')
var butil = require('../../lib/crypto/butil')

var MockCustoms = {
  flag: sinon.spy(function (clientAddress, emailRecord) {
    return P.resolve({})
  })
}

var MockDB = {
  checkPassword: function (uid) {
    return uid === 'correct_password'
  }
}

var CLIENT_ADDRESS = '10.0.0.1'

var checkPassword = require('../../lib/routes/utils/password_check')(mockLog, config, Password, MockCustoms, MockDB)

describe('password_check', () => {
  it(
    'should check with correct password',
    () => {
      var authPW = Buffer.from('aaaaaaaaaaaaaaaa')
      var emailRecord = {
        uid: 'correct_password',
        verifyHash: null,
        verifierVersion: 0,
        authSalt: Buffer.from('bbbbbbbbbbbbbbbb')
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
            assert.ok(matches, 'password matches, checkPassword returns true')
            assert.equal(MockCustoms.flag.callCount, 0, 'customs.flag was not called')
          }
        )
    }
  )

  it(
    'should return false when check with incorrect password',
    () => {
      var authPW = Buffer.from('aaaaaaaaaaaaaaaa')
      var emailRecord = {
        uid: 'uid',
        email: 'test@example.com',
        verifyHash: null,
        verifierVersion: 0,
        authSalt: Buffer.from('bbbbbbbbbbbbbbbb')
      }
      MockCustoms.flag.reset()

      var password = new Password(
              authPW, emailRecord.authSalt, emailRecord.verifierVersion)

      return password.verifyHash()
        .then(
          function (hash) {
            emailRecord.verifyHash = hash

            var incorrectAuthPW = Buffer.from('cccccccccccccccc')

            return checkPassword(emailRecord, incorrectAuthPW, CLIENT_ADDRESS)
          }
        )
        .then(
          function (match) {
            assert.equal(!! match, false, 'password does not match, checkPassword returns false')
            assert.equal(MockCustoms.flag.callCount, 1, 'customs.flag was called')
            assert.equal(MockCustoms.flag.getCall(0).args[0], CLIENT_ADDRESS, 'customs.flag was called with client ip')
            assert.deepEqual(MockCustoms.flag.getCall(0).args[1], {
              email: emailRecord.email,
              errno: error.ERRNO.INCORRECT_PASSWORD
            }, 'customs.flag was called with correct event details')
          }
        )
    }
  )

  it(
    'should error when check with account whose password must be reset',
    () => {
      var emailRecord = {
        uid: 'must_reset',
        email: 'test@example.com',
        verifyHash: null,
        verifierVersion: 0,
        authSalt: butil.ONES
      }
      MockCustoms.flag.reset()

      var incorrectAuthPW = Buffer.from('cccccccccccccccc')

      return checkPassword(emailRecord, incorrectAuthPW, CLIENT_ADDRESS)
        .then(
          function (match) {
            assert(false, 'password check should not have succeeded')
          },
          function (err) {
            assert.equal(err.errno, error.ERRNO.ACCOUNT_RESET, 'an ACCOUNT_RESET error was thrown')
            assert.equal(MockCustoms.flag.callCount, 1, 'customs.flag was called')
            assert.equal(MockCustoms.flag.getCall(0).args[0], CLIENT_ADDRESS, 'customs.flag was called with client ip')
            assert.deepEqual(MockCustoms.flag.getCall(0).args[1], {
              email: emailRecord.email,
              errno: error.ERRNO.ACCOUNT_RESET
            }, 'customs.flag was called with correct event details')
          }
        )
    }
  )
})
