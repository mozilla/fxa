/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('ass')
var test = require('../ptaptest')
var uuid = require('uuid')
var crypto = require('crypto')
var log = { trace: console.log, info: console.log }

var config = require('../../config').getProperties()
var TestServer = require('../test_server')
var Token = require('../../lib/tokens')(log)
var DB = require('../../lib/db')(
  config.db.backend,
  log,
  Token.error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken
)

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
  wrapWrapKb: zeroBuffer32
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
        sessionToken.lastAccessTime -= 60 * 60 * 1000
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
        return db.updateSessionToken(sessionToken, 'Mozilla/5.0 (Android; Linux armv7l; rv:9.0) Gecko/20111216 Firefox/9.0 Fennec/9.0')
      })
      .then(function() {
        return db.sessions(ACCOUNT.uid)
      })
      .then(function(sessions) {
        t.equal(sessions.length, 1, 'sessions still contains one item')
        t.equal(sessions[0].uaBrowser, 'Firefox Mobile', 'uaBrowser property is correct')
        t.equal(sessions[0].uaBrowserVersion, '9', 'uaBrowserVersion property is correct')
        t.equal(sessions[0].uaOS, 'Android', 'uaOS property is correct')
        t.equal(sessions[0].uaOSVersion, null, 'uaOSVersion property is correct')
        t.equal(sessions[0].uaDeviceType, 'mobile', 'uaDeviceType property is correct')
        return db.sessionToken(tokenId)
      })
      .then(function(sessionToken) {
        t.equal(sessionToken.uaBrowser, 'Firefox Mobile')
        t.equal(sessionToken.uaBrowserVersion, '9')
        t.equal(sessionToken.uaOS, 'Android')
        t.equal(sessionToken.uaOSVersion, null)
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
    var sessionTokenId
    var deviceInfo = {
      id: crypto.randomBytes(16),
      name: '',
      type: 'mobile',
      pushCallback: 'https://foo/bar',
      pushPublicKey: crypto.randomBytes(32)
    }
    return dbConn.then(function (db) {
      return db.emailRecord(ACCOUNT.email)
        .then(function (emailRecord) {
          return db.createSessionToken(emailRecord, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:44.0) Gecko/20100101 Firefox/44.0')
        })
        .then(function (sessionToken) {
          sessionTokenId = sessionToken.tokenId
          return db.updateDevice(ACCOUNT.uid, sessionTokenId, deviceInfo)
            .then(function () {
              t.fail('updating a non-existent device should have failed')
            }, function (err) {
              t.pass('updating a non-existent device failed')
              t.equal(err.errno, 123, 'err.errno === 123')
            })
        })
        .then(function () {
          return db.deleteDevice(ACCOUNT.uid, deviceInfo.id)
            .then(function () {
              t.fail('deleting a non-existent device should have failed')
            }, function (err) {
              t.pass('deleting a non-existent device failed')
              t.equal(err.errno, 123, 'err.errno === 123')
            })
        })
        .then(function () {
          return db.devices(ACCOUNT.uid)
            .catch(function () {
              t.fail('getting devices should not have failed')
            })
        })
        .then(function (devices) {
          t.ok(Array.isArray(devices), 'devices is array')
          t.equal(devices.length, 0, 'devices array is empty')
          return db.createDevice(ACCOUNT.uid, sessionTokenId, deviceInfo)
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
          t.deepEqual(device.pushPublicKey, deviceInfo.pushPublicKey, 'device.pushPublicKey is correct')
          return db.createDevice(ACCOUNT.uid, sessionTokenId, deviceInfo)
            .then(function () {
              t.fail('adding a device with a duplicate session token should have failed')
            }, function (err) {
              t.pass('adding a device with a duplicate session token failed')
              t.equal(err.errno, 124, 'err.errno')
            })
        })
        .then(function () {
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
          t.deepEqual(device.pushPublicKey, deviceInfo.pushPublicKey, 'device.pushPublicKey is correct')
          deviceInfo.id = device.id
          deviceInfo.name = 'wibble'
          deviceInfo.type = 'desktop'
          deviceInfo.pushCallback = ''
          deviceInfo.pushPublicKey = ''
          return db.updateDevice(ACCOUNT.uid, sessionTokenId, deviceInfo)
            .catch(function (err) {
              t.fail('updating a new device should not have failed')
            })
        })
        .then(function (device) {
          return db.devices(ACCOUNT.uid)
        })
        .then(function (devices) {
          t.equal(devices.length, 1, 'devices array contains one item')
          return devices[0]
        })
        .then(function (device) {
          t.equal(device.name, deviceInfo.name, 'device.name is correct')
          t.equal(device.type, deviceInfo.type, 'device.type is correct')
          t.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
          t.deepEqual(device.pushPublicKey, zeroBuffer32, 'device.pushPublicKey is correct')
          return db.deleteDevice(ACCOUNT.uid, deviceInfo.id)
            .catch(function () {
              t.fail('deleting a device should not have failed')
            })
        })
        .then(function () {
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
        return db.createKeyFetchToken({uid: emailRecord.uid, kA: emailRecord.kA, wrapKb: ACCOUNT.wrapWrapKb})
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
        return db.createAccountResetToken(emailRecord)
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
        return db.createSessionToken(emailRecord, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:41.0) Gecko/20100101 Firefox/41.0')
      })
      .then(function(sessionToken) {
        return db.createAccountResetToken(sessionToken)
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
  'account lockout',
  function (t) {
    return dbConn.then(function(db) {
      return db.lockAccount(ACCOUNT)
      .then(function() {
        t.pass('lockAccount should succeed')
        return db.emailRecord(ACCOUNT.email)
      })
      .then(function(emailRecord) {
        t.ok(emailRecord.lockedAt, 'emailRecord should have a lockedAt date set')
        return db.unlockCode(ACCOUNT)
      })
      .then(function(unlockCode) {
        t.ok(unlockCode, 'unlockCode should be returned for a locked account')
        return db.unlockAccount(ACCOUNT)
      })
      .then(function() {
        t.pass('unlockAccount should succeed')
        return db.emailRecord(ACCOUNT.email)
      })
      .then(function(emailRecord) {
        t.equal(emailRecord.lockedAt, null, 'an unlocked account should have no lockedAt')
        return db.unlockCode(ACCOUNT)
      })
      .then(function () {
        t.fail('unlockCode on an unlocked account should fail')
      }, function (err) {
        t.equal(err.errno, 122, 'unlockCode on an unlocked account should fail with an account not locked error')

        return db.unlockAccount(ACCOUNT)
      })
      .then(function () {
        t.pass('unlockAccount on an unlocked account should succeed')
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
