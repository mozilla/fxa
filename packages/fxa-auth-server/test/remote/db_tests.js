/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var uuid = require('uuid')
var crypto = require('crypto')
var base64url = require('base64url')
const log = { trace () {}, info () {}, error () {} }

var config = require('../../config').getProperties()
var P = require('../../lib/promise')
var UnblockCode = require('../../lib/crypto/base32')(config.signinUnblock.codeLength)
var TestServer = require('../test_server')
const lastAccessTimeUpdates = {
  enabled: true,
  enabledEmailAddresses: /.*/,
  sampleRate: 1
}
const Token = require('../../lib/tokens')(log, {
  lastAccessTimeUpdates: lastAccessTimeUpdates
})
const DB = require('../../lib/db')(
  { lastAccessTimeUpdates: lastAccessTimeUpdates },
  log,
  Token.error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken,
  UnblockCode
)

var TOKEN_FRESHNESS_THRESHOLD = require('../../lib/tokens/session_token').TOKEN_FRESHNESS_THRESHOLD

var zeroBuffer16 = Buffer('00000000000000000000000000000000', 'hex')
var zeroBuffer32 = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')

var ACCOUNT = {
  uid: uuid.v4('binary'),
  email: 'foo@bar.com',
  emailCode: zeroBuffer16,
  emailVerified: false,
  verifierVersion: 1,
  verifyHash: zeroBuffer32,
  authSalt: zeroBuffer32,
  kA: zeroBuffer32,
  wrapWrapKb: zeroBuffer32,
  tokenVerificationId: zeroBuffer16
}

describe('remote db', function() {
  this.timeout(20000)
  let dbServer, db
  before(() => {
    return TestServer.start(config)
      .then(s => {
        dbServer = s
        return DB.connect(config[config.db.backend])
      })
      .then(x => {
        db = x
        return db.createAccount(ACCOUNT)
      })
      .then((account) => {
        assert.deepEqual(account.uid, ACCOUNT.uid, 'account.uid is the same as the input ACCOUNT.uid')
      })
  })

  it(
    'ping',
    () => {
      return db.ping()
    }
  )

  it(
    'account creation',
    () => {
      return db.accountExists(ACCOUNT.email)
        .then(function(exists) {
          assert.ok(exists, 'account exists for this email address')
        })
        .then(function() {
          return db.account(ACCOUNT.uid)
        })
        .then(function(account) {
          assert.deepEqual(account.uid, ACCOUNT.uid, 'uid')
          assert.equal(account.email, ACCOUNT.email, 'email')
          assert.deepEqual(account.emailCode, ACCOUNT.emailCode, 'emailCode')
          assert.equal(account.emailVerified, ACCOUNT.emailVerified, 'emailVerified')
          assert.deepEqual(account.kA, ACCOUNT.kA, 'kA')
          assert.deepEqual(account.wrapWrapKb, ACCOUNT.wrapWrapKb, 'wrapWrapKb')
          assert(! account.verifyHash, 'verifyHash')
          assert.deepEqual(account.authSalt, ACCOUNT.authSalt, 'authSalt')
          assert.equal(account.verifierVersion, ACCOUNT.verifierVersion, 'verifierVersion')
          assert.ok(account.createdAt, 'createdAt')
        })
    }
  )

  it(
    'session token handling',
    () => {
      var tokenId
      return db.sessions(ACCOUNT.uid)
        .then(function(sessions) {
          assert.ok(Array.isArray(sessions), 'sessions is array')
          assert.equal(sessions.length, 0, 'sessions is empty')
          return db.emailRecord(ACCOUNT.email)
        })
        .then(function(emailRecord) {
          emailRecord.createdAt = Date.now()
          emailRecord.tokenVerificationId = ACCOUNT.tokenVerificationId
          return db.createSessionToken(emailRecord, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:41.0) Gecko/20100101 Firefox/41.0')
        })
        .then(function(sessionToken) {
          assert.deepEqual(sessionToken.uid, ACCOUNT.uid)
          tokenId = sessionToken.tokenId
          return db.sessions(ACCOUNT.uid)
        })
        .then(function(sessions) {
          assert.equal(sessions.length, 1, 'sessions contains one item')
          assert.equal(Object.keys(sessions[0]).length, 16, 'session has correct number of properties')
          assert.ok(Buffer.isBuffer(sessions[0].tokenId), 'tokenId property is buffer')
          assert.equal(sessions[0].uid.toString('hex'), ACCOUNT.uid.toString('hex'), 'uid property is correct')
          assert.ok(sessions[0].createdAt >= ACCOUNT.createdAt, 'createdAt property seems correct')
          assert.equal(sessions[0].uaBrowser, 'Firefox', 'uaBrowser property is correct')
          assert.equal(sessions[0].uaBrowserVersion, '41', 'uaBrowserVersion property is correct')
          assert.equal(sessions[0].uaOS, 'Mac OS X', 'uaOS property is correct')
          assert.equal(sessions[0].uaOSVersion, '10.10', 'uaOSVersion property is correct')
          assert.equal(sessions[0].uaDeviceType, null, 'uaDeviceType property is correct')
          assert.equal(sessions[0].lastAccessTime, sessions[0].createdAt, 'lastAccessTime property is correct')
          return db.sessionToken(tokenId)
        })
        .then(function(sessionToken) {
          assert.deepEqual(sessionToken.tokenId, tokenId, 'token id matches')
          assert.equal(sessionToken.uaBrowser, 'Firefox')
          assert.equal(sessionToken.uaBrowserVersion, '41')
          assert.equal(sessionToken.uaOS, 'Mac OS X')
          assert.equal(sessionToken.uaOSVersion, '10.10')
          assert.equal(sessionToken.uaDeviceType, null)
          assert.equal(sessionToken.lastAccessTime, sessionToken.createdAt)
          assert.deepEqual(sessionToken.uid, ACCOUNT.uid)
          assert.equal(sessionToken.email, ACCOUNT.email)
          assert.deepEqual(sessionToken.emailCode, ACCOUNT.emailCode)
          assert.equal(sessionToken.emailVerified, ACCOUNT.emailVerified)
          return sessionToken
        })
        .then(function(sessionToken) {
          sessionToken.lastAccessTime -= 59 * 60 * 1000
          return db.updateSessionToken(sessionToken, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:41.0) Gecko/20100101 Firefox/41.0')
        })
        .then(function() {
          return db.sessionToken(tokenId)
        })
        .then(function(sessionToken) {
          assert.equal(sessionToken.lastAccessTime, sessionToken.createdAt, 'session token was not updated')
          return sessionToken
        })
        .then(function(sessionToken) {
          sessionToken.lastAccessTime -= TOKEN_FRESHNESS_THRESHOLD
          return db.updateSessionToken(sessionToken, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:41.0) Gecko/20100101 Firefox/41.0')
        })
        .then(function() {
          return db.sessionToken(tokenId)
        })
        .then(function(sessionToken) {
          assert.ok(sessionToken.lastAccessTime > sessionToken.createdAt, 'session token was updated')
          return sessionToken
        })
        .then(function(sessionToken) {
          return db.updateSessionToken(sessionToken, 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0')
        })
        .then(function() {
          return db.sessions(ACCOUNT.uid)
        })
        .then(function(sessions) {
          assert.equal(sessions.length, 1, 'sessions still contains one item')
          assert.equal(sessions[0].uaBrowser, 'Firefox Mobile', 'uaBrowser property is correct')
          assert.equal(sessions[0].uaBrowserVersion, '41', 'uaBrowserVersion property is correct')
          assert.equal(sessions[0].uaOS, 'Android', 'uaOS property is correct')
          assert.equal(sessions[0].uaOSVersion, '4.4', 'uaOSVersion property is correct')
          assert.equal(sessions[0].uaDeviceType, 'mobile', 'uaDeviceType property is correct')
          return db.sessionToken(tokenId)
        })
        .then(function(sessionToken) {
          assert.equal(sessionToken.uaBrowser, 'Firefox Mobile')
          assert.equal(sessionToken.uaBrowserVersion, '41')
          assert.equal(sessionToken.uaOS, 'Android')
          assert.equal(sessionToken.uaOSVersion, '4.4')
          assert.equal(sessionToken.uaDeviceType, 'mobile')
          assert.ok(sessionToken.lastAccessTime >= sessionToken.createdAt)
          assert.ok(sessionToken.lastAccessTime <= Date.now())
          return sessionToken
        })
        .then(function(sessionToken) {
          return db.deleteSessionToken(sessionToken)
        })
        .then(function() {
          return db.sessionToken(tokenId)
          .then(function(sessionToken) {
            assert(false, 'The above sessionToken() call should fail, since the sessionToken has been deleted')
          }, function(err) {
            assert.equal(err.errno, 110, 'sessionToken() fails with the correct error code')
            var msg = 'Error: The authentication token could not be found'
            assert.equal(msg, '' + err, 'sessionToken() fails with the correct message')
          })
        })
    }
  )

  it(
    'device registration',
    () => {
      var sessionToken
      var deviceInfo = {
        id: crypto.randomBytes(16),
        name: '',
        type: 'mobile',
        pushCallback: 'https://foo/bar',
        pushPublicKey: base64url(Buffer.concat([Buffer.from('\x04'), crypto.randomBytes(64)])),
        pushAuthKey: base64url(crypto.randomBytes(16))
      }
      return db.emailRecord(ACCOUNT.email)
          .then(function (emailRecord) {
            emailRecord.tokenVerificationId = ACCOUNT.tokenVerificationId
            // Create a session token
            return db.createSessionToken(emailRecord, 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0')
          })
          .then(function (result) {
            sessionToken = result
            // Attempt to update a non-existent device
            return db.updateDevice(ACCOUNT.uid, sessionToken.tokenId, deviceInfo)
              .then(function () {
                assert(false, 'updating a non-existent device should have failed')
              }, function (err) {
                assert.equal(err.errno, 123, 'err.errno === 123')
              })
          })
          .then(function () {
            // Attempt to delete a non-existent device
            return db.deleteDevice(ACCOUNT.uid, deviceInfo.id)
              .then(function () {
                assert(false, 'deleting a non-existent device should have failed')
              }, function (err) {
                assert.equal(err.errno, 123, 'err.errno === 123')
              })
          })
          .then(function () {
            // Fetch all of the devices for the account
            return db.devices(ACCOUNT.uid)
              .catch(function () {
                assert(false, 'getting devices should not have failed')
              })
          })
          .then(function (devices) {
            assert.ok(Array.isArray(devices), 'devices is array')
            assert.equal(devices.length, 0, 'devices array is empty')
            // Create a device
            return db.createDevice(ACCOUNT.uid, sessionToken.tokenId, deviceInfo)
              .catch(function (err) {
                assert(false, 'adding a new device should not have failed')
              })
          })
          .then(function (device) {
            assert.ok(Buffer.isBuffer(device.id), 'device.id is set')
            assert.ok(device.createdAt > 0, 'device.createdAt is set')
            assert.equal(device.name, deviceInfo.name, 'device.name is correct')
            assert.equal(device.type, deviceInfo.type, 'device.type is correct')
            assert.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
            assert.equal(device.pushPublicKey, deviceInfo.pushPublicKey, 'device.pushPublicKey is correct')
            assert.equal(device.pushAuthKey, deviceInfo.pushAuthKey, 'device.pushAuthKey is correct')
            // Attempt to create a device with a duplicate session token
            return db.createDevice(ACCOUNT.uid, sessionToken.tokenId, deviceInfo)
              .then(function () {
                assert(false, 'adding a device with a duplicate session token should have failed')
              }, function (err) {
                assert.equal(err.errno, 124, 'err.errno')
              })
          })
          .then(function () {
            // Fetch all of the devices for the account
            return db.devices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 1, 'devices array contains one item')
            return devices[0]
          })
          .then(function (device) {
            assert.ok(Buffer.isBuffer(device.id), 'device.id is set')
            assert.ok(device.lastAccessTime > 0, 'device.lastAccessTime is set')
            assert.equal(device.name, deviceInfo.name, 'device.name is correct')
            assert.equal(device.type, deviceInfo.type, 'device.type is correct')
            assert.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
            assert.equal(device.pushPublicKey, deviceInfo.pushPublicKey, 'device.pushPublicKey is correct')
            assert.equal(device.pushAuthKey, deviceInfo.pushAuthKey, 'device.pushAuthKey is correct')
            assert.equal(device.uaBrowser, 'Firefox Mobile', 'device.uaBrowser is correct')
            assert.equal(device.uaBrowserVersion, '41', 'device.uaBrowserVersion is correct')
            assert.equal(device.uaOS, 'Android', 'device.uaOS is correct')
            assert.equal(device.uaOSVersion, '4.4', 'device.uaOSVersion is correct')
            assert.equal(device.uaDeviceType, 'mobile', 'device.uaDeviceType is correct')
            deviceInfo.id = device.id
            deviceInfo.name = 'wibble'
            deviceInfo.type = 'desktop'
            deviceInfo.pushCallback = ''
            deviceInfo.pushPublicKey = ''
            deviceInfo.pushAuthKey = ''
            // Update the device and the session token
            return P.all([
              db.updateDevice(ACCOUNT.uid, sessionToken.tokenId, deviceInfo),
              db.updateSessionToken(sessionToken, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:44.0) Gecko/20100101 Firefox/44.0')
            ])
              .catch(function (err) {
                assert(false, 'updating a new device or existing session token should not have failed')
              })
          })
          .then(function (device) {
            // Fetch all of the devices for the account
            return db.devices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 1, 'devices array contains one item')
            return devices[0]
          })
          .then(function (device) {
            assert.ok(device.lastAccessTime > 0, 'device.lastAccessTime is set')
            assert.equal(device.name, deviceInfo.name, 'device.name is correct')
            assert.equal(device.type, deviceInfo.type, 'device.type is correct')
            assert.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
            assert.equal(device.pushPublicKey, '', 'device.pushPublicKey is correct')
            assert.equal(device.pushAuthKey, '', 'device.pushAuthKey is correct')
            assert.equal(device.uaBrowser, 'Firefox', 'device.uaBrowser is correct')
            assert.equal(device.uaBrowserVersion, '44', 'device.uaBrowserVersion is correct')
            assert.equal(device.uaOS, 'Mac OS X', 'device.uaOS is correct')
            assert.equal(device.uaOSVersion, '10.10', 'device.uaOSVersion is correct')
            assert.equal(device.uaDeviceType, null, 'device.uaDeviceType is correct')
            // Disable the lastAccessTime property
            lastAccessTimeUpdates.enabled = false
            // Fetch all of the devices for the account
            return db.devices(ACCOUNT.uid)
          })
          .then(function(devices) {
            assert.equal(devices.length, 1, 'devices array still contains one item')
            assert.equal(devices[0].lastAccessTime, null, 'device.lastAccessTime should be null')
            // Reinstate the lastAccessTime property
            lastAccessTimeUpdates.enabled = true
            // Delete the device
            return db.deleteDevice(ACCOUNT.uid, deviceInfo.id)
              .catch(function () {
                assert(false, 'deleting a device should not have failed')
              })
          })
          .then(function () {
            // Fetch all of the devices for the account
            return db.devices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 0, 'devices array is empty')
          })
    }
  )

  it(
    'keyfetch token handling',
    () => {
      var tokenId
      return db.emailRecord(ACCOUNT.email)
        .then(function(emailRecord) {
          return db.createKeyFetchToken({
            uid: emailRecord.uid,
            kA: emailRecord.kA,
            wrapKb: ACCOUNT.wrapWrapKb
          })
        })
        .then(function(keyFetchToken) {
          assert.deepEqual(keyFetchToken.uid, ACCOUNT.uid)
          tokenId = keyFetchToken.tokenId
        })
        .then(function() {
          return db.keyFetchToken(tokenId)
        })
        .then(function(keyFetchToken) {
          assert.deepEqual(keyFetchToken.tokenId, tokenId, 'token id matches')
          assert.deepEqual(keyFetchToken.uid, ACCOUNT.uid)
          assert.equal(keyFetchToken.emailVerified, ACCOUNT.emailVerified)
          return keyFetchToken
        })
        .then(function(keyFetchToken) {
          return db.deleteKeyFetchToken(keyFetchToken)
        })
        .then(function() {
          return db.keyFetchToken(tokenId)
        })
        .then(function(keyFetchToken) {
          assert(false, 'The above keyFetchToken() call should fail, since the keyFetchToken has been deleted')
        }, function(err) {
          assert.equal(err.errno, 110, 'keyFetchToken() fails with the correct error code')
          var msg = 'Error: The authentication token could not be found'
          assert.equal(msg, '' + err, 'keyFetchToken() fails with the correct message')
        })
    }
  )

  it(
    'reset token handling',
    () => {
      var tokenId
      return db.emailRecord(ACCOUNT.email)
        .then(function(emailRecord) {
          return db.createPasswordForgotToken(emailRecord)
        })
        .then(function(passwordForgotToken) {
          return db.forgotPasswordVerified(passwordForgotToken)
        })
        .then(function(accountResetToken) {
          assert.deepEqual(accountResetToken.uid, ACCOUNT.uid, 'account reset token uid should be the same as the account.uid')
          tokenId = accountResetToken.tokenId
        })
        .then(function() {
          return db.accountResetToken(tokenId)
        })
        .then(function(accountResetToken) {
          assert.deepEqual(accountResetToken.tokenId, tokenId, 'token id matches')
          assert.deepEqual(accountResetToken.uid, ACCOUNT.uid, 'account reset token uid should still be the same as the account.uid')
          return accountResetToken
        })
        .then(function(accountResetToken) {
          return db.deleteAccountResetToken(accountResetToken)
        })
        .then(function() {
          return db.accountResetToken(tokenId)
        })
        .then(function(accountResetToken) {
          assert(false, 'The above accountResetToken() call should fail, since the accountResetToken has been deleted')
        }, function(err) {
          assert.equal(err.errno, 110, 'accountResetToken() fails with the correct error code')
          var msg = 'Error: The authentication token could not be found'
          assert.equal(msg, '' + err, 'accountResetToken() fails with the correct message')
        })
    }
  )

  it(
    'forgotpwd token handling',
    () => {
      var token1
      var token1tries = 0
      return db.emailRecord(ACCOUNT.email)
        .then(function(emailRecord) {
          return db.createPasswordForgotToken(emailRecord)
        })
        .then(function(passwordForgotToken) {
          assert.deepEqual(passwordForgotToken.uid, ACCOUNT.uid, 'passwordForgotToken uid same as ACCOUNT.uid')
          token1 = passwordForgotToken
          token1tries = token1.tries
        })
        .then(function() {
          return db.passwordForgotToken(token1.tokenId)
        })
        .then(function(passwordForgotToken) {
          assert.deepEqual(passwordForgotToken.tokenId, token1.tokenId, 'token id matches')
          assert.deepEqual(passwordForgotToken.uid, token1.uid, 'tokens are identical')
          return passwordForgotToken
        })
        .then(function(passwordForgotToken) {
          passwordForgotToken.tries -= 1
          return db.updatePasswordForgotToken(passwordForgotToken)
        })
        .then(function() {
          return db.passwordForgotToken(token1.tokenId)
        })
        .then(function(passwordForgotToken) {
          assert.deepEqual(passwordForgotToken.tokenId, token1.tokenId, 'token id matches again')
          assert.equal(passwordForgotToken.tries, token1tries - 1, '')
          return passwordForgotToken
        })
        .then(function(passwordForgotToken) {
          return db.deletePasswordForgotToken(passwordForgotToken)
        })
        .then(function() {
          return db.passwordForgotToken(token1.tokenId)
        })
        .then(function(passwordForgotToken) {
          assert(false, 'The above passwordForgotToken() call should fail, since the passwordForgotToken has been deleted')
        }, function(err) {
          assert.equal(err.errno, 110, 'passwordForgotToken() fails with the correct error code')
          var msg = 'Error: The authentication token could not be found'
          assert.equal(msg, '' + err, 'passwordForgotToken() fails with the correct message')
        })
    }
  )

  it(
    'email verification',
    () => {
      return db.emailRecord(ACCOUNT.email)
        .then(function(emailRecord) {
          return db.verifyEmail(emailRecord)
        })
        .then(function() {
          return db.account(ACCOUNT.uid)
        })
        .then(function(account) {
          assert.ok(account.emailVerified, 'account should now be emailVerified')
        })
    }
  )

  it(
    'db.forgotPasswordVerified',
    () => {
      var token1
      return db.emailRecord(ACCOUNT.email)
        .then(function(emailRecord) {
          return db.createPasswordForgotToken(emailRecord)
        })
        .then(function(passwordForgotToken) {
          return db.forgotPasswordVerified(passwordForgotToken)
        })
        .then(function(accountResetToken) {
          assert.deepEqual(accountResetToken.uid, ACCOUNT.uid, 'uid is the same as ACCOUNT.uid')
          token1 = accountResetToken
        })
        .then(function() {
          return db.accountResetToken(token1.tokenId)
        })
        .then(function(accountResetToken) {
          assert.deepEqual(accountResetToken.uid, ACCOUNT.uid)
          return db.deleteAccountResetToken(token1)
        })
    }
  )

  it(
    'db.resetAccount',
    () => {
      return db.emailRecord(ACCOUNT.email)
        .then(function(emailRecord) {
          emailRecord.tokenVerificationId = ACCOUNT.tokenVerificationId
          return db.createSessionToken(emailRecord, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:41.0) Gecko/20100101 Firefox/41.0')
        })
        .then(function(sessionToken) {
          return db.forgotPasswordVerified(sessionToken)
        })
        .then(function(accountResetToken) {
          return db.resetAccount(accountResetToken, ACCOUNT)
        })
        .then(function() {
          // account should STILL exist for this email address
          return db.accountExists(ACCOUNT.email)
        })
        .then(function(exists) {
          assert.equal(exists, true, 'account should still exist')
        })
    }
  )

  it(
    'db.securityEvent',
    () => {
      return db.securityEvent({
        ipAddr: '127.0.0.1',
        name: 'account.create',
        uid: ACCOUNT.uid
      })
      .then(function(resp) {
        assert.equal(typeof resp, 'object')
        assert.equal(Object.keys(resp).length, 0)

        return db.securityEvent({
          ipAddr: '127.0.0.1',
          name: 'account.login',
          uid: ACCOUNT.uid
        })
      })
      .then(function(resp) {
        assert.equal(typeof resp, 'object')
        assert.equal(Object.keys(resp).length, 0)
      })
    }
  )

  it(
    'db.securityEvents',
    () => {
      return db.securityEvents({
        ipAddr: '127.0.0.1',
        uid: ACCOUNT.uid
      })
      .then(function (events) {
        assert.equal(events.length, 2)
      })
    }
  )

  it(
    'unblock code',
    () => {
      var unblockCode
      return db.createUnblockCode(ACCOUNT.uid)
        .then(function(_unblockCode) {
          assert.ok(_unblockCode)
          unblockCode = _unblockCode

          return db.consumeUnblockCode(ACCOUNT.uid, 'NOTREAL')
        })
        .then(
          function () {
            assert(false, 'consumeUnblockCode() with an invalid unblock code should not succeed')
          },
          function (err) {
            assert.equal(err.errno, 127, 'consumeUnblockCode() fails with the correct error code')
            var msg = 'Error: Invalid unblock code'
            assert.equal(msg, '' + err, 'consumeUnblockCode() fails with the correct message')
          }
        )
        .then(
          function() {
            return db.consumeUnblockCode(ACCOUNT.uid, unblockCode)
          }
        )
        .then(
          function() {
            // re-use unblock code, no longer valid
            return db.consumeUnblockCode(ACCOUNT.uid, unblockCode)
          }, function (err) {
            assert(false, 'consumeUnblockCode() with a valid unblock code should succeed')
          }
        )
        .then(
          function () {
            assert(false, 'consumeUnblockCode() with an invalid unblock code should not succeed')
          },
          function (err) {
            assert.equal(err.errno, 127, 'consumeUnblockCode() fails with the correct error code')
            var msg = 'Error: Invalid unblock code'
            assert.equal(msg, '' + err, 'consumeUnblockCode() fails with the correct message')
          }
        )
    }
  )

  it(
    'account deletion',
    () => {
      return db.emailRecord(ACCOUNT.email)
        .then(function(emailRecord) {
          assert.deepEqual(emailRecord.uid, ACCOUNT.uid, 'retrieving uid should be the same')
          return db.deleteAccount(emailRecord)
        })
        .then(function() {
          // account should no longer exist for this email address
          return db.accountExists(ACCOUNT.email)
        })
        .then(function(exists) {
          assert.equal(exists, false, 'account should no longer exist')
        })
    }
  )

  after(() => {
    return TestServer.stop(dbServer)
      .then(() => {
        return db && db.close()
      })
  })
})
