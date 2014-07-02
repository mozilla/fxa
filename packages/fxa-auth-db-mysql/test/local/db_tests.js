/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('ass')
var P = require('../../promise')
var test = require('../ptaptest')
var crypto = require('crypto')
var uuid = require('uuid')
var error = require('../../error')
var config = require('../../config')
var log = { trace: console.log, error: console.log }
var DB = require('../../db/mysql')(log, error)

var zeroBuffer16 = Buffer('00000000000000000000000000000000', 'hex')
var zeroBuffer32 = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')

var ACCOUNT = {
  uid: uuid.v4('binary'),
  email: ('' + Math.random()).substr(2) + '@bar.com',
  emailCode: zeroBuffer16,
  emailVerified: false,
  verifierVersion: 1,
  verifyHash: zeroBuffer32,
  authSalt: zeroBuffer32,
  kA: zeroBuffer32,
  wrapWrapKb: zeroBuffer32,
  verifierSetAt: Date.now(),
}

function hex(len) {
  return Buffer(crypto.randomBytes(len).toString('hex'), 'hex')
}
function hex16() { return hex(16) }
function hex32() { return hex(32) }
function hex64() { return hex(64) }
function hex96() { return hex(96) }

var SESSION_TOKEN_ID = hex32()
var SESSION_TOKEN = {
  data : hex32(),
  uid : ACCOUNT.uid,
  createdAt: Date.now(),
}

var KEY_FETCH_TOKEN_ID = hex32()
var KEY_FETCH_TOKEN = {
  authKey : hex32(),
  uid : ACCOUNT.uid,
  keyBundle : hex96(),
  createdAt: Date.now(),
}

var PASSWORD_FORGOT_TOKEN_ID = hex32()
var PASSWORD_FORGOT_TOKEN = {
  data : hex32(),
  uid : ACCOUNT.uid,
  passCode : hex16(),
  tries : 1,
  createdAt: Date.now(),
}

var PASSWORD_CHANGE_TOKEN_ID = hex32()
var PASSWORD_CHANGE_TOKEN = {
  data : hex32(),
  uid : ACCOUNT.uid,
  createdAt: Date.now(),
}

var ACCOUNT_RESET_TOKEN_ID = hex32()
var ACCOUNT_RESET_TOKEN = {
  data : hex32(),
  uid : ACCOUNT.uid,
  createdAt: Date.now(),
}

DB.connect(config)
  .then(
    function (db) {

      test(
        'ping',
        function (t) {
          t.plan(1);
          return db.ping()
          .then(function(account) {
            t.pass('Got the ping ok')
          }, function(err) {
            t.fail('Should not have arrived here')
          })
        }
      )

      test(
        'account creation',
        function (t) {
          t.plan(31)
          var hexEmail = Buffer(ACCOUNT.email).toString('hex')
          return db.accountExists(hexEmail)
          .then(function(exists) {
            t.fail('account should not yet exist for this email address')
          }, function(err) {
            t.pass('ok, account could not be found')
          })
          .then(function() {
            return db.createAccount(ACCOUNT.uid, ACCOUNT)
          })
          .then(function(account) {
            t.deepEqual(account, {}, 'Returned an empty object on account creation')
            var hexEmail = Buffer(ACCOUNT.email).toString('hex')
            return db.accountExists(hexEmail)
          })
          .then(function(exists) {
            t.ok(exists, 'account exists for this email address')
          })
          .then(function() {
            t.pass('Retrieving account using uid')
            return db.account(ACCOUNT.uid)
          })
          .then(function(account) {
            t.deepEqual(account.uid, ACCOUNT.uid, 'uid')
            t.equal(account.email, ACCOUNT.email, 'email')
            t.deepEqual(account.emailCode, ACCOUNT.emailCode, 'emailCode')
            t.equal(!!account.emailVerified, ACCOUNT.emailVerified, 'emailVerified')
            t.deepEqual(account.kA, ACCOUNT.kA, 'kA')
            t.deepEqual(account.wrapWrapKb, ACCOUNT.wrapWrapKb, 'wrapWrapKb')
            t.deepEqual(account.verifyHash, ACCOUNT.verifyHash, 'verifyHash')
            t.deepEqual(account.authSalt, ACCOUNT.authSalt, 'authSalt')
            t.equal(account.verifierVersion, ACCOUNT.verifierVersion, 'verifierVersion')
            t.equal(account.verifierSetAt, account.createdAt, 'verifierSetAt has been set to the same as createdAt')
            t.ok(account.createdAt)
          })
          .then(function() {
            t.pass('Retrieving account using email')
            var hexEmail = Buffer(ACCOUNT.email).toString('hex')
            return db.emailRecord(hexEmail)
          })
          .then(function(account) {
            t.deepEqual(account.uid, ACCOUNT.uid, 'uid')
            t.equal(account.email, ACCOUNT.email, 'email')
            t.deepEqual(account.emailCode, ACCOUNT.emailCode, 'emailCode')
            t.equal(!!account.emailVerified, ACCOUNT.emailVerified, 'emailVerified')
            t.deepEqual(account.kA, ACCOUNT.kA, 'kA')
            t.deepEqual(account.wrapWrapKb, ACCOUNT.wrapWrapKb, 'wrapWrapKb')
            t.deepEqual(account.verifyHash, ACCOUNT.verifyHash, 'verifyHash')
            t.deepEqual(account.authSalt, ACCOUNT.authSalt, 'authSalt')
            t.equal(account.verifierVersion, ACCOUNT.verifierVersion, 'verifierVersion')
            t.ok(account.verifierSetAt, 'verifierSetAt is set to a truthy value')
          })
          // and we piggyback some duplicate query error handling here...
          .then(function() {
            return db.createAccount(ACCOUNT.uid, ACCOUNT)
          })
          .then(
            function() {
              t.fail('this should have resulted in a duplicate account error')
            },
            function(err) {
              t.ok(err, 'trying to create the same account produces an error')
              t.equal(err.code, 409, 'code')
              t.equal(err.errno, 101, 'errno')
              t.equal(err.message, 'Record already exists', 'message')
              t.equal(err.error, 'Conflict', 'error')
            }
          )
        }
      )

      test(
        'session token handling',
        function (t) {
          t.plan(10)
          return db.createSessionToken(SESSION_TOKEN_ID, SESSION_TOKEN)
            .then(function(result) {
              t.deepEqual(result, {}, 'Returned an empty object on session token creation')
              return db.sessionToken(SESSION_TOKEN_ID)
            })
            .then(function(token) {
              // tokenId is not returned from db.sessionToken()
              t.deepEqual(token.tokenData, SESSION_TOKEN.data, 'token data matches')
              t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
              t.ok(token.createdAt, 'Got a createdAt')
              t.equal(!!token.emailVerified, ACCOUNT.emailVerified)
              t.equal(token.email, ACCOUNT.email)
              t.deepEqual(token.emailCode, ACCOUNT.emailCode)
              t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')
            })
            .then(function() {
              return db.deleteSessionToken(SESSION_TOKEN_ID)
            })
            .then(function(result) {
              t.deepEqual(result, {}, 'Returned an empty object on forgot key fetch token deletion')
              return db.sessionToken(SESSION_TOKEN_ID)
            })
            .then(function(token) {
              t.fail('Session Token should no longer exist')
            }, function(err) {
              t.pass('Session Token deleted successfully')
            })
        }
      )

      test(
        'key fetch token handling',
        function (t) {
          t.plan(8)
          return db.createKeyFetchToken(KEY_FETCH_TOKEN_ID, KEY_FETCH_TOKEN)
            .then(function(result) {
              t.deepEqual(result, {}, 'Returned an empty object on key fetch token creation')
              return db.keyFetchToken(KEY_FETCH_TOKEN_ID)
            })
            .then(function(token) {
              // tokenId is not returned
              t.deepEqual(token.authKey, KEY_FETCH_TOKEN.authKey, 'authKey matches')
              t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
              t.ok(token.createdAt, 'Got a createdAt')
              t.equal(!!token.emailVerified, ACCOUNT.emailVerified)
              // email is not returned
              // emailCode is not returned
              t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')
            })
            .then(function() {
              return db.deleteKeyFetchToken(KEY_FETCH_TOKEN_ID)
            })
            .then(function(result) {
              t.deepEqual(result, {}, 'Returned an empty object on forgot key fetch token deletion')
              return db.keyFetchToken(KEY_FETCH_TOKEN_ID)
            })
            .then(function(token) {
              t.fail('Key Fetch Token should no longer exist')
            }, function(err) {
              t.pass('Key Fetch Token deleted successfully')
            })
        }
      )

      test(
        'forgot password token handling',
        function (t) {
          t.plan(10)
          return db.createPasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID, PASSWORD_FORGOT_TOKEN)
            .then(function(result) {
              t.deepEqual(result, {}, 'Returned an empty object on forgot password token creation')
              return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
            })
            .then(function(token) {
              // tokenId is not returned
              t.deepEqual(token.tokenData, PASSWORD_FORGOT_TOKEN.data, 'token data matches')
              t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
              t.ok(token.createdAt, 'Got a createdAt')
              t.deepEqual(token.passCode, PASSWORD_FORGOT_TOKEN.passCode)
              t.equal(token.tries, PASSWORD_FORGOT_TOKEN.tries, 'Tries is correct')
              t.equal(token.email, ACCOUNT.email)
              t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')
            })
            .then(function() {
              return db.deletePasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
            })
            .then(function(result) {
              t.deepEqual(result, {}, 'Returned an empty object on forgot password token deletion')
              return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
            })
            .then(function(token) {
              t.fail('Password Forgot Token should no longer exist')
            }, function(err) {
              t.pass('Password Forgot Token deleted successfully')
            })
        }
      )

      test(
        'change password token handling',
        function (t) {
          t.plan(7)
          return db.createPasswordChangeToken(PASSWORD_CHANGE_TOKEN_ID, PASSWORD_CHANGE_TOKEN)
            .then(function(result) {
              t.deepEqual(result, {}, 'Returned an empty object on change password token creation')
              return db.passwordChangeToken(PASSWORD_CHANGE_TOKEN_ID)
            })
            .then(function(token) {
              // tokenId is not returned
              t.deepEqual(token.tokenData, PASSWORD_CHANGE_TOKEN.data, 'token data matches')
              t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
              t.ok(token.createdAt, 'Got a createdAt')
              t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')
            })
            .then(function() {
              return db.deletePasswordChangeToken(PASSWORD_CHANGE_TOKEN_ID)
            })
            .then(function(result) {
              t.deepEqual(result, {}, 'Returned an empty object on forgot password change deletion')
              return db.passwordChangeToken(PASSWORD_CHANGE_TOKEN_ID)
            })
            .then(function(token) {
              t.fail('Password Change Token should no longer exist')
            }, function(err) {
              t.pass('Password Change Token deleted successfully')
            })
        }
      )

      test(
        'email verification',
        function (t) {
          var hexEmail = Buffer(ACCOUNT.email).toString('hex')
          return db.emailRecord(hexEmail)
          .then(function(emailRecord) {
            return db.verifyEmail(emailRecord.uid)
          })
          .then(function(result) {
            t.deepEqual(result, {}, 'Returned an empty object email verification')
            return db.account(ACCOUNT.uid)
          })
          .then(function(account) {
            t.ok(account.emailVerified, 'account should now be emailVerified (truthy)')
            t.equal(account.emailVerified, 1, 'account should now be emailVerified (1)')
          })
          .then(function() {
            // test verifyEmail for a non-existant account
            return db.verifyEmail(uuid.v4('binary'))
          })
          .then(function(res) {
            t.deepEqual(res, {}, 'No matter what happens, we get an empty object back')
          }, function(err) {
            t.fail('We should not have failed this .verifyEmail() request')
          })
        }
      )

      test(
        'account reset token handling',
        function (t) {
          t.plan(7)
          return db.createAccountResetToken(ACCOUNT_RESET_TOKEN_ID, ACCOUNT_RESET_TOKEN)
            .then(function(result) {
              t.deepEqual(result, {}, 'Returned an empty object on account reset token creation')
              return db.accountResetToken(ACCOUNT_RESET_TOKEN_ID)
            })
            .then(function(token) {
              // tokenId is not returned
              t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
              t.deepEqual(token.tokenData, ACCOUNT_RESET_TOKEN.data, 'token data matches')
              t.ok(token.createdAt, 'Got a createdAt')
              t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')
            })
            .then(function() {
              return db.deleteAccountResetToken(ACCOUNT_RESET_TOKEN_ID)
            })
            .then(function(result) {
              t.deepEqual(result, {}, 'Returned an empty object on account reset deletion')
              return db.accountResetToken(ACCOUNT_RESET_TOKEN_ID)
            })
            .then(function(token) {
              t.fail('Account Reset Token should no longer exist')
            }, function(err) {
              t.pass('Account Reset Token deleted successfully')
            })
        }
      )

      test(
        'db.forgotPasswordVerified',
        function (t) {
          t.plan(12)
          // for this test, we are creating a new account with a different email address
          // so that we can check that emailVerified turns from false to true (since
          // we already set it to true earlier)
          var ACCOUNT = {
            uid: uuid.v4('binary'),
            email: ('' + Math.random()).substr(2) + '@bar.com',
            emailCode: zeroBuffer16,
            emailVerified: false,
            verifierVersion: 1,
            verifyHash: zeroBuffer32,
            authSalt: zeroBuffer32,
            kA: zeroBuffer32,
            wrapWrapKb: zeroBuffer32,
            verifierSetAt: Date.now(),
          }
          var PASSWORD_FORGOT_TOKEN_ID = hex32()
          var PASSWORD_FORGOT_TOKEN = {
            data : hex32(),
            uid : ACCOUNT.uid,
            passCode : hex16(),
            tries : 1,
            createdAt: Date.now(),
          }
          var ACCOUNT_RESET_TOKEN_ID = hex32()
          var ACCOUNT_RESET_TOKEN = {
            tokenId : ACCOUNT_RESET_TOKEN_ID,
            data : hex32(),
            uid : ACCOUNT.uid,
            createdAt: Date.now(),
          }

          return db.createAccount(ACCOUNT.uid, ACCOUNT)
            .then(function() {
              var hexEmail = Buffer(ACCOUNT.email).toString('hex')
              return db.emailRecord(hexEmail)
            })
            .then(function(result) {
              t.pass('.emailRecord() did not error')
              return db.createPasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID, PASSWORD_FORGOT_TOKEN)
            })
            .then(function(passwordForgotToken) {
              t.pass('.createPasswordForgotToken() did not error')
              return db.forgotPasswordVerified(PASSWORD_FORGOT_TOKEN_ID, ACCOUNT_RESET_TOKEN)
            })
            .then(function() {
              t.pass('.forgotPasswordVerified() did not error')
              return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
            })
            .then(function(token) {
              t.fail('Password Forgot Token should no longer exist')
            }, function(err) {
              t.pass('Password Forgot Token deleted successfully')
            })
            .then(function() {
              return db.accountResetToken(ACCOUNT_RESET_TOKEN_ID)
            })
            .then(function(accountResetToken) {
              t.pass('.accountResetToken() did not error')
              // tokenId is not returned
              t.deepEqual(accountResetToken.uid, ACCOUNT.uid, 'token belongs to this account')
              t.deepEqual(accountResetToken.tokenData, ACCOUNT_RESET_TOKEN.data, 'token data matches')
              t.ok(accountResetToken.verifierSetAt, 'verifierSetAt is set to a truthy value')
            })
            .then(function() {
              return db.account(ACCOUNT.uid)
            })
            .then(function(account) {
              t.ok(account.emailVerified, 'account should now be emailVerified (truthy)')
              t.equal(account.emailVerified, 1, 'account should now be emailVerified (1)')
            })
            .then(function() {
              return db.deleteAccountResetToken(ACCOUNT_RESET_TOKEN_ID)
            })
            .then(function(result) {
              t.deepEqual(result, {}, 'Returned an empty object on account reset deletion')
              return db.accountResetToken(ACCOUNT_RESET_TOKEN_ID)
            })
            .then(function(token) {
              t.fail('Account Reset Token should no longer exist')
            }, function(err) {
              t.pass('Account Reset Token deleted successfully')
            })
        }
      )

      test(
        'db.accountDevices',
        function (t) {
          t.plan(3)
          var anotherSessionTokenId = hex32()
          var anotherSessionToken = {
            data : hex32(),
            uid : ACCOUNT.uid,
            createdAt: Date.now(),
          }
          db.createSessionToken(SESSION_TOKEN_ID, SESSION_TOKEN)
            .then(function(sessionToken) {
              return db.createSessionToken(anotherSessionTokenId, anotherSessionToken)
            })
            .then(function() {
              return db.accountDevices(ACCOUNT.uid)
            })
            .then(function(devices) {
              t.equal(devices.length, 2, 'Account devices should be two')
              return devices[0]
            })
            .then(function(sessionToken) {
              return db.deleteSessionToken(SESSION_TOKEN_ID)
            })
            .then(function(sessionToken) {
              return db.accountDevices(ACCOUNT.uid)
            })
            .then(function(devices) {
              t.equal(devices.length, 1, 'Account devices should be one')
              return devices[0]
            })
            .then(function(sessionToken) {
              return db.deleteSessionToken(anotherSessionTokenId)
            })
            .then(function(sessionToken) {
              return db.accountDevices(ACCOUNT.uid)
            })
            .then(function(devices) {
              t.equal(devices.length, 0, 'Account devices should be zero')
            })
        }
      )

      test(
        'db.resetAccount',
        function (t) {
          t.plan(6)
          return db.createSessionToken(SESSION_TOKEN_ID, SESSION_TOKEN)
            .then(function(sessionToken) {
              t.pass('.createSessionToken() did not error')
              return db.createAccountResetToken(ACCOUNT_RESET_TOKEN_ID, ACCOUNT_RESET_TOKEN)
            })
            .then(function() {
              t.pass('.createAccountResetToken() did not error')
              return db.resetAccount(ACCOUNT.uid, ACCOUNT)
            })
            .then(function(sessionToken) {
              t.pass('.resetAccount() did not error')
              return db.accountDevices(ACCOUNT.uid)
            })
            .then(function(devices) {
              t.pass('.accountDevices() did not error')
              t.equal(devices.length, 0, 'The devices length should be zero')
            })
            .then(function() {
              // account should STILL exist for this email address
              var hexEmail = Buffer(ACCOUNT.email).toString('hex')
              return db.accountExists(hexEmail)
            })
            .then(function(exists) {
              t.ok(exists, 'account still exists ok')
            }, function(err) {
              t.fail('the account for this email address should still exist')
            })
        }
      )

      test(
        'account deletion',
        function (t) {
          t.plan(1)
          // account should no longer exist for this email address
          return db.deleteAccount(ACCOUNT.uid)
            .then(function() {
              var hexEmail = Buffer(ACCOUNT.email).toString('hex')
              return db.accountExists(hexEmail)
            })
            .then(function(exists) {
              t.fail('account should no longer exist for this email address')
            }, function(err) {
              t.pass('account no longer exists for this email address')
            })
        }
      )

      test(
        'teardown',
        function (t) {
          return db.close()
        }
      )

    }
  )
