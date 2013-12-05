/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var uuid = require('uuid')
var log = { trace: console.log }

var config = require('../../config').root()
var Token = require('../../tokens')(log)
var DB = require('../../db')(
  config,
  log,
  Token.error,
  Token.AuthToken,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.SrpToken,
  Token.ForgotPasswordToken
)


var ACCOUNT = {
  uid: uuid.v4('binary'),
  email: 'foo@bar.com',
  emailCode: 'xxx',
  verified: false,
  srp: {
    verifier: '0000000000000000000000000000000000000000000000000000000000000000',
    salt: '0000000000000000000000000000000000000000000000000000000000000000'
  },
  kA: Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex'),
  wrapKb: Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex'),
  passwordStretching: { blah: false }
}


DB.connect()
  .then(
    function (db) {

      test(
        'account creation',
        function (t) {
          return db.createAccount(ACCOUNT)
          .then(function(account) {
            t.deepEqual(account.uid, ACCOUNT.uid, 'account.uid is the same as the input ACCOUNT.uid')
          })
          .then(function() {
            return db.accountExists(ACCOUNT.email)
          })
          .then(function(exists) {
            t.ok(exists, 'account exists for this email address')
          })
          .then(function() {
            return db.account(ACCOUNT.uid)
          })
          .then(function(account) {
            t.deepEqual(account.uid, ACCOUNT.uid)
            t.equal(account.email, ACCOUNT.email)
            t.equal(account.emailCode, ACCOUNT.emailCode)
            t.equal(account.verified, ACCOUNT.verified)
            t.deepEqual(account.kA, ACCOUNT.kA)
            t.deepEqual(account.wrapKb, ACCOUNT.wrapKb)
            t.deepEqual(account.srp, ACCOUNT.srp)
            t.deepEqual(account.passwordStretching, ACCOUNT.passwordStretching)
          })
        }
      )

      test(
        'srp token handling',
        function (t) {
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            return db.createSrpToken(emailRecord)
          })
          .then(function(srpToken) {
            t.deepEqual(srpToken.uid, ACCOUNT.uid, 'srpToken.uid is the same as the ACCOUNT.uid')
            t.equal(srpToken.v.toString('hex'), ACCOUNT.srp.verifier)
            t.equal(srpToken.s, ACCOUNT.srp.salt, 'srpToken.s == ACCOUNT.srp.salt')
            t.ok(srpToken.b, 'srpToken.b is true')
            return srpToken
          })
          .then(function(srpToken) {
            return db.srpToken(srpToken.tokenid)
          })
          .then(function(srpToken) {
            t.deepEqual(srpToken.uid, ACCOUNT.uid)
            t.equal(srpToken.v.toString('hex'), ACCOUNT.srp.verifier)
            t.equal(srpToken.s, ACCOUNT.srp.salt)
            t.ok(srpToken.b)
            return srpToken
          })
          .then(function(srpToken) {
            return db.deleteSrpToken(srpToken.tokenid)
          })
        }
      )

      test(
        'auth token handling',
        function (t) {
          var tokenid;
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            return db.createAuthToken({ uid: emailRecord.uid })
          })
          .then(function(authToken) {
            t.deepEqual(authToken.uid, ACCOUNT.uid)
            tokenid = authToken.tokenid
          })
          .then(function() {
            return db.authToken(tokenid)
          })
          .then(function(authToken) {
            t.deepEqual(authToken.tokenid, tokenid, 'token id matches')
            t.deepEqual(authToken.uid, ACCOUNT.uid)
            return authToken
          })
          .then(function(authToken) {
            return db.deleteAuthToken(authToken)
          })
        }
      )

      test(
        'session token handling',
        function (t) {
          var tokenid;
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            return db.createSessionToken(emailRecord)
          })
          .then(function(sessionToken) {
            t.deepEqual(sessionToken.uid, ACCOUNT.uid)
            tokenid = sessionToken.tokenid
          })
          .then(function() {
            return db.sessionToken(tokenid)
          })
          .then(function(sessionToken) {
            t.deepEqual(sessionToken.tokenid, tokenid, 'token id matches')
            t.deepEqual(sessionToken.uid, ACCOUNT.uid)
            t.equal(sessionToken.email, ACCOUNT.email)
            t.equal(sessionToken.emailCode, ACCOUNT.emailCode)
            t.equal(sessionToken.verified, ACCOUNT.verified)
            return sessionToken
          })
          .then(function(sessionToken) {
            return db.deleteSessionToken(sessionToken)
          })
        }
      )

      test(
        'keyfetch token handling',
        function (t) {
          var tokenid;
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            return db.createKeyFetchToken(emailRecord)
          })
          .then(function(keyFetchToken) {
            t.deepEqual(keyFetchToken.uid, ACCOUNT.uid)
            tokenid = keyFetchToken.tokenid
          })
          .then(function() {
            return db.keyFetchToken(tokenid)
          })
          .then(function(keyFetchToken) {
            t.deepEqual(keyFetchToken.tokenid, tokenid, 'token id matches')
            t.deepEqual(keyFetchToken.uid, ACCOUNT.uid)
            t.equal(keyFetchToken.verified, ACCOUNT.verified)
            t.deepEqual(keyFetchToken.kA, ACCOUNT.kA)
            t.deepEqual(keyFetchToken.wrapKb, ACCOUNT.wrapKb)
            return keyFetchToken
          })
          .then(function(keyFetchToken) {
            return db.deleteKeyFetchToken(keyFetchToken)
          })
        }
      )

      test(
        'reset token handling',
        function (t) {
          var tokenid;
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            return db.createAccountResetToken(emailRecord)
          })
          .then(function(accountResetToken) {
            t.deepEqual(accountResetToken.uid, ACCOUNT.uid, 'account reset token uid should be the same as the account.uid')
            tokenid = accountResetToken.tokenid
          })
          .then(function() {
            return db.accountResetToken(tokenid)
          })
          .then(function(accountResetToken) {
            t.deepEqual(accountResetToken.tokenid, tokenid, 'token id matches')
            t.deepEqual(accountResetToken.uid, ACCOUNT.uid, 'account reset token uid should still be the same as the account.uid')
            return accountResetToken
          })
          .then(function(accountResetToken) {
            return db.deleteAccountResetToken(accountResetToken)
          })
        }
      )

      test(
        'forgotpwd token handling',
        function (t) {
          var token1;
          var token1tries = 0
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            return db.createForgotPasswordToken(emailRecord)
          })
          .then(function(forgotPasswordToken) {
            t.deepEqual(forgotPasswordToken.uid, ACCOUNT.uid, 'forgotPasswordToken uid same as ACCOUNT.uid')
            token1 = forgotPasswordToken
            token1tries = token1.tries
          })
          .then(function() {
            return db.forgotPasswordToken(token1.tokenid)
          })
          .then(function(forgotPasswordToken) {
            t.deepEqual(forgotPasswordToken.tokenid, token1.tokenid, 'token id matches')
            t.deepEqual(forgotPasswordToken.uid, token1.uid, 'tokens are identical')
            return forgotPasswordToken
          })
          .then(function(forgotPasswordToken) {
            forgotPasswordToken.tries -= 1
            return db.updateForgotPasswordToken(forgotPasswordToken)
          })
          .then(function() {
            return db.forgotPasswordToken(token1.tokenid)
          })
          .then(function(forgotPasswordToken) {
            t.deepEqual(forgotPasswordToken.tokenid, token1.tokenid, 'token id matches again')
            t.equal(forgotPasswordToken.tries, token1tries - 1, '')
            return forgotPasswordToken
          })
          .then(function(forgotPasswordToken) {
            return db.deleteForgotPasswordToken(forgotPasswordToken)
          })
        }
      )

      test(
        'email verification',
        function (t) {
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            return db.verifyEmail(emailRecord)
          })
          .then(function() {
            return db.account(ACCOUNT.uid)
          })
          .then(function(account) {
            t.ok(account.verified, 'account should now be verified')
          })
        }
      )

      test(
        'db.authFinish',
        function (t) {
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            return db.createSrpToken(emailRecord)
          })
          .then(function(srpToken) {
            return db.authFinish(srpToken)
          })
          .then(function(authToken) {
            t.deepEqual(authToken.uid, ACCOUNT.uid)
          })
        }
      )

      test(
        'db.createSession',
        function (t) {
          var tokens1;
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            return db.createAuthToken(emailRecord)
          })
          .then(function(authToken) {
            return db.createSession(authToken)
          })
          .then(function(tokens) {
            t.deepEqual(tokens.keyFetchToken.uid, ACCOUNT.uid, 'keyFetchToken uid and account uid should be the same')
            t.deepEqual(tokens.sessionToken.uid, ACCOUNT.uid, 'sessionToken uid and account uid should be the same')
            tokens1 = tokens
          })
          .then(function() {
            return db.keyFetchToken(tokens1.keyFetchToken.tokenid)
          })
          .then(function(keyFetchToken) {
            t.deepEqual(keyFetchToken.uid, ACCOUNT.uid, 'keyFetchToken uid and account uid should still be the same')
            return db.deleteKeyFetchToken(tokens1.keyFetchToken)
          })
          .then(function() {
            return db.sessionToken(tokens1.sessionToken.tokenid)
          })
          .then(function(sessionToken) {
            t.deepEqual(sessionToken.uid, ACCOUNT.uid, 'sessionToken uid and account uid should still be the same')
            return db.deleteSessionToken(tokens1.sessionToken)
          })
        }
      )

      test(
        'db.createPasswordChange',
        function (t) {
          var tokens1;
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            return db.createAuthToken(emailRecord)
          })
          .then(function(authToken) {
            return db.createPasswordChange(authToken)
          })
          .then(function(tokens) {
            t.deepEqual(tokens.keyFetchToken.uid, ACCOUNT.uid, 'keyFetchToken.uid is the same as the original ACCOUNT.uid')
            t.deepEqual(tokens.accountResetToken.uid, ACCOUNT.uid, 'accountResetToken.uid is the same as the original ACCOUNT.uid')
            tokens1 = tokens
          })
          .then(function() {
            return db.keyFetchToken(tokens1.keyFetchToken.tokenid)
          })
          .then(function(keyFetchToken) {
            t.deepEqual(keyFetchToken.uid, ACCOUNT.uid)
            return db.deleteKeyFetchToken(tokens1.keyFetchToken)
          })
          .then(function() {
            return db.accountResetToken(tokens1.accountResetToken.tokenid)
          })
          .then(function(accountResetToken) {
            t.deepEqual(accountResetToken.uid, ACCOUNT.uid)
            return db.deleteAccountResetToken(tokens1.accountResetToken)
          })
        }
      )

      test(
        'db.forgotPasswordVerified',
        function (t) {
          var token1;
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            return db.createForgotPasswordToken(emailRecord)
          })
          .then(function(forgotPasswordToken) {
            return db.forgotPasswordVerified(forgotPasswordToken)
          })
          .then(function(accountResetToken) {
            t.deepEqual(accountResetToken.uid, ACCOUNT.uid, 'uid is the same as ACCOUNT.uid')
            token1 = accountResetToken
          })
          .then(function() {
            return db.accountResetToken(token1.tokenid)
          })
          .then(function(accountResetToken) {
            t.deepEqual(accountResetToken.uid, ACCOUNT.uid)
            return db.deleteAccountResetToken(token1)
          })
        }
      )

      test(
        'db.accountDevices',
        function (t) {
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            return db.createSessionToken(emailRecord)
          })
          .then(function(sessionToken) {
            return db.createSessionToken(sessionToken)
          })
          .then(function(sessionToken) {
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function(devices) {
            t.equal(devices.length, 2, 'Account devices should be two')
            return devices[0]
          })
          .then(function(sessionToken) {
            return db.deleteSessionToken(sessionToken)
          })
          .then(function(sessionToken) {
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function(devices) {
            t.equal(devices.length, 1)
            return devices[0]
          })
          .then(function(sessionToken) {
            return db.deleteSessionToken(sessionToken)
          })
        }
      )

      test(
        'db.resetAccount',
        function (t) {
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            return db.createSessionToken(emailRecord)
          })
          .then(function(sessionToken) {
            return db.createAccountResetToken(sessionToken)
          })
          .then(function(accountResetToken) {
            return db.resetAccount(accountResetToken, ACCOUNT)
          })
          .then(function(sessionToken) {
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function(devices) {
            t.equal(devices.length, 0, 'The devices length should be zero')
          })
        }
      )

      test(
        'account deletion',
        function (t) {
          return db.emailRecord(ACCOUNT.email)
          .then(function(emailRecord) {
            t.deepEqual(emailRecord.uid, ACCOUNT.uid, 'retrieving uid should be the same')
            return db.deleteAccount(emailRecord)
          })
          .then(function() {
            return db.accountExists(ACCOUNT.email, 'account should exist for this email address')
          })
          .then(function(exists) {
            t.notOk(exists, 'account should no longer exist')
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
