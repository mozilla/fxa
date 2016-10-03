/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var uuid = require('uuid')
var crypto = require('crypto')
var base64url = require('base64url')
var log = { trace: console.log, info: console.log } // eslint-disable-line no-console

var config = require('../../config').getProperties()
var P = require('../../lib/promise')
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
  Token.PasswordChangeToken
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

var dbServer
var dbConn = TestServer.start(config)
    .then(
      function (server) {
        dbServer = server
        return DB.connect(config[config.db.backend])
      }
    )

test(
  'ping',
  function (t) {
    t.plan(1)
    return dbConn.then(function(db) {
      return db.ping()
    })
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
    return dbConn.then(function(db) {
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
        t.deepEqual(account.uid, ACCOUNT.uid, 'uid')
        t.equal(account.email, ACCOUNT.email, 'email')
        t.deepEqual(account.emailCode, ACCOUNT.emailCode, 'emailCode')
        t.equal(account.emailVerified, ACCOUNT.emailVerified, 'emailVerified')
        t.deepEqual(account.kA, ACCOUNT.kA, 'kA')
        t.deepEqual(account.wrapWrapKb, ACCOUNT.wrapWrapKb, 'wrapWrapKb')
        t.notOk(account.verifyHash, 'verifyHash')
        t.deepEqual(account.authSalt, ACCOUNT.authSalt, 'authSalt')
        t.equal(account.verifierVersion, ACCOUNT.verifierVersion, 'verifierVersion')
        t.ok(account.createdAt, 'createdAt')
      })
    })
  }
)

test(
  'session token handling',
  function (t) {
    return dbConn.then(function(db) {
      var tokenId
      return db.sessions(ACCOUNT.uid)
      .then(function(sessions) {
        t.ok(Array.isArray(sessions), 'sessions is array')
        t.equal(sessions.length, 0, 'sessions is empty')
        return db.emailRecord(ACCOUNT.email)
      })
      .then(function(emailRecord) {
        emailRecord.createdAt = Date.now()
        emailRecord.tokenVerificationId = ACCOUNT.tokenVerificationId
        return db.createSessionToken(emailRecord, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:41.0) Gecko/20100101 Firefox/41.0')
      })
      .then(function(sessionToken) {
        t.deepEqual(sessionToken.uid, ACCOUNT.uid)
        tokenId = sessionToken.tokenId
        return db.sessions(ACCOUNT.uid)
      })
      .then(function(sessions) {
        t.equal(sessions.length, 1, 'sessions contains one item')
        t.equal(Object.keys(sessions[0]).length, 9, 'session has nine properties')
        t.ok(Buffer.isBuffer(sessions[0].tokenId), 'tokenId property is buffer')
        t.equal(sessions[0].uid.toString('hex'), ACCOUNT.uid.toString('hex'), 'uid property is correct')
        t.ok(sessions[0].createdAt >= ACCOUNT.createdAt, 'createdAt property seems correct')
        t.equal(sessions[0].uaBrowser, 'Firefox', 'uaBrowser property is correct')
        t.equal(sessions[0].uaBrowserVersion, '41', 'uaBrowserVersion property is correct')
        t.equal(sessions[0].uaOS, 'Mac OS X', 'uaOS property is correct')
        t.equal(sessions[0].uaOSVersion, '10.10', 'uaOSVersion property is correct')
        t.equal(sessions[0].uaDeviceType, null, 'uaDeviceType property is correct')
        t.equal(sessions[0].lastAccessTime, sessions[0].createdAt, 'lastAccessTime property is correct')
        return db.sessionToken(tokenId)
      })
      .then(function(sessionToken) {
        t.deepEqual(sessionToken.tokenId, tokenId, 'token id matches')
        t.equal(sessionToken.uaBrowser, 'Firefox')
        t.equal(sessionToken.uaBrowserVersion, '41')
        t.equal(sessionToken.uaOS, 'Mac OS X')
        t.equal(sessionToken.uaOSVersion, '10.10')
        t.equal(sessionToken.uaDeviceType, null)
        t.equal(sessionToken.lastAccessTime, sessionToken.createdAt)
        t.deepEqual(sessionToken.uid, ACCOUNT.uid)
        t.equal(sessionToken.email, ACCOUNT.email)
        t.deepEqual(sessionToken.emailCode, ACCOUNT.emailCode)
        t.equal(sessionToken.emailVerified, ACCOUNT.emailVerified)
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
        t.equal(sessionToken.lastAccessTime, sessionToken.createdAt, 'session token was not updated')
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
        t.ok(sessionToken.lastAccessTime > sessionToken.createdAt, 'session token was updated')
        return sessionToken
      })
      .then(function(sessionToken) {
        return db.updateSessionToken(sessionToken, 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0')
      })
      .then(function() {
        return db.sessions(ACCOUNT.uid)
      })
      .then(function(sessions) {
        t.equal(sessions.length, 1, 'sessions still contains one item')
        t.equal(sessions[0].uaBrowser, 'Firefox Mobile', 'uaBrowser property is correct')
        t.equal(sessions[0].uaBrowserVersion, '41', 'uaBrowserVersion property is correct')
        t.equal(sessions[0].uaOS, 'Android', 'uaOS property is correct')
        t.equal(sessions[0].uaOSVersion, '4.4', 'uaOSVersion property is correct')
        t.equal(sessions[0].uaDeviceType, 'mobile', 'uaDeviceType property is correct')
        return db.sessionToken(tokenId)
      })
      .then(function(sessionToken) {
        t.equal(sessionToken.uaBrowser, 'Firefox Mobile')
        t.equal(sessionToken.uaBrowserVersion, '41')
        t.equal(sessionToken.uaOS, 'Android')
        t.equal(sessionToken.uaOSVersion, '4.4')
        t.equal(sessionToken.uaDeviceType, 'mobile')
        t.ok(sessionToken.lastAccessTime >= sessionToken.createdAt)
        t.ok(sessionToken.lastAccessTime <= Date.now())
        return sessionToken
      })
      .then(function(sessionToken) {
        return db.deleteSessionToken(sessionToken)
      })
      .then(function() {
        return db.sessionToken(tokenId)
      })
      .then(function(sessionToken) {
        t.fail('The above sessionToken() call should fail, since the sessionToken has been deleted')
      }, function(err) {
        t.equal(err.errno, 110, 'sessionToken() fails with the correct error code')
        var msg = 'Error: Invalid authentication token in request signature'
        t.equal(msg, '' + err, 'sessionToken() fails with the correct message')
      })
    })
  }
)

test(
  'device registration',
  function (t) {
    var sessionToken
    var deviceInfo = {
      id: crypto.randomBytes(16),
      name: '',
      type: 'mobile',
      pushCallback: 'https://foo/bar',
      pushPublicKey: base64url(Buffer.concat([new Buffer('\x04'), crypto.randomBytes(64)])),
      pushAuthKey: base64url(crypto.randomBytes(16))
    }
    return dbConn.then(function (db) {
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
              t.fail('updating a non-existent device should have failed')
            }, function (err) {
              t.pass('updating a non-existent device failed')
              t.equal(err.errno, 123, 'err.errno === 123')
            })
        })
        .then(function () {
          // Attempt to delete a non-existent device
          return db.deleteDevice(ACCOUNT.uid, deviceInfo.id)
            .then(function () {
              t.fail('deleting a non-existent device should have failed')
            }, function (err) {
              t.pass('deleting a non-existent device failed')
              t.equal(err.errno, 123, 'err.errno === 123')
            })
        })
        .then(function () {
          // Fetch all of the devices for the account
          return db.devices(ACCOUNT.uid)
            .catch(function () {
              t.fail('getting devices should not have failed')
            })
        })
        .then(function (devices) {
          t.ok(Array.isArray(devices), 'devices is array')
          t.equal(devices.length, 0, 'devices array is empty')
          // Create a device
          return db.createDevice(ACCOUNT.uid, sessionToken.tokenId, deviceInfo)
            .catch(function (err) {
              t.fail('adding a new device should not have failed')
            })
        })
        .then(function (device) {
          t.ok(Buffer.isBuffer(device.id), 'device.id is set')
          t.ok(device.createdAt > 0, 'device.createdAt is set')
          t.equal(device.name, deviceInfo.name, 'device.name is correct')
          t.equal(device.type, deviceInfo.type, 'device.type is correct')
          t.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
          t.equal(device.pushPublicKey, deviceInfo.pushPublicKey, 'device.pushPublicKey is correct')
          t.equal(device.pushAuthKey, deviceInfo.pushAuthKey, 'device.pushAuthKey is correct')
          // Attempt to create a device with a duplicate session token
          return db.createDevice(ACCOUNT.uid, sessionToken.tokenId, deviceInfo)
            .then(function () {
              t.fail('adding a device with a duplicate session token should have failed')
            }, function (err) {
              t.pass('adding a device with a duplicate session token failed')
              t.equal(err.errno, 124, 'err.errno')
            })
        })
        .then(function () {
          // Fetch all of the devices for the account
          return db.devices(ACCOUNT.uid)
        })
        .then(function (devices) {
          t.equal(devices.length, 1, 'devices array contains one item')
          return devices[0]
        })
        .then(function (device) {
          t.ok(Buffer.isBuffer(device.id), 'device.id is set')
          t.ok(device.lastAccessTime > 0, 'device.lastAccessTime is set')
          t.equal(device.name, deviceInfo.name, 'device.name is correct')
          t.equal(device.type, deviceInfo.type, 'device.type is correct')
          t.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
          t.equal(device.pushPublicKey, deviceInfo.pushPublicKey, 'device.pushPublicKey is correct')
          t.equal(device.pushAuthKey, deviceInfo.pushAuthKey, 'device.pushAuthKey is correct')
          t.equal(device.uaBrowser, 'Firefox Mobile', 'device.uaBrowser is correct')
          t.equal(device.uaBrowserVersion, '41', 'device.uaBrowserVersion is correct')
          t.equal(device.uaOS, 'Android', 'device.uaOS is correct')
          t.equal(device.uaOSVersion, '4.4', 'device.uaOSVersion is correct')
          t.equal(device.uaDeviceType, 'mobile', 'device.uaDeviceType is correct')
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
              t.fail('updating a new device or existing session token should not have failed')
            })
        })
        .then(function (device) {
          // Fetch all of the devices for the account
          return db.devices(ACCOUNT.uid)
        })
        .then(function (devices) {
          t.equal(devices.length, 1, 'devices array contains one item')
          return devices[0]
        })
        .then(function (device) {
          t.ok(device.lastAccessTime > 0, 'device.lastAccessTime is set')
          t.equal(device.name, deviceInfo.name, 'device.name is correct')
          t.equal(device.type, deviceInfo.type, 'device.type is correct')
          t.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
          t.equal(device.pushPublicKey, '', 'device.pushPublicKey is correct')
          t.equal(device.pushAuthKey, '', 'device.pushAuthKey is correct')
          t.equal(device.uaBrowser, 'Firefox', 'device.uaBrowser is correct')
          t.equal(device.uaBrowserVersion, '44', 'device.uaBrowserVersion is correct')
          t.equal(device.uaOS, 'Mac OS X', 'device.uaOS is correct')
          t.equal(device.uaOSVersion, '10.10', 'device.uaOSVersion is correct')
          t.equal(device.uaDeviceType, null, 'device.uaDeviceType is correct')
          // Disable the lastAccessTime property
          lastAccessTimeUpdates.enabled = false
          // Fetch all of the devices for the account
          return db.devices(ACCOUNT.uid)
        })
        .then(function(devices) {
          t.equal(devices.length, 1, 'devices array still contains one item')
          t.equal(devices[0].lastAccessTime, null, 'device.lastAccessTime should be null')
          // Reinstate the lastAccessTime property
          lastAccessTimeUpdates.enabled = true
          // Delete the device
          return db.deleteDevice(ACCOUNT.uid, deviceInfo.id)
            .catch(function () {
              t.fail('deleting a device should not have failed')
            })
        })
        .then(function () {
          // Fetch all of the devices for the account
          return db.devices(ACCOUNT.uid)
        })
        .then(function (devices) {
          t.equal(devices.length, 0, 'devices array is empty')
        })
    })
  }
)

test(
  'keyfetch token handling',
  function (t) {
    return dbConn.then(function(db) {
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
        t.deepEqual(keyFetchToken.uid, ACCOUNT.uid)
        tokenId = keyFetchToken.tokenId
      })
      .then(function() {
        return db.keyFetchToken(tokenId)
      })
      .then(function(keyFetchToken) {
        t.deepEqual(keyFetchToken.tokenId, tokenId, 'token id matches')
        t.deepEqual(keyFetchToken.uid, ACCOUNT.uid)
        t.equal(keyFetchToken.emailVerified, ACCOUNT.emailVerified)
        return keyFetchToken
      })
      .then(function(keyFetchToken) {
        return db.deleteKeyFetchToken(keyFetchToken)
      })
      .then(function() {
        return db.keyFetchToken(tokenId)
      })
      .then(function(keyFetchToken) {
        t.fail('The above keyFetchToken() call should fail, since the keyFetchToken has been deleted')
      }, function(err) {
        t.equal(err.errno, 110, 'keyFetchToken() fails with the correct error code')
        var msg = 'Error: Invalid authentication token in request signature'
        t.equal(msg, '' + err, 'keyFetchToken() fails with the correct message')
      })
    })
  }
)

test(
  'reset token handling',
  function (t) {
    return dbConn.then(function(db) {
      var tokenId
      return db.emailRecord(ACCOUNT.email)
      .then(function(emailRecord) {
        return db.forgotPasswordVerified(emailRecord)
      })
      .then(function(accountResetToken) {
        t.deepEqual(accountResetToken.uid, ACCOUNT.uid, 'account reset token uid should be the same as the account.uid')
        tokenId = accountResetToken.tokenId
      })
      .then(function() {
        return db.accountResetToken(tokenId)
      })
      .then(function(accountResetToken) {
        t.deepEqual(accountResetToken.tokenId, tokenId, 'token id matches')
        t.deepEqual(accountResetToken.uid, ACCOUNT.uid, 'account reset token uid should still be the same as the account.uid')
        return accountResetToken
      })
      .then(function(accountResetToken) {
        return db.deleteAccountResetToken(accountResetToken)
      })
      .then(function() {
        return db.accountResetToken(tokenId)
      })
      .then(function(accountResetToken) {
        t.fail('The above accountResetToken() call should fail, since the accountResetToken has been deleted')
      }, function(err) {
        t.equal(err.errno, 110, 'accountResetToken() fails with the correct error code')
        var msg = 'Error: Invalid authentication token in request signature'
        t.equal(msg, '' + err, 'accountResetToken() fails with the correct message')
      })
    })
  }
)

test(
  'forgotpwd token handling',
  function (t) {
    return dbConn.then(function(db) {
      var token1
      var token1tries = 0
      return db.emailRecord(ACCOUNT.email)
      .then(function(emailRecord) {
        return db.createPasswordForgotToken(emailRecord)
      })
      .then(function(passwordForgotToken) {
        t.deepEqual(passwordForgotToken.uid, ACCOUNT.uid, 'passwordForgotToken uid same as ACCOUNT.uid')
        token1 = passwordForgotToken
        token1tries = token1.tries
      })
      .then(function() {
        return db.passwordForgotToken(token1.tokenId)
      })
      .then(function(passwordForgotToken) {
        t.deepEqual(passwordForgotToken.tokenId, token1.tokenId, 'token id matches')
        t.deepEqual(passwordForgotToken.uid, token1.uid, 'tokens are identical')
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
        t.deepEqual(passwordForgotToken.tokenId, token1.tokenId, 'token id matches again')
        t.equal(passwordForgotToken.tries, token1tries - 1, '')
        return passwordForgotToken
      })
      .then(function(passwordForgotToken) {
        return db.deletePasswordForgotToken(passwordForgotToken)
      })
      .then(function() {
        return db.passwordForgotToken(token1.tokenId)
      })
      .then(function(passwordForgotToken) {
        t.fail('The above passwordForgotToken() call should fail, since the passwordForgotToken has been deleted')
      }, function(err) {
        t.equal(err.errno, 110, 'passwordForgotToken() fails with the correct error code')
        var msg = 'Error: Invalid authentication token in request signature'
        t.equal(msg, '' + err, 'passwordForgotToken() fails with the correct message')
      })
    })
  }
)

test(
  'email verification',
  function (t) {
    return dbConn.then(function(db) {
      return db.emailRecord(ACCOUNT.email)
      .then(function(emailRecord) {
        return db.verifyEmail(emailRecord)
      })
      .then(function() {
        return db.account(ACCOUNT.uid)
      })
      .then(function(account) {
        t.ok(account.emailVerified, 'account should now be emailVerified')
      })
    })
  }
)

test(
  'db.forgotPasswordVerified',
  function (t) {
    return dbConn.then(function(db) {
      var token1
      return db.emailRecord(ACCOUNT.email)
      .then(function(emailRecord) {
        return db.createPasswordForgotToken(emailRecord)
      })
      .then(function(passwordForgotToken) {
        return db.forgotPasswordVerified(passwordForgotToken)
      })
      .then(function(accountResetToken) {
        t.deepEqual(accountResetToken.uid, ACCOUNT.uid, 'uid is the same as ACCOUNT.uid')
        token1 = accountResetToken
      })
      .then(function() {
        return db.accountResetToken(token1.tokenId)
      })
      .then(function(accountResetToken) {
        t.deepEqual(accountResetToken.uid, ACCOUNT.uid)
        return db.deleteAccountResetToken(token1)
      })
    })
  }
)

test(
  'db.resetAccount',
  function (t) {
    return dbConn.then(function(db) {
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
        t.equal(exists, true, 'account should still exist')
      })
    })
  }
)

test(
  'db.securityEvent',
  function (t) {
    return dbConn.then(function(db) {
      return db.securityEvent({
        ipAddr: '127.0.0.1',
        name: 'account.create',
        uid: ACCOUNT.uid
      })
      .then(function(resp) {
        t.equal(typeof resp, 'object')
        t.equal(Object.keys(resp).length, 0)

        return db.securityEvent({
          ipAddr: '127.0.0.1',
          name: 'account.login',
          uid: ACCOUNT.uid
        })
      })
      .then(function(resp) {
        t.equal(typeof resp, 'object')
        t.equal(Object.keys(resp).length, 0)
      })
    })
  }
)

test(
  'db.securityEvents',
  function (t) {
    return dbConn.then(function(db) {
      return db.securityEvents({
        ipAddr: '127.0.0.1',
        uid: ACCOUNT.uid
      })
      .then(function (events) {
        t.equal(events.length, 2)
      })
    })
  }
)

test(
  'account deletion',
  function (t) {
    return dbConn.then(function(db) {
      return db.emailRecord(ACCOUNT.email)
      .then(function(emailRecord) {
        t.deepEqual(emailRecord.uid, ACCOUNT.uid, 'retrieving uid should be the same')
        return db.deleteAccount(emailRecord)
      })
      .then(function() {
        // account should no longer exist for this email address
        return db.accountExists(ACCOUNT.email)
      })
      .then(function(exists) {
        t.equal(exists, false, 'account should no longer exist')
      })
    })
  }
)

test(
  'teardown',
  function (t) {
    return dbConn.then(function(db) {
      return db.close()
    }).then(function() {
      return dbServer.stop()
    })
  }
)
