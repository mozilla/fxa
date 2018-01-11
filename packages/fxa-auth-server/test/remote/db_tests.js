/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const base64url = require('base64url')
const config = require('../../config').getProperties()
const crypto = require('crypto')
const P = require('../../lib/promise')
const sinon = require('sinon')
const TestServer = require('../test_server')
const UnblockCode = require('../../lib/crypto/base32')(config.signinUnblock.codeLength)
const uuid = require('uuid')

const log = { trace () {}, info () {}, error () {} }

const lastAccessTimeUpdates = {
  enabled: true,
  sampleRate: 1
}
const Token = require('../../lib/tokens')(log, {
  lastAccessTimeUpdates: lastAccessTimeUpdates,
  tokenLifetimes: {
    sessionTokenWithoutDevice: 2419200000
  }
})

const DB = require('../../lib/db')({
  lastAccessTimeUpdates,
  signinCodeSize: config.signinCodeSize,
  redis: Object.assign({}, config.redis, { enabled: true }),
  tokenLifetimes: {}
}, log, Token, UnblockCode)

const redis = require('redis').createClient({
  host: config.redis.host,
  port: config.redis.port,
  prefix: config.redis.sessionsKeyPrefix,
  enable_offline_queue: false
})

const zeroBuffer16 = Buffer('00000000000000000000000000000000', 'hex').toString('hex')
const zeroBuffer32 = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex').toString('hex')

let account, secondEmail

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
      })
  })

  beforeEach(() => {
    account = {
      uid: uuid.v4('binary').toString('hex'),
      email: dbServer.uniqueEmail(),
      emailCode: zeroBuffer16,
      emailVerified: false,
      verifierVersion: 1,
      verifyHash: zeroBuffer32,
      authSalt: zeroBuffer32,
      kA: zeroBuffer32,
      wrapWrapKb: zeroBuffer32,
      tokenVerificationId: zeroBuffer16
    }

    return db.createAccount(account)
      .then((account) => {
        assert.deepEqual(account.uid, account.uid, 'account.uid is the same as the input account.uid')

        secondEmail = dbServer.uniqueEmail()
        const emailData = {
          email: secondEmail,
          emailCode: crypto.randomBytes(16).toString('hex'),
          normalizedEmail: secondEmail.toLowerCase(),
          isVerified: true,
          isPrimary: false,
          uid: account.uid
        }
        return db.createEmail(account.uid, emailData)
      })
      // Ensure redis is empty for the uid
      .then(() => redis.delAsync(account.uid))
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
      return db.accountExists(account.email)
        .then(function(exists) {
          assert.ok(exists, 'account exists for this email address')
        })
        .then(function() {
          return db.account(account.uid)
        })
        .then(function(account) {
          assert.deepEqual(account.uid, account.uid, 'uid')
          assert.equal(account.email, account.email, 'email')
          assert.deepEqual(account.emailCode, account.emailCode, 'emailCode')
          assert.equal(account.emailVerified, account.emailVerified, 'emailVerified')
          assert.deepEqual(account.kA, account.kA, 'kA')
          assert.deepEqual(account.wrapWrapKb, account.wrapWrapKb, 'wrapWrapKb')
          assert(! account.verifyHash, 'verifyHash')
          assert.deepEqual(account.authSalt, account.authSalt, 'authSalt')
          assert.equal(account.verifierVersion, account.verifierVersion, 'verifierVersion')
          assert.ok(account.createdAt, 'createdAt')
        })
    }
  )

  it(
    'session token handling',
    () => {
      let tokenId

      // Fetch all sessions for the account
      return db.sessions(account.uid)
        .then(sessions => {
          assert.ok(Array.isArray(sessions), 'sessions is array')
          assert.equal(sessions.length, 0, 'sessions is empty')

          // Fetch the email record
          return db.emailRecord(account.email)
        })
        .then(emailRecord => {
          emailRecord.createdAt = Date.now() - 1000
          emailRecord.tokenVerificationId = account.tokenVerificationId
          emailRecord.uaBrowser = 'Firefox'
          emailRecord.uaBrowserVersion = '41'
          emailRecord.uaOS = 'Mac OS X'
          emailRecord.uaOSVersion = '10.10'
          emailRecord.uaDeviceType = emailRecord.uaFormFactor = null

          // Create a session token
          return db.createSessionToken(emailRecord)
        })
        .then(sessionToken => {
          assert.deepEqual(sessionToken.uid, account.uid)
          tokenId = sessionToken.id

          // Fetch all sessions for the account
          return db.sessions(account.uid)
        })
        .then(sessions => {
          assert.equal(sessions.length, 1, 'sessions contains one item')
          assert.equal(Object.keys(sessions[0]).length, 18, 'session has correct number of properties')
          assert.equal(typeof sessions[0].id, 'string', 'id property is not a buffer')
          assert.equal(sessions[0].uid, account.uid, 'uid property is correct')
          assert.ok(sessions[0].createdAt >= account.createdAt, 'createdAt property seems correct')
          assert.equal(sessions[0].uaBrowser, 'Firefox', 'uaBrowser property is correct')
          assert.equal(sessions[0].uaBrowserVersion, '41', 'uaBrowserVersion property is correct')
          assert.equal(sessions[0].uaOS, 'Mac OS X', 'uaOS property is correct')
          assert.equal(sessions[0].uaOSVersion, '10.10', 'uaOSVersion property is correct')
          assert.equal(sessions[0].uaDeviceType, null, 'uaDeviceType property is correct')
          assert.equal(sessions[0].uaFormFactor, null, 'uaFormFactor property is correct')
          assert.equal(sessions[0].lastAccessTime, sessions[0].createdAt, 'lastAccessTime property is correct')
          assert.equal(sessions[0].location, undefined, 'location property is correct')

          // Fetch the session token
          return db.sessionToken(tokenId)
        })
        .then(sessionToken => {
          assert.equal(sessionToken.id, tokenId, 'token id matches')
          assert.equal(sessionToken.uaBrowser, 'Firefox')
          assert.equal(sessionToken.uaBrowserVersion, '41')
          assert.equal(sessionToken.uaOS, 'Mac OS X')
          assert.equal(sessionToken.uaOSVersion, '10.10')
          assert.equal(sessionToken.uaDeviceType, null)
          assert.equal(sessionToken.lastAccessTime, sessionToken.createdAt)
          assert.equal(sessionToken.uid, account.uid)
          assert.equal(sessionToken.email, account.email)
          assert.equal(sessionToken.emailCode, account.emailCode)
          assert.equal(sessionToken.emailVerified, account.emailVerified)
          assert.equal(sessionToken.lifetime < Infinity, true)

          // Disable session token updates
          lastAccessTimeUpdates.enabled = false

          // Attempt to update the session token
          return db.updateSessionToken(sessionToken, P.resolve({}))
        })
        .then(result => {
          assert.equal(result, undefined)

          // Fetch all sessions for the account
          return db.sessions(account.uid)
        })
        .then(sessions => {
          assert.equal(sessions.length, 1, 'sessions contains one item')
          assert.equal(Object.keys(sessions[0]).length, 18, 'session has correct number of properties')
          assert.equal(sessions[0].uid, account.uid, 'uid property is correct')
          assert.equal(sessions[0].lastAccessTime, undefined, 'lastAccessTime not reported if disabled')
          assert.equal(sessions[0].location, undefined, 'location property is correct')

          // Re-enable session token updates
          lastAccessTimeUpdates.enabled = true

          // Fetch the session token
          return db.sessionToken(tokenId)
        })
        .then(sessionToken => {
          // Update the session token
          return db.updateSessionToken(Object.assign({}, sessionToken, {
            lastAccessTime: Date.now()
          }), P.resolve({
            location: {
              city: 'Bournemouth',
              country: 'United Kingdom',
              countryCode: 'GB',
              state: 'England',
              stateCode: 'EN'
            },
            timeZone: 'Europe/London'
          }))
        })
        .then(() => {
          // Fetch all sessions for the account
          return db.sessions(account.uid)
        })
        .then(sessions => {
          assert.equal(sessions.length, 1, 'sessions contains one item')
          assert.equal(sessions[0].uid, account.uid, 'uid property is correct')
          assert.ok(sessions[0].lastAccessTime > sessions[0].createdAt, 'lastAccessTime is correct')
          assert.equal(sessions[0].location.city, 'Bournemouth', 'city is correct')
          assert.equal(sessions[0].location.country, 'United Kingdom', 'country is correct')
          assert.equal(sessions[0].location.countryCode, 'GB', 'countryCode is correct')
          assert.equal(sessions[0].location.state, 'England', 'state is correct')
          assert.equal(sessions[0].location.stateCode, 'EN', 'stateCode is correct')
          assert.equal(sessions[0].location.timeZone, undefined, 'timeZone is not set')

          // Fetch the session token
          return db.sessionToken(tokenId)
        })
        .then(sessionToken => {
          // Update the session token
          return db.updateSessionToken(Object.assign({}, sessionToken, {
            uaBrowser: 'Firefox Mobile',
            uaBrowserVersion: '42',
            uaOS: 'Android',
            uaOSVersion: '4.4',
            uaDeviceType: 'mobile',
            uaFormFactor: null
          }), P.reject())
        })
        .then(tokens => {
          // Fetch all sessions for the account
          return db.sessions(account.uid)
        })
        .then(sessions => {
          assert.equal(sessions.length, 1, 'sessions still contains one item')
          assert.equal(sessions[0].uaBrowser, 'Firefox Mobile', 'uaBrowser property is correct')
          assert.equal(sessions[0].uaBrowserVersion, '42', 'uaBrowserVersion property is correct')
          assert.equal(sessions[0].uaOS, 'Android', 'uaOS property is correct')
          assert.equal(sessions[0].uaOSVersion, '4.4', 'uaOSVersion property is correct')
          assert.equal(sessions[0].uaDeviceType, 'mobile', 'uaDeviceType property is correct')
          assert.equal(sessions[0].uaFormFactor, null, 'uaFormFactor property is correct')
          assert.equal(sessions[0].location, null, 'location property is correct')
        })
        .then(() => {
          // Fetch the session token
          return db.sessionToken(tokenId)
        })
        .then(sessionToken => {
          // this returns previously stored data since sessionToken doesnt read from cache
          assert.equal(sessionToken.uaBrowser, 'Firefox')
          assert.equal(sessionToken.uaBrowserVersion, '41')
          assert.equal(sessionToken.uaOS, 'Mac OS X')
          assert.equal(sessionToken.uaOSVersion, '10.10')
          assert.equal(sessionToken.lastAccessTime, sessionToken.createdAt)

          // Delete the session token
          return db.deleteSessionToken(sessionToken)
        })
        .then(() => {
          // Fetch all sessions for the account
          return db.sessions(account.uid)
        })
        .then(sessions => {
          assert.equal(sessions.length, 0, 'sessions is empty')

          // Attempt to delete the deleted session token
          return db.sessionToken(tokenId)
            .then(sessionToken => {
              assert(false, 'db.sessionToken should have failed')
            }, err => {
              assert.equal(err.errno, 110, 'sessionToken() fails with the correct error code')
              var msg = 'Error: The authentication token could not be found'
              assert.equal(msg, '' + err, 'sessionToken() fails with the correct message')
            })
        })
        .then(() => {
          // Fetch the email record again
          return db.emailRecord(account.email)
        })
        .then(emailRecord => {
          emailRecord.createdAt = Date.now() - 1000
          emailRecord.tokenVerificationId = account.tokenVerificationId
          emailRecord.uaBrowser = 'Firefox'
          emailRecord.uaBrowserVersion = '41'
          emailRecord.uaOS = 'Mac OS X'
          emailRecord.uaOSVersion = '10.10'
          emailRecord.uaDeviceType = emailRecord.uaFormFactor = null

          // Create a session token with the same data as the deleted token
          return db.createSessionToken(emailRecord)
        })
        .then(() => {
          // Fetch all sessions for the account
          return db.sessions(account.uid)
        })
        .then(sessions => {
          // Make sure that the data got deleted from redis too
          assert.equal(sessions.length, 1, 'sessions contains one item')
          assert.equal(sessions[0].lastAccessTime, sessions[0].createdAt, 'lastAccessTime property is correct')
          assert.equal(sessions[0].location, undefined, 'location property is correct')

          // Delete the session token again
          return db.deleteSessionToken(sessions[0])
        })
        .then(() => redis.getAsync(account.uid))
        .then(result => assert.equal(result, null, 'redis was cleared'))
    }
  )

  it(
    'device registration',
    () => {
      let sessionToken, anotherSessionToken
      const deviceInfo = {
        id: crypto.randomBytes(16).toString('hex'),
        name: '',
        type: 'mobile',
        pushCallback: 'https://foo/bar',
        pushPublicKey: base64url(Buffer.concat([Buffer.from('\x04'), crypto.randomBytes(64)])),
        pushAuthKey: base64url(crypto.randomBytes(16))
      }
      const conflictingDeviceInfo = {
        id: crypto.randomBytes(16).toString('hex'),
        name: 'wibble'
      }

      return db.emailRecord(account.email)
        .then((emailRecord) => {
          emailRecord.tokenVerificationId = account.tokenVerificationId
          emailRecord.uaBrowser = 'Firefox Mobile'
          emailRecord.uaBrowserVersion = '41'
          emailRecord.uaOS = 'Android'
          emailRecord.uaOSVersion = '4.4'
          emailRecord.uaDeviceType = 'mobile'
          emailRecord.uaFormFactor = null

          // Create a session token
          return db.createSessionToken(emailRecord)
        })
        .then((result) => {
          sessionToken = result
          // Attempt to update a non-existent device
          return db.updateDevice(account.uid, sessionToken.id, deviceInfo)
            .then(() => {
              assert(false, 'updating a non-existent device should have failed')
            }, (err) => {
              assert.equal(err.errno, 123, 'err.errno === 123')
            })
        })
        .then(() => {
          // Attempt to delete a non-existent device
          return db.deleteDevice(account.uid, deviceInfo.id)
            .then(function () {
              assert(false, 'deleting a non-existent device should have failed')
            }, function (err) {
              assert.equal(err.errno, 123, 'err.errno === 123')
            })
        })
        .then(() => {
          // Fetch all of the devices for the account
          return db.devices(account.uid)
            .catch(function () {
              assert(false, 'getting devices should not have failed')
            })
        })
        .then((devices) => {
          assert.ok(Array.isArray(devices), 'devices is array')
          assert.equal(devices.length, 0, 'devices array is empty')
          // Create a device
          return db.createDevice(account.uid, sessionToken.id, deviceInfo)
            .catch((err) => {
              assert(false, 'adding a new device should not have failed')
            })
        })
        .then((device) => {
          assert.ok(device.id, 'device.id is set')
          assert.ok(device.createdAt > 0, 'device.createdAt is set')
          assert.equal(device.name, deviceInfo.name, 'device.name is correct')
          assert.equal(device.type, deviceInfo.type, 'device.type is correct')
          assert.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
          assert.equal(device.pushPublicKey, deviceInfo.pushPublicKey, 'device.pushPublicKey is correct')
          assert.equal(device.pushAuthKey, deviceInfo.pushAuthKey, 'device.pushAuthKey is correct')
          assert.equal(device.pushEndpointExpired, false, 'device.pushEndpointExpired is correct')
          // Fetch the session token
          return db.sessionToken(sessionToken.id)
        })
        .then(sessionToken => {
          assert.equal(sessionToken.lifetime, Infinity)
          // Attempt to create a device with a duplicate session token
          return db.createDevice(account.uid, sessionToken.id, conflictingDeviceInfo)
            .then(() => {
              assert(false, 'adding a device with a duplicate session token should have failed')
            }, (err) => {
              assert.equal(err.errno, 124, 'err.errno')
              assert.equal(err.output.payload.deviceId, deviceInfo.id)
            })
        })
        .then(() => {
          // Fetch all of the devices for the account
          return db.devices(account.uid)
        })
        .then((devices) => {
          assert.equal(devices.length, 1, 'devices array contains one item')
          return devices[0]
        })
        .then((device) => {
          assert.ok(device.id, 'device.id is set')
          assert.ok(device.lastAccessTime > 0, 'device.lastAccessTime is set')
          assert.equal(device.name, deviceInfo.name, 'device.name is correct')
          assert.equal(device.type, deviceInfo.type, 'device.type is correct')
          assert.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
          assert.equal(device.pushPublicKey, deviceInfo.pushPublicKey, 'device.pushPublicKey is correct')
          assert.equal(device.pushAuthKey, deviceInfo.pushAuthKey, 'device.pushAuthKey is correct')
          assert.equal(device.pushEndpointExpired, false, 'device.pushEndpointExpired is correct')
          assert.equal(device.uaBrowser, 'Firefox Mobile', 'device.uaBrowser is correct')
          assert.equal(device.uaBrowserVersion, '41', 'device.uaBrowserVersion is correct')
          assert.equal(device.uaOS, 'Android', 'device.uaOS is correct')
          assert.equal(device.uaOSVersion, '4.4', 'device.uaOSVersion is correct')
          assert.equal(device.uaDeviceType, 'mobile', 'device.uaDeviceType is correct')
          assert.equal(device.uaFormFactor, null, 'device.uaFormFactor is correct')
          assert.equal(device.location, undefined, 'device.location was not set')
          deviceInfo.id = device.id
          deviceInfo.name = 'wibble'
          deviceInfo.type = 'desktop'
          deviceInfo.pushCallback = ''
          deviceInfo.pushPublicKey = ''
          deviceInfo.pushAuthKey = ''
          sessionToken.lastAccessTime = 42
          sessionToken.uaBrowser = 'Firefox'
          sessionToken.uaBrowserVersion = '44'
          sessionToken.uaOS = 'Mac OS X'
          sessionToken.uaOSVersion = '10.10'
          sessionToken.uaDeviceType = sessionToken.uaFormFactor = null
          // Update the device and the session token
          return P.all([
            db.updateDevice(account.uid, sessionToken.id, deviceInfo),
            db.updateSessionToken(sessionToken, P.resolve({
              location: {
                city: 'Mountain View',
                country: 'United States',
                countryCode: 'US',
                state: 'California',
                stateCode: 'CA'
              },
              timeZone: 'America/Los_Angeles'
            }))
          ])
        })
        .then(results => {
          // Create another session token
          return db.createSessionToken(sessionToken)
        })
        .then(result => {
          anotherSessionToken = result
          // Create another device
          return db.createDevice(account.uid, anotherSessionToken.id, conflictingDeviceInfo)
        })
        .then(() => {
          // Attempt to update a device with a duplicate session token
          return db.updateDevice(account.uid, anotherSessionToken.id, deviceInfo)
            .then(() => {
              assert(false, 'updating a device with a duplicate session token should have failed')
            }, (err) => {
              assert.equal(err.errno, 124, 'err.errno')
              assert.equal(err.output.payload.deviceId, conflictingDeviceInfo.id)
            })
        })
        .then(() => {
          // Fetch all of the devices for the account
          return db.devices(account.uid)
        })
        .then((devices) => {
          assert.equal(devices.length, 2, 'devices array contains two items')

          if (devices[0].id === deviceInfo.id) {
            return devices[0]
          }

          return devices[1]
        })
        .then((device) => {
          assert.equal(device.lastAccessTime, 42, 'device.lastAccessTime is correct')
          assert.equal(device.name, deviceInfo.name, 'device.name is correct')
          assert.equal(device.type, deviceInfo.type, 'device.type is correct')
          assert.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
          assert.equal(device.pushPublicKey, '', 'device.pushPublicKey is correct')
          assert.equal(device.pushAuthKey, '', 'device.pushAuthKey is correct')
          assert.equal(device.pushEndpointExpired, false, 'device.pushEndpointExpired is correct')
          assert.equal(device.uaBrowser, 'Firefox', 'device.uaBrowser is correct')
          assert.equal(device.uaBrowserVersion, '44', 'device.uaBrowserVersion is correct')
          assert.equal(device.uaOS, 'Mac OS X', 'device.uaOS is correct')
          assert.equal(device.uaOSVersion, '10.10', 'device.uaOSVersion is correct')
          assert.equal(device.uaDeviceType, null, 'device.uaDeviceType is correct')
          assert.equal(device.uaFormFactor, null, 'device.uaFormFactor is correct')
          assert.equal(device.location.city, 'Mountain View', 'device.location.city is correct')
          assert.equal(device.location.country, 'United States', 'device.location.country is correct')
          assert.equal(device.location.countryCode, 'US', 'device.location.countryCode is correct')
          assert.equal(device.location.state, 'California', 'device.location.state is correct')
          assert.equal(device.location.stateCode, 'CA', 'device.location.stateCode is correct')

          // Disable session token updates
          lastAccessTimeUpdates.enabled = false
          return db.devices(account.uid)
        })
        .then((devices) => {
          assert.equal(devices.length, 2, 'devices array contains two items')
          assert.equal(devices[0].lastAccessTime, undefined, 'lastAccessTime is not set when feature is disabled')
          assert.equal(devices[1].lastAccessTime, undefined, 'lastAccessTime is not set when feature is disabled')

          // Re-enable session token updates
          lastAccessTimeUpdates.enabled = true

          // Delete the devices
          return P.all([
            db.deleteDevice(account.uid, deviceInfo.id),
            db.deleteDevice(account.uid, conflictingDeviceInfo.id)
          ])
        })
        .then(function () {
          // Fetch all of the devices for the account
          return db.devices(account.uid)
        })
        .then(function (devices) {
          assert.equal(devices.length, 0, 'devices array is empty')

          // Delete the account
          return db.deleteAccount(account)
        })
        .then(() => redis.getAsync(account.uid))
        .then(result => assert.equal(result, null, 'redis was cleared'))
    }
  )

  it(
    'keyfetch token handling',
    () => {
      var tokenId
      return db.emailRecord(account.email)
        .then(function(emailRecord) {
          return db.createKeyFetchToken({
            uid: emailRecord.uid,
            kA: emailRecord.kA,
            wrapKb: account.wrapWrapKb
          })
        })
        .then(function(keyFetchToken) {
          assert.deepEqual(keyFetchToken.uid, account.uid)
          tokenId = keyFetchToken.id
        })
        .then(function() {
          return db.keyFetchToken(tokenId)
        })
        .then(function(keyFetchToken) {
          assert.deepEqual(keyFetchToken.id, tokenId, 'token id matches')
          assert.deepEqual(keyFetchToken.uid, account.uid)
          assert.equal(keyFetchToken.emailVerified, account.emailVerified)
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
      return db.emailRecord(account.email)
        .then(function(emailRecord) {
          return db.createPasswordForgotToken(emailRecord)
        })
        .then(function(passwordForgotToken) {
          return db.forgotPasswordVerified(passwordForgotToken)
            .then(accountResetToken => {
              assert.ok(accountResetToken.createdAt > passwordForgotToken.createdAt, 'account reset token should be newer than password forgot token')
              return accountResetToken
            })
        })
        .then(function(accountResetToken) {
          assert.deepEqual(accountResetToken.uid, account.uid, 'account reset token uid should be the same as the account.uid')
          tokenId = accountResetToken.id
        })
        .then(function() {
          return db.accountResetToken(tokenId)
        })
        .then(function(accountResetToken) {
          assert.deepEqual(accountResetToken.id, tokenId, 'token id matches')
          assert.deepEqual(accountResetToken.uid, account.uid, 'account reset token uid should still be the same as the account.uid')
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
      return db.emailRecord(account.email)
        .then(function(emailRecord) {
          return db.createPasswordForgotToken(emailRecord)
        })
        .then(function(passwordForgotToken) {
          assert.deepEqual(passwordForgotToken.uid, account.uid, 'passwordForgotToken uid same as account.uid')
          token1 = passwordForgotToken
          token1tries = token1.tries
        })
        .then(function() {
          return db.passwordForgotToken(token1.id)
        })
        .then(function(passwordForgotToken) {
          assert.deepEqual(passwordForgotToken.id, token1.id, 'token id matches')
          assert.deepEqual(passwordForgotToken.uid, token1.uid, 'tokens are identical')
          return passwordForgotToken
        })
        .then(function(passwordForgotToken) {
          passwordForgotToken.tries -= 1
          return db.updatePasswordForgotToken(passwordForgotToken)
        })
        .then(function() {
          return db.passwordForgotToken(token1.id)
        })
        .then(function(passwordForgotToken) {
          assert.deepEqual(passwordForgotToken.id, token1.id, 'token id matches again')
          assert.equal(passwordForgotToken.tries, token1tries - 1, '')
          return passwordForgotToken
        })
        .then(function(passwordForgotToken) {
          return db.deletePasswordForgotToken(passwordForgotToken)
        })
        .then(function() {
          return db.passwordForgotToken(token1.id)
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
      return db.emailRecord(account.email)
        .then(function(emailRecord) {
          return db.verifyEmail(emailRecord, emailRecord.emailCode)
        })
        .then(function() {
          return db.account(account.uid)
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
      return db.emailRecord(account.email)
        .then(function(emailRecord) {
          return db.createPasswordForgotToken(emailRecord)
        })
        .then(function(passwordForgotToken) {
          return db.forgotPasswordVerified(passwordForgotToken)
        })
        .then(function(accountResetToken) {
          assert.deepEqual(accountResetToken.uid, account.uid, 'uid is the same as account.uid')
          token1 = accountResetToken
        })
        .then(function() {
          return db.accountResetToken(token1.id)
        })
        .then(function(accountResetToken) {
          assert.deepEqual(accountResetToken.uid, account.uid)
          return db.deleteAccountResetToken(token1)
        })
    }
  )

  it(
    'db.resetAccount',
    () => {
      return db.emailRecord(account.email)
        .then(function(emailRecord) {
          emailRecord.tokenVerificationId = account.tokenVerificationId
          emailRecord.uaBrowser = 'Firefox'
          emailRecord.uaBrowserVersion = '41'
          emailRecord.uaOS = 'Mac OS X'
          emailRecord.uaOSVersion = '10.10'
          emailRecord.uaDeviceType = emailRecord.uaFormFactor = null
          return db.createSessionToken(emailRecord)
        })
        .then(function(sessionToken) {
          return db.forgotPasswordVerified(sessionToken)
        })
        .then(function(accountResetToken) {
          return db.resetAccount(accountResetToken, account)
        })
        .then(() => {
          return redis.getAsync(account.uid)
        })
        .then(result => {
          assert.equal(result, null, 'redis was cleared')
          // account should STILL exist for this email address
          return db.accountExists(account.email)
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
        uid: account.uid
      })
      .then(function(resp) {
        assert.equal(typeof resp, 'object')
        assert.equal(Object.keys(resp).length, 0)

        return db.securityEvent({
          ipAddr: '127.0.0.1',
          name: 'account.login',
          uid: account.uid
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
      return db.securityEvent({
        ipAddr: '127.0.0.1',
        name: 'account.create',
        uid: account.uid
      })
      .then(() => {
        return db.securityEvents({
          ipAddr: '127.0.0.1',
          uid: account.uid
        })
      })
      .then(function (events) {
        assert.equal(events.length, 1)
      })
    }
  )

  it(
    'unblock code',
    () => {
      var unblockCode
      return db.createUnblockCode(account.uid)
        .then(function(_unblockCode) {
          assert.ok(_unblockCode)
          unblockCode = _unblockCode

          return db.consumeUnblockCode(account.uid, 'NOTREAL')
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
            return db.consumeUnblockCode(account.uid, unblockCode)
          }
        )
        .then(
          function() {
            // re-use unblock code, no longer valid
            return db.consumeUnblockCode(account.uid, unblockCode)
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

  it('signinCodes', () => {
    let previousCode
    const flowId = crypto.randomBytes(32).toString('hex')

    // Create a signinCode without a flowId
    return db.createSigninCode(account.uid)
      .then(code => {
        assert.equal(typeof code, 'string', 'db.createSigninCode should return a string')
        assert.equal(Buffer.from(code, 'hex').length, config.signinCodeSize, 'db.createSigninCode should return the correct size code')

        previousCode = code

        // Stub crypto.randomBytes to return a duplicate code
        sinon.stub(crypto, 'randomBytes', (size, callback) => {
          // Reinstate the real crypto.randomBytes after we've returned a duplicate
          crypto.randomBytes.restore()

          if (! callback) {
            return previousCode
          }

          callback(null, previousCode)
        })

        // Create a signinCode with crypto.randomBytes rigged to return a duplicate,
        // and this time specifying a flowId
        return db.createSigninCode(account.uid, flowId)
      })
      .then(code => {
        assert.equal(typeof code, 'string', 'db.createSigninCode should return a string')
        assert.notEqual(code, previousCode, 'db.createSigninCode should not return a duplicate code')
        assert.equal(Buffer.from(code, 'hex').length, config.signinCodeSize, 'db.createSigninCode should return the correct size code')

        // Consume both signinCodes
        return P.all([
          db.consumeSigninCode(previousCode),
          db.consumeSigninCode(code)
        ])
      })
      .then(results => {
        assert.equal(results[0].email, account.email, 'db.consumeSigninCode should return the email address')
        assert.equal(results[1].email, account.email, 'db.consumeSigninCode should return the email address')
        if (results[1].flowId) {
          // This assertion is conditional so that tests pass regardless of db version
          assert.equal(results[1].flowId, flowId, 'db.consumeSigninCode should return the flowId')
        }

        // Attempt to consume a consumed signinCode
        return db.consumeSigninCode(previousCode)
          .then(() => assert.fail('db.consumeSigninCode should have failed'))
          .catch(err => {
            assert.equal(err.errno, 146, 'db.consumeSigninCode should fail with errno 146')
            assert.equal(err.message, 'Invalid signin code', 'db.consumeSigninCode should fail with message "Invalid signin code"')
            assert.equal(err.output.statusCode, 400, 'db.consumeSigninCode should fail with status 400')
          })
      })
  })

  it(
    'account deletion',
    () => {
      return db.emailRecord(account.email)
        .then(function(emailRecord) {
          assert.deepEqual(emailRecord.uid, account.uid, 'retrieving uid should be the same')
          return db.deleteAccount(emailRecord)
        })
        .then(() => {
          return redis.getAsync(account.uid)
        })
        .then(result => {
          assert.equal(result, null, 'redis was cleared')
          // account should no longer exist for this email address
          return db.accountExists(account.email)
        })
        .then(function(exists) {
          assert.equal(exists, false, 'account should no longer exist')
        })
    }
  )

  describe('account record', () => {
    it('can retrieve account from account email', () => {
      return P.all([db.emailRecord(account.email), db.accountRecord(account.email)])
        .spread(function (emailRecord, accountRecord) {
          assert.equal(emailRecord.email, accountRecord.email, 'original account and email records should be equal')
          assert.deepEqual(emailRecord.emails, accountRecord.emails, 'emails should be equal')
          assert.deepEqual(emailRecord.primaryEmail, accountRecord.primaryEmail, 'primary emails should be equal')
        })
    })

    it('can retrieve account from secondary email', () => {
      return P.all([db.accountRecord(account.email), db.accountRecord(secondEmail)])
        .spread(function (accountRecord, accountRecordFromSecondEmail) {
          assert.equal(accountRecordFromSecondEmail.email, accountRecord.email, 'original account and email records should be equal')
          assert.deepEqual(accountRecordFromSecondEmail.emails, accountRecord.emails, 'emails should be equal')
          assert.deepEqual(accountRecordFromSecondEmail.primaryEmail, accountRecord.primaryEmail, 'primary emails should be equal')
        })
    })

    it('returns unknown account', () => {
      return db.accountRecord('idontexist@email.com')
        .then(function () {
          assert.fail('should not have retrieved non-existent account')
        })
        .catch((err) => {
          assert.equal(err.errno, 102, 'unknown account error code')
        })
    })
  })

  describe('set primary email', () => {
    it('can set primary email address', () => {
      return db.setPrimaryEmail(account.uid, secondEmail)
        .then(function (res) {
          assert.ok(res, 'ok response')
          return db.accountRecord(secondEmail)
        })
        .then(function (accountRecord) {
          assert.equal(accountRecord.primaryEmail.email, secondEmail, 'primary email set')
        })
    })
  })

  after(() => {
    return TestServer.stop(dbServer)
      .then(() => {
        return db && db.close()
      })
  })
})
