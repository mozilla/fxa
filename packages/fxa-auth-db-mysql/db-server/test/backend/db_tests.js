/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict'

const assert = require('insist')
const crypto = require('crypto')
const base64url = require('base64url')
const P = require('bluebird')

const zeroBuffer16 = Buffer.from('00000000000000000000000000000000', 'hex')
const zeroBuffer32 = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
const now = Date.now()

function newUuid() {
  return crypto.randomBytes(16)
}

function unblockCode() {
  return crypto.randomBytes(4).toString('hex')
}

function createAccount() {
  const account = {
    uid: newUuid(),
    email: ('' + Math.random()).substr(2) + '@bar.com',
    emailCode: zeroBuffer16,
    emailVerified: false,
    verifierVersion: 1,
    verifyHash: zeroBuffer32,
    authSalt: zeroBuffer32,
    kA: zeroBuffer32,
    wrapWrapKb: zeroBuffer32,
    verifierSetAt: now,
    createdAt: now,
    locale : 'en_US',
  }
  account.normalizedEmail = account.email.toLowerCase()
  return account
}

function createEmail(data) {
  const email = {
    email: ('' + Math.random()).substr(2) + '@bar.com',
    uid: data.uid,
    emailCode: data.emailCode || crypto.randomBytes(16),
    isVerified: data.isVerified || false,
    isPrimary: false,
    createdAt: Date.now()
  }
  email.email = data.email || email.email
  email.normalizedEmail = email.email.toLowerCase()

  return email
}


const ACCOUNT = createAccount()

function hex(len) {
  return Buffer(crypto.randomBytes(len).toString('hex'), 'hex')
}
function hex6() { return hex(6) }
function hex16() { return hex(16) }
function hex32() { return hex(32) }
// function hex64() { return hex(64) }
function hex96() { return hex(96) }

function base64(len) {
  return base64url(crypto.randomBytes(len))
}

function base64_16() { return base64(16) }
function base64_65() { return base64(65) }

const SESSION_TOKEN_ID = hex32()
const SESSION_TOKEN = {
  data : hex32(),
  uid : ACCOUNT.uid,
  createdAt : now + 1,
  uaBrowser : 'mock browser',
  uaBrowserVersion : 'mock browser version',
  uaOS : 'mock OS',
  uaOSVersion : 'mock OS version',
  uaDeviceType : 'mock device type',
  uaFormFactor : 'mock form factor',
  mustVerify: true,
  tokenVerificationId : hex16()
}

const KEY_FETCH_TOKEN_ID = hex32()
const KEY_FETCH_TOKEN = {
  authKey : hex32(),
  uid : ACCOUNT.uid,
  keyBundle : hex96(),
  createdAt : now + 2,
  tokenVerificationId : hex16()
}

const PASSWORD_FORGOT_TOKEN_ID = hex32()
const PASSWORD_FORGOT_TOKEN = {
  data : hex32(),
  uid : ACCOUNT.uid,
  passCode : hex16(),
  tries : 1,
  createdAt: now + 3
}

const PASSWORD_CHANGE_TOKEN_ID = hex32()
const PASSWORD_CHANGE_TOKEN = {
  data : hex32(),
  uid : ACCOUNT.uid,
  createdAt: now + 4
}

const ACCOUNT_RESET_TOKEN_ID = hex32()
const ACCOUNT_RESET_TOKEN = {
  tokenId : ACCOUNT_RESET_TOKEN_ID,
  data : hex32(),
  uid : ACCOUNT.uid,
  createdAt: now + 5
}

function makeMockSessionToken(uid) {
  var sessionToken = {
    data : hex32(),
    uid : uid,
    createdAt : now + 1,
    uaBrowser : 'mock browser',
    uaBrowserVersion : 'mock browser version',
    uaOS : 'mock OS',
    uaOSVersion : 'mock OS version',
    uaDeviceType : 'mock device type',
    mustVerify: true,
    tokenVerificationId : hex16(),
    tokenVerificationCode: unblockCode(),
    tokenVerificationCodeExpiresAt: Date.now() + 20000
  }

  return sessionToken
}

// To run these tests from a new backend, pass the config and an already created
// DB API for them to be run against.
module.exports = function(config, DB) {
  describe('db_tests', () => {

    let db
    before(() => {
      return DB.connect(config).then(db_ => {
        db = db_
        return db.ping()
      })
    })

    it(
      'account creation and password checking',
      () => {
        var emailBuffer = Buffer(ACCOUNT.email)
        return db.accountExists(emailBuffer)
        .then(function(exists) {
          assert(false, 'account should not yet exist for this email address')
        }, function(err) {
          // ok, account could not be found'
        })
        .then(function() {
          return db.createAccount(ACCOUNT.uid, ACCOUNT)
        })
        .then(function(account) {
          assert.deepEqual(account, {}, 'Returned an empty object on account creation')
          var emailBuffer = Buffer(ACCOUNT.email)
          return db.accountExists(emailBuffer)
        })
        .then(function(exists) {
          assert(exists, 'account exists for this email address')
        })
        .then(function() {
          return db.account(ACCOUNT.uid)
        })
        .then(function(account) {
          assert.deepEqual(account.uid, ACCOUNT.uid, 'uid')
          assert.equal(account.email, ACCOUNT.email, 'email')
          assert.deepEqual(account.emailCode, ACCOUNT.emailCode, 'emailCode')
          assert.equal(!! account.emailVerified, ACCOUNT.emailVerified, 'emailVerified')
          assert.deepEqual(account.kA, ACCOUNT.kA, 'kA')
          assert.deepEqual(account.wrapWrapKb, ACCOUNT.wrapWrapKb, 'wrapWrapKb')
          assert(! account.verifyHash, 'verifyHash field should be absent')
          assert.deepEqual(account.authSalt, ACCOUNT.authSalt, 'authSalt')
          assert.equal(account.verifierVersion, ACCOUNT.verifierVersion, 'verifierVersion')
          assert.equal(account.createdAt, ACCOUNT.createdAt, 'createdAt')
          assert.equal(account.verifierSetAt, account.createdAt, 'verifierSetAt has been set to the same as createdAt')
          assert.equal(account.locale, ACCOUNT.locale, 'locale')
        })
        .then(function() {
          return db.checkPassword(ACCOUNT.uid, {verifyHash: Buffer(crypto.randomBytes(32))})
        })
        .then(function() {
          assert(false, 'password check should fail')
        }, function(err) {
          assert(err, 'incorrect password produces an error')
          assert.equal(err.code, 400, 'error code')
          assert.equal(err.errno, 103, 'error errno')
          assert.equal(err.message, 'Incorrect password', 'message')
          assert.equal(err.error, 'Bad request', 'error')
        })
        .then(function() {
          return db.checkPassword(ACCOUNT.uid, {verifyHash: zeroBuffer32})
        })
        .then(function(account) {
          assert.deepEqual(account.uid, ACCOUNT.uid, 'uid')
          assert.equal(Object.keys(account).length, 1, 'Only one field (uid) was returned, nothing else')
        })
        .then(function() {
          var emailBuffer = Buffer(ACCOUNT.email)
          return db.emailRecord(emailBuffer)
        })
        .then(function(account) {
          assert.deepEqual(account.uid, ACCOUNT.uid, 'uid')
          assert.equal(account.email, ACCOUNT.email, 'email')
          assert.deepEqual(account.emailCode, ACCOUNT.emailCode, 'emailCode')
          assert.equal(!! account.emailVerified, ACCOUNT.emailVerified, 'emailVerified')
          assert.deepEqual(account.kA, ACCOUNT.kA, 'kA')
          assert.deepEqual(account.wrapWrapKb, ACCOUNT.wrapWrapKb, 'wrapWrapKb')
          assert(! account.verifyHash, 'verifyHash field should be absent')
          assert.deepEqual(account.authSalt, ACCOUNT.authSalt, 'authSalt')
          assert.equal(account.verifierVersion, ACCOUNT.verifierVersion, 'verifierVersion')
          assert.equal(account.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt')
          // locale not returned with .emailRecord() (unlike .account() when it is)
        })
        // and we piggyback some duplicate query error handling here...
        .then(function() {
          return db.createAccount(ACCOUNT.uid, ACCOUNT)
        })
        .then(
          function() {
            assert(false, 'this should have resulted in a duplicate account error')
          },
          function(err) {
            assert(err, 'trying to create the same account produces an error')
            assert.equal(err.code, 409, 'error code')
            assert.equal(err.errno, 101, 'error errno')
            assert.equal(err.message, 'Record already exists', 'message')
            assert.equal(err.error, 'Conflict', 'error')
          }
        )
      }
    )

    it(
      'session token handling',
      () => {
        var VERIFIED_SESSION_TOKEN_ID = hex32()
        var UNVERIFIED_SESSION_TOKEN_ID = hex32()
        var UNVERIFIED_SESSION_TOKEN = {
          data: hex32(),
          uid: ACCOUNT.uid,
          createdAt: Date.now(),
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaDeviceType: 'wibble',
          uaFormFactor: 'blee',
          mustVerify: false,
          tokenVerificationId: hex16()
        }
        var DEVICE_ID = newUuid()

        // Fetch all of the sessions tokens for the account
        return db.sessions(ACCOUNT.uid)
          .then(function(sessions) {
            assert(Array.isArray(sessions), 'sessions is an array')
            assert.equal(sessions.length, 0, 'sessions is empty')
            // Create a session token
            return db.createSessionToken(SESSION_TOKEN_ID, SESSION_TOKEN)
          })
          .then(function(result) {
            assert.deepEqual(result, {}, 'Returned an empty object on session token creation')

            // Fetch all of the sessions tokens for the account
            return db.sessions(ACCOUNT.uid)
          })
          .then(function (sessions) {
            assert.equal(sessions.length, 1, 'sessions contains one item')
            assert.equal(Object.keys(sessions[0]).length, 18, 'session has correct properties')
            assert.equal(sessions[0].tokenId.toString('hex'), SESSION_TOKEN_ID.toString('hex'), 'tokenId is correct')
            assert.equal(sessions[0].uid.toString('hex'), ACCOUNT.uid.toString('hex'), 'uid is correct')
            assert.equal(sessions[0].createdAt, SESSION_TOKEN.createdAt, 'createdAt is correct')
            assert.equal(sessions[0].uaBrowser, SESSION_TOKEN.uaBrowser, 'uaBrowser is correct')
            assert.equal(sessions[0].uaBrowserVersion, SESSION_TOKEN.uaBrowserVersion, 'uaBrowserVersion is correct')
            assert.equal(sessions[0].uaOS, SESSION_TOKEN.uaOS, 'uaOS is correct')
            assert.equal(sessions[0].uaOSVersion, SESSION_TOKEN.uaOSVersion, 'uaOSVersion is correct')
            assert.equal(sessions[0].uaDeviceType, SESSION_TOKEN.uaDeviceType, 'uaDeviceType is correct')
            assert.equal(sessions[0].uaFormFactor, SESSION_TOKEN.uaFormFactor, 'uaFormFactor is correct')
            assert.equal(sessions[0].lastAccessTime, SESSION_TOKEN.createdAt, 'lastAccessTime is correct')

            // Fetch the session token
            return db.sessionToken(SESSION_TOKEN_ID)
          })
          .then(function(token) {
            // tokenId is not returned from db.sessionToken()
            assert.deepEqual(token.tokenData, SESSION_TOKEN.data, 'token data matches')
            assert.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
            assert.equal(token.createdAt, SESSION_TOKEN.createdAt, 'createdAt is correct')
            assert.equal(token.uaBrowser, SESSION_TOKEN.uaBrowser, 'uaBrowser is correct')
            assert.equal(token.uaBrowserVersion, SESSION_TOKEN.uaBrowserVersion, 'uaBrowserVersion is correct')
            assert.equal(token.uaOS, SESSION_TOKEN.uaOS, 'uaOS is correct')
            assert.equal(token.uaOSVersion, SESSION_TOKEN.uaOSVersion, 'uaOSVersion is correct')
            assert.equal(token.uaDeviceType, SESSION_TOKEN.uaDeviceType, 'uaDeviceType is correct')
            assert.equal(token.uaFormFactor, SESSION_TOKEN.uaFormFactor, 'uaFormFactor is correct')
            assert.equal(token.lastAccessTime, SESSION_TOKEN.createdAt, 'lastAccessTime was set')
            assert.equal(!! token.emailVerified, ACCOUNT.emailVerified, 'token emailVerified is same as account emailVerified')
            assert.equal(token.email, ACCOUNT.email, 'token email same as account email')
            assert.deepEqual(token.emailCode, ACCOUNT.emailCode, 'token emailCode same as account emailCode')
            assert.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is correct')
            assert.equal(token.accountCreatedAt, ACCOUNT.createdAt, 'accountCreatedAt is correct')

            // Update the session token
            return db.updateSessionToken(SESSION_TOKEN_ID, {
              uaBrowser: 'foo',
              uaBrowserVersion: '1',
              uaOS: 'bar',
              uaOSVersion: '2',
              uaDeviceType: 'baz',
              lastAccessTime: 42
            })
          })
          .then(function(result) {
            assert.deepEqual(result, {}, 'Returned an empty object on session token update')

            // Fetch all of the sessions tokens for the account
            return db.sessions(ACCOUNT.uid)
          })
          .then(function (sessions) {
            assert.equal(sessions.length, 1, 'sessions still contains one item')
            assert.equal(sessions[0].tokenId.toString('hex'), SESSION_TOKEN_ID.toString('hex'), 'tokenId is correct')
            assert.equal(sessions[0].uid.toString('hex'), ACCOUNT.uid.toString('hex'), 'uid is correct')
            assert.equal(sessions[0].createdAt, SESSION_TOKEN.createdAt, 'createdAt is correct')
            assert.equal(sessions[0].uaBrowser, 'foo', 'uaBrowser is correct')
            assert.equal(sessions[0].uaBrowserVersion, '1', 'uaBrowserVersion is correct')
            assert.equal(sessions[0].uaOS, 'bar', 'uaOS is correct')
            assert.equal(sessions[0].uaOSVersion, '2', 'uaOSVersion is correct')
            assert.equal(sessions[0].uaDeviceType, 'baz', 'uaDeviceType is correct')
            assert.equal(sessions[0].uaFormFactor, SESSION_TOKEN.uaFormFactor, 'uaFormFactor is correct')
            assert.equal(sessions[0].lastAccessTime, 42, 'lastAccessTime is correct')

            // Fetch the session token
            return db.sessionToken(SESSION_TOKEN_ID)
          })
          .then(function(token) {
            assert.deepEqual(token.tokenData, SESSION_TOKEN.data, 'token data matches')
            assert.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
            assert.equal(token.createdAt, SESSION_TOKEN.createdAt, 'createdAt is correct')
            assert.equal(token.uaBrowser, 'foo', 'uaBrowser is correct')
            assert.equal(token.uaBrowserVersion, '1', 'uaBrowserVersion is correct')
            assert.equal(token.uaOS, 'bar', 'uaOS is correct')
            assert.equal(token.uaOSVersion, '2', 'uaOSVersion is correct')
            assert.equal(token.uaDeviceType, 'baz', 'uaDeviceType is correct')
            assert.equal(token.uaFormFactor, SESSION_TOKEN.uaFormFactor, 'uaFormFactor is correct')
            assert.equal(token.lastAccessTime, 42, 'lastAccessTime is correct')
            assert.equal(!! token.emailVerified, ACCOUNT.emailVerified, 'token emailVerified is same as account emailVerified')
            assert.equal(token.email, ACCOUNT.email, 'token email same as account email')
            assert.deepEqual(token.emailCode, ACCOUNT.emailCode, 'token emailCode same as account emailCode')
            assert.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is correct')
            assert.equal(token.accountCreatedAt, ACCOUNT.createdAt, 'accountCreatedAt is correct')
            assert.equal(token.mustVerify, undefined, 'mustVerify is undefined')
            assert.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

            // Fetch the session token with its verification state
            return db.sessionTokenWithVerificationStatus(SESSION_TOKEN_ID)
          })
          .then(function (token) {
            assert.deepEqual(token.tokenData, SESSION_TOKEN.data, 'token data matches')
            assert.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
            assert.equal(token.createdAt, SESSION_TOKEN.createdAt, 'createdAt is correct')
            assert.equal(token.uaBrowser, 'foo', 'uaBrowser is correct')
            assert.equal(token.uaBrowserVersion, '1', 'uaBrowserVersion is correct')
            assert.equal(token.uaOS, 'bar', 'uaOS is correct')
            assert.equal(token.uaOSVersion, '2', 'uaOSVersion is correct')
            assert.equal(token.uaDeviceType, 'baz', 'uaDeviceType is correct')
            assert.equal(token.uaFormFactor, SESSION_TOKEN.uaFormFactor, 'uaFormFactor is correct')
            assert.equal(token.lastAccessTime, 42, 'lastAccessTime is correct')
            assert.equal(!! token.emailVerified, ACCOUNT.emailVerified, 'token emailVerified is same as account emailVerified')
            assert.equal(token.email, ACCOUNT.email, 'token email same as account email')
            assert.deepEqual(token.emailCode, ACCOUNT.emailCode, 'token emailCode same as account emailCode')
            assert.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is correct')
            assert.equal(token.accountCreatedAt, ACCOUNT.createdAt, 'accountCreatedAt is correct')
            assert.equal(!! token.mustVerify, !! SESSION_TOKEN.mustVerify, 'mustVerify is correct')
            assert.deepEqual(token.tokenVerificationId, SESSION_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')

            // Create a verified session token
            return db.createSessionToken(VERIFIED_SESSION_TOKEN_ID, {
              data: hex32(),
              uid: ACCOUNT.uid,
              createdAt: Date.now(),
              uaBrowser: 'a',
              uaBrowserVersion: 'b',
              uaOS: 'c',
              uaOSVersion: 'd',
              uaDeviceType: 'e',
              uaFormFactor: 'f'
            })
          })
          .then(function (result) {
            assert.deepEqual(result, {}, 'Returned an empty object on session token creation')

            // Fetch all of the sessions tokens for the account
            return db.sessions(ACCOUNT.uid)
          })
          .then(function (sessions) {
            assert.equal(sessions.length, 2, 'sessions contains one item')
            var index = 0
            if (sessions[0].tokenId.toString('hex') === SESSION_TOKEN_ID.toString('hex')) {
              index = 1
            }
            assert.equal(sessions[index].tokenId.toString('hex'), VERIFIED_SESSION_TOKEN_ID.toString('hex'), 'tokenId is correct')
            assert.equal(sessions[index].uid.toString('hex'), ACCOUNT.uid.toString('hex'), 'uid is correct')
            assert.equal(sessions[index].uaBrowser, 'a', 'uaBrowser is correct')
            assert.equal(sessions[index].uaBrowserVersion, 'b', 'uaBrowserVersion is correct')
            assert.equal(sessions[index].uaOS, 'c', 'uaOS is correct')
            assert.equal(sessions[index].uaOSVersion, 'd', 'uaOSVersion is correct')
            assert.equal(sessions[index].uaDeviceType, 'e', 'uaDeviceType is correct')
            assert.equal(sessions[index].uaFormFactor, 'f', 'uaFormFactor is correct')

            // Fetch the verified session token
            return db.sessionToken(VERIFIED_SESSION_TOKEN_ID)
          })
          .then(function(token) {
            assert.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
            assert.equal(token.uaBrowser, 'a', 'uaBrowser is correct')
            assert.equal(token.uaBrowserVersion, 'b', 'uaBrowserVersion is correct')
            assert.equal(token.uaOS, 'c', 'uaOS is correct')
            assert.equal(token.uaOSVersion, 'd', 'uaOSVersion is correct')
            assert.equal(token.uaDeviceType, 'e', 'uaDeviceType is correct')
            assert.equal(token.uaFormFactor, 'f', 'uaFormFactor is correct')
            assert.equal(!! token.emailVerified, ACCOUNT.emailVerified, 'token emailVerified is same as account emailVerified')
            assert.equal(token.mustVerify, undefined, 'mustVerify is undefined')
            assert.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

            // Fetch the verified session token with its verification state
            return db.sessionTokenWithVerificationStatus(VERIFIED_SESSION_TOKEN_ID)
          })
          .then(function (token) {
            assert.equal(token.mustVerify, null, 'mustVerify is null')
            assert.equal(token.tokenVerificationId, null, 'tokenVerificationId is null')

            // Attempt to verify session token with invalid tokenVerificationId
            return db.verifyTokens(hex16(), { uid: ACCOUNT.uid })
          })
          .then(function () {
            assert(false, 'Verifying session token with invalid tokenVerificationId should have failed')
          }, function (err) {
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')
          })
          .then(function() {
            // Fetch the unverified session token with its verification state
            return db.sessionTokenWithVerificationStatus(SESSION_TOKEN_ID)
          })
          .then(function (token) {
            assert.equal(!! token.mustVerify, !! SESSION_TOKEN.mustVerify, 'mustVerify is correct')
            assert.deepEqual(token.tokenVerificationId, SESSION_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')

            // Attempt to verify session token with invalid uid
            return db.verifyTokens(SESSION_TOKEN.tokenVerificationId, { uid: hex16() })
          })
          .then(function () {
            assert(false, 'Verifying session token with invalid uid should have failed')
          }, function (err) {
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')
          })
          .then(function() {
            // Fetch the unverified session token with its verification state
            return db.sessionTokenWithVerificationStatus(SESSION_TOKEN_ID)
          })
          .then(function (token) {
            assert.equal(!! token.mustVerify, !! SESSION_TOKEN.mustVerify, 'mustVerify is correct')
            assert.deepEqual(token.tokenVerificationId, SESSION_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')

            // Verify the session token
            return db.verifyTokens(SESSION_TOKEN.tokenVerificationId, { uid: ACCOUNT.uid })
          })
          .then(function() {
            // Fetch the newly verified session token
            return db.sessionToken(SESSION_TOKEN_ID)
          })
          .then(function(token) {
            assert.equal(token.mustVerify, undefined, 'mustVerify is undefined')
            assert.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

            // Fetch the newly verified session token with its verification state
            return db.sessionTokenWithVerificationStatus(SESSION_TOKEN_ID)
          })
          .then(function (token) {
            assert.equal(token.mustVerify, null, 'mustVerify is null')
            assert.equal(token.tokenVerificationId, null, 'tokenVerificationId is null')

            // Create an unverified session token
            return db.createSessionToken(UNVERIFIED_SESSION_TOKEN_ID, UNVERIFIED_SESSION_TOKEN)
          })
          .then(function() {
            // Create a device
            return db.createDevice(ACCOUNT.uid, DEVICE_ID, {
              sessionTokenId: SESSION_TOKEN_ID,
              name: 'Test Device',
              type: 'mobile',
              createdAt: Date.now(),
              callbackURL: 'https://push.server',
              callbackPublicKey: 'foo',
              callbackAuthKey: 'bar',
              callbackIsExpired: false
            })
          })
          .then(function() {
            // Fetch devices for the account
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function(results) {
            assert.equal(results.length, 1, 'Account has one device')

            // Fetch devices for the account
            return db.sessions(ACCOUNT.uid)
          })
          .then(function(sessions) {
            // by default sessions are not sorted
            sessions.sort(function(s1, s2) {
              return s1.createdAt - s2.createdAt
            })

            assert.equal(sessions.length, 3, 'sessions contains correct number of items')
            // the next session has a device attached to it
            assert.equal(sessions[0].deviceId.toString('hex'), DEVICE_ID.toString('hex'))
            assert.equal(sessions[0].deviceName, 'Test Device')
            assert.equal(sessions[0].deviceType, 'mobile')
            assert(sessions[0].deviceCreatedAt)
            assert.equal(sessions[0].deviceCallbackURL, 'https://push.server')
            assert.equal(sessions[0].deviceCallbackPublicKey, 'foo')
            assert.equal(sessions[0].deviceCallbackAuthKey, 'bar')
            assert.equal(sessions[0].deviceCallbackIsExpired, false)
            assert.equal(sessions[1].deviceId, null)
            assert.equal(sessions[2].deviceId, null)

            // Delete all three session tokens
            return P.all([
              db.deleteSessionToken(SESSION_TOKEN_ID),
              db.deleteSessionToken(VERIFIED_SESSION_TOKEN_ID),
              db.deleteSessionToken(UNVERIFIED_SESSION_TOKEN_ID)
            ])
          })
          .then(function(results) {
            assert.equal(results.length, 3)
            results.forEach(function (result) {
              assert.deepEqual(result, {}, 'Returned an empty object on forgot session token deletion')
            })

            // Fetch devices for the account
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function(results) {
            assert.equal(results.length, 0, 'Account has no devices')

            // Attempt to verify deleted unverified session token
            return db.verifyTokens(UNVERIFIED_SESSION_TOKEN.tokenVerificationId, { uid: ACCOUNT.uid })
          })
          .then(function () {
            assert(false, 'Verifying deleted unverified session token should have failed')
          }, function (err) {
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')
          })
          .then(function() {
            // Fetch all of the sessions tokens for the account
            return db.sessions(ACCOUNT.uid)
          })
          .then(function (sessions) {
            assert.equal(sessions.length, 0, 'sessions is empty')

            // Attempt to fetch a deleted session token
            return db.sessionToken(SESSION_TOKEN_ID)
              .then(
                () => assert(false, 'Session Token should no longer exist'),
                () => assert('Session token was deleted successfully')
              )
          })
      }
    )

    it(
      'key fetch token handling',
      () => {
        var VERIFIED_KEY_FETCH_TOKEN_ID = hex32()

        // Create a key fetch token
        return db.createKeyFetchToken(KEY_FETCH_TOKEN_ID, KEY_FETCH_TOKEN)
          .then(function(result) {
            assert.deepEqual(result, {}, 'Returned an empty object on key fetch token creation')

            // Fetch the key fetch token
            return db.keyFetchToken(KEY_FETCH_TOKEN_ID)
          })
          .then(function(token) {
            // tokenId is not returned
            assert.deepEqual(token.authKey, KEY_FETCH_TOKEN.authKey, 'authKey matches')
            assert.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
            assert.equal(token.createdAt, KEY_FETCH_TOKEN.createdAt, 'createdAt is ok')
            assert.equal(!! token.emailVerified, ACCOUNT.emailVerified, 'emailVerified is correct')
            // email is not returned
            // emailCode is not returned
            assert.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is correct')
            assert.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

            // Fetch the key fetch token with its verification state
            return db.keyFetchTokenWithVerificationStatus(KEY_FETCH_TOKEN_ID)
          })
          .then(function(token) {
            assert.deepEqual(token.authKey, KEY_FETCH_TOKEN.authKey, 'authKey matches')
            assert.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
            assert.equal(token.createdAt, KEY_FETCH_TOKEN.createdAt, 'createdAt is ok')
            assert.equal(!! token.emailVerified, ACCOUNT.emailVerified, 'emailVerified is correct')
            assert.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is correct')
            assert.deepEqual(token.tokenVerificationId, KEY_FETCH_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')

            // Attempt to verify key fetch token with invalid tokenVerificationId
            return db.verifyTokens(hex16(), { uid: KEY_FETCH_TOKEN.uid })
          })
          .then(function () {
            assert(false, 'Verifying key fetch token with invalid tokenVerificationId should have failed')
          }, function () {
            // Verifying key fetch token with invalid tokenVerificationId failed as expected
          })
          .then(function() {
            // Fetch the key fetch token with its verification state
            return db.keyFetchTokenWithVerificationStatus(KEY_FETCH_TOKEN_ID)
          })
          .then(function (token) {
            assert.deepEqual(token.tokenVerificationId, KEY_FETCH_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')

            // Attempt to verify key fetch token with invalid uid
            return db.verifyTokens(KEY_FETCH_TOKEN.tokenVerificationId, { uid: hex16() })
          })
          .then(function () {
            assert(false, 'Verifying key fetch token with invalid uid should have failed')
          }, function () {
            // 'Verifying key fetch token with invalid uid failed as expected'
          })
          .then(function() {
            // Fetch the key fetch token with its verification state
            return db.keyFetchTokenWithVerificationStatus(KEY_FETCH_TOKEN_ID)
          })
          .then(function (token) {
            assert.deepEqual(token.tokenVerificationId, KEY_FETCH_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')

            // Verify the key fetch token
            return db.verifyTokens(KEY_FETCH_TOKEN.tokenVerificationId, { uid: SESSION_TOKEN.uid })
          })
          .then(function() {
            // Fetch the key fetch token
            return db.keyFetchToken(KEY_FETCH_TOKEN_ID)
          })
          .then(function(token) {
            assert.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

            // Fetch the key fetch token with its verification state
            return db.keyFetchTokenWithVerificationStatus(KEY_FETCH_TOKEN_ID)
          })
          .then(function(token) {
            assert.equal(token.tokenVerificationId, null, 'tokenVerificationId is null')

            // Create a verified key fetch token
            return db.createKeyFetchToken(VERIFIED_KEY_FETCH_TOKEN_ID, {
              authKey: hex32(),
              uid: ACCOUNT.uid,
              keyBundle: hex96(),
              createdAt: Date.now()
            })
          })
          .then(function() {
            // Fetch the verified key fetch token
            return db.keyFetchToken(VERIFIED_KEY_FETCH_TOKEN_ID)
          })
          .then(function(token) {
            assert.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

            // Fetch the verified key fetch token with its verification state
            return db.keyFetchTokenWithVerificationStatus(VERIFIED_KEY_FETCH_TOKEN_ID)
          })
          .then(function(token) {
            assert.equal(token.tokenVerificationId, null, 'tokenVerificationId is null')

            // Delete both key fetch tokens
            return P.all([
              db.deleteKeyFetchToken(KEY_FETCH_TOKEN_ID),
              db.deleteKeyFetchToken(VERIFIED_KEY_FETCH_TOKEN_ID)
            ])
          })
          .then(function(result) {
            assert.deepEqual(result, [{}, {}], 'Returned empty objects on forgot key fetch token deletion')

            // Attempt to fetch a deleted key fetch token
            return db.keyFetchToken(KEY_FETCH_TOKEN_ID)
          })
          .then(function(token) {
            assert(false, 'Key Fetch Token should no longer exist')
          }, function(err) {
            // Key Fetch Token deleted successfully
          })
      }
    )

    it(
      'forgot password token handling',
      () => {
        var token
        var THROWAWAY_PASSWORD_FORGOT_TOKEN_ID = hex32()
        var THROWAWAY_PASSWORD_FORGOT_TOKEN = {
          data : hex32(),
          uid : ACCOUNT.uid, // same account uid
          passCode : hex16(),
          tries : 1,
          createdAt: Date.now()
        }

        return db.createPasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID, PASSWORD_FORGOT_TOKEN)
          .then(function(result) {
            assert.deepEqual(result, {}, 'Returned an empty object on forgot password token creation')
            return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
          })
          .then(function(newToken) {
            token = newToken
            // tokenId is not returned
            assert.deepEqual(token.tokenData, PASSWORD_FORGOT_TOKEN.data, 'token data matches')
            assert.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
            assert.equal(token.createdAt, PASSWORD_FORGOT_TOKEN.createdAt, 'createdAt same')
            assert.deepEqual(token.passCode, PASSWORD_FORGOT_TOKEN.passCode, 'token passCode same')
            assert.equal(token.tries, PASSWORD_FORGOT_TOKEN.tries, 'Tries is correct')
            assert.equal(token.email, ACCOUNT.email, 'token email same as account email')
            assert.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is set correctly')
          })
          .then(function() {
            return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
          })
          .then(function(newToken) {
            token = newToken
            // tokenId is not returned
            assert.deepEqual(token.tokenData, PASSWORD_FORGOT_TOKEN.data, 'token data matches')
            assert.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
            assert.equal(token.createdAt, PASSWORD_FORGOT_TOKEN.createdAt, 'createdAt is correct')
            assert.deepEqual(token.passCode, PASSWORD_FORGOT_TOKEN.passCode, 'token passCode same')
            assert.equal(token.tries, PASSWORD_FORGOT_TOKEN.tries, 'Tries is correct')
            assert.equal(token.email, ACCOUNT.email, 'token email same as account email')
            assert.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is correct')
          })
          .then(function() {
            // just update the tries
            token.tries = 9
            return db.updatePasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID, token)
          })
          .then(function(result) {
            assert.deepEqual(result, {}, 'The returned object from the token update is empty')
            // re-fetch the updated token
            return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
          })
          .then(function(newToken) {
            assert.deepEqual(newToken.uid, ACCOUNT.uid, 'token belongs to this account')
            assert.equal(newToken.tries, 9, 'token now has had 9 tries')
            return db.deletePasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
          })
          .then(function(result) {
            assert.deepEqual(result, {}, 'Returned an empty object on forgot password token deletion')
            return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
          })
          .then(function(newToken /* unused */) {
            assert(false, 'Password Forgot Token should no longer exist')
          }, function(err) {
            // Password Forgot Token deleted successfully
          })
          .then(function() {
            // insert a throwaway token
            return db.createPasswordForgotToken(THROWAWAY_PASSWORD_FORGOT_TOKEN_ID, THROWAWAY_PASSWORD_FORGOT_TOKEN)
          })
          .then(function(result) {
            assert.deepEqual(result, {}, 'Returned an empty object on forgot password token creation')
            // and we should be able to retrieve it as usual
            return db.passwordForgotToken(THROWAWAY_PASSWORD_FORGOT_TOKEN_ID)
          })
          .then(function(token) {
            // just check that the tokenData is what we expect (complete tests are above)
            assert.deepEqual(token.tokenData, THROWAWAY_PASSWORD_FORGOT_TOKEN.data, 'token data matches')
            // now, let's insert a different passwordForgotToken with the same uid
            return db.createPasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID, PASSWORD_FORGOT_TOKEN)
          })
          .then(function(result) {
            assert.deepEqual(result, {}, 'Returned an empty object on forgot password token creation (when overwriting another)')
            // if we retrieve the throwaway one, we should fail
            return db.passwordForgotToken(THROWAWAY_PASSWORD_FORGOT_TOKEN_ID)
          })
          .then(function(newToken /* unused */) {
            assert(false, 'Throwaway Password Forgot Token should no longer exist')
          }, function(err) {
            // but the new one is still there
            return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
          })
          .then(function(token) {
            // just check that the tokenData is what we expect (complete tests are above)
            assert.deepEqual(token.tokenData, PASSWORD_FORGOT_TOKEN.data, 'token data matches')
          }, function(err) {
            assert(false, 'We should have been able to retrieve the new password forgot token')
          })
          .then(function() {
            return db.deletePasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
          })
      }
    )

    it(
      'change password token handling',
      () => {
        var THROWAWAY_PASSWORD_CHANGE_TOKEN_ID = hex32()
        var THROWAWAY_PASSWORD_CHANGE_TOKEN = {
          data : hex32(),
          uid : ACCOUNT.uid, // same account uid
          createdAt: Date.now()
        }

        return db.createPasswordChangeToken(PASSWORD_CHANGE_TOKEN_ID, PASSWORD_CHANGE_TOKEN)
          .then(function(result) {
            assert.deepEqual(result, {}, 'Returned an empty object on change password token creation')
            return db.passwordChangeToken(PASSWORD_CHANGE_TOKEN_ID)
          })
          .then(function(token) {
            // tokenId is not returned
            assert.deepEqual(token.tokenData, PASSWORD_CHANGE_TOKEN.data, 'token data matches')
            assert.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
            assert.equal(token.createdAt, PASSWORD_CHANGE_TOKEN.createdAt, 'createdAt is correct')
            assert.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is set correctly')
            assert.equal(token.email, ACCOUNT.email, 'email is set correctly')
          })
          .then(function() {
            return db.deletePasswordChangeToken(PASSWORD_CHANGE_TOKEN_ID)
          })
          .then(function(result) {
            assert.deepEqual(result, {}, 'Returned an empty object on forgot password change deletion')
            return db.passwordChangeToken(PASSWORD_CHANGE_TOKEN_ID)
          })
          .then(function(token) {
            assert(false, 'Password Change Token should no longer exist')
          }, function(err) {
            // Password Change Token deleted successfully
          })
          .then(function() {
            // insert a throwaway token
            return db.createPasswordChangeToken(THROWAWAY_PASSWORD_CHANGE_TOKEN_ID, THROWAWAY_PASSWORD_CHANGE_TOKEN)
          })
          .then(function(result) {
            assert.deepEqual(result, {}, 'Returned an empty object on change password token creation')
            // and we should be able to retrieve it as usual
            return db.passwordChangeToken(THROWAWAY_PASSWORD_CHANGE_TOKEN_ID)
          })
          .then(function(token) {
            // just check that the tokenData is what we expect (complete tests are above)
            assert.deepEqual(token.tokenData, THROWAWAY_PASSWORD_CHANGE_TOKEN.data, 'token data matches')
            // now, let's insert a different passwordChangeToken with the same uid
            return db.createPasswordChangeToken(PASSWORD_CHANGE_TOKEN_ID, PASSWORD_CHANGE_TOKEN)
          })
          .then(function(result) {
            assert.deepEqual(result, {}, 'Returned an empty object on change password token creation (when overwriting another)')
            // if we retrieve the throwaway one, we should fail
            return db.passwordChangeToken(THROWAWAY_PASSWORD_CHANGE_TOKEN_ID)
          })
          .then(function(newToken /* unused */) {
            assert(false, 'Throwaway Password Change Token should no longer exist')
          }, function(err) {
            // but the new one is still there
            return db.passwordChangeToken(PASSWORD_CHANGE_TOKEN_ID)
          })
          .then(function(token) {
            // just check that the tokenData is what we expect (complete tests are above)
            assert.deepEqual(token.tokenData, PASSWORD_CHANGE_TOKEN.data, 'token data matches')
          }, function(err) {
            assert(false, 'We should have been able to retrieve the new password change token')
          })
      }
    )

    it(
      'email verification and locale change',
      () => {
        var emailBuffer = Buffer(ACCOUNT.email)
        return db.emailRecord(emailBuffer)
        .then(function(emailRecord) {
          return db.verifyEmail(emailRecord.uid, emailRecord.emailCode)
        })
        .then(function(result) {
          assert.deepEqual(result, {}, 'Returned an empty object email verification')
          return db.account(ACCOUNT.uid)
        })
        .then(function(account) {
          assert(account.emailVerified, 'account should now be emailVerified (truthy)')
          assert.equal(account.emailVerified, 1, 'account should now be emailVerified (1)')

          account.locale = 'en_NZ'
          return db.updateLocale(ACCOUNT.uid, account)
        })
        .then(function(result) {
          assert.deepEqual(result, {}, 'Returned an empty object for updateLocale')
          return db.account(ACCOUNT.uid)
        })
        .then(function(account) {
          assert.equal(account.locale, 'en_NZ', 'account should now have new locale')

          // test verifyEmail for a non-existant account
          return db.verifyEmail(newUuid(), account.emailCode)
        })
        .then(function(res) {
          assert.deepEqual(res, {}, 'No matter what happens, we get an empty object back')
        }, function(err) {
          assert(false, 'We should not have failed this .verifyEmail() request')
        })
      }
    )

    it(
      'account reset token handling',
      () => {
        return db.createPasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID, PASSWORD_FORGOT_TOKEN)
          .then(function(passwordForgotToken) {
            return db.forgotPasswordVerified(PASSWORD_FORGOT_TOKEN_ID, ACCOUNT_RESET_TOKEN)
          })
          .then(function(result) {
            return db.accountResetToken(ACCOUNT_RESET_TOKEN_ID)
          })
          .then(function(token) {
            // tokenId is not returned
            assert.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
            assert.deepEqual(token.tokenData, ACCOUNT_RESET_TOKEN.data, 'token data matches')
            assert.equal(token.createdAt, ACCOUNT_RESET_TOKEN.createdAt, 'createdAt is correct')
            assert(token.verifierSetAt, 'verifierSetAt is set to a truthy value')
          })
          .then(function() {
            return db.deleteAccountResetToken(ACCOUNT_RESET_TOKEN_ID)
          })
          .then(function(result) {
            assert.deepEqual(result, {}, 'Returned an empty object on account reset deletion')
            return db.accountResetToken(ACCOUNT_RESET_TOKEN_ID)
          })
          .then(function(token) {
            assert(false, 'Account Reset Token should no longer exist')
          }, function(err) {
            // Account Reset Token deleted successfully
          })
      }
    )

    it(
      'db.forgotPasswordVerified',
      () => {
        // for this test, we are creating a new account with a different email address
        // so that we can check that emailVerified turns from false to true (since
        // we already set it to true earlier)
        var account = createAccount()
        var PASSWORD_FORGOT_TOKEN_ID = hex32()
        var PASSWORD_FORGOT_TOKEN = {
          data : hex32(),
          uid : account.uid,
          passCode : hex16(),
          tries : 1,
          createdAt: now + 1
        }
        var THROWAWAY_PASSWORD_FORGOT_TOKEN_ID = hex32()
        var THROWAWAY_PASSWORD_FORGOT_TOKEN = {
          data : hex32(),
          uid : account.uid,
          passCode : hex16(),
          tries : 1,
          createdAt: now + 2
        }
        var ACCOUNT_RESET_TOKEN_ID = hex32()
        var ACCOUNT_RESET_TOKEN = {
          tokenId : ACCOUNT_RESET_TOKEN_ID,
          data : hex32(),
          uid : account.uid,
          createdAt: now + 3
        }
        var THROWAWAY_ACCOUNT_RESET_TOKEN_ID = hex32()
        var THROWAWAY_ACCOUNT_RESET_TOKEN = {
          tokenId : THROWAWAY_ACCOUNT_RESET_TOKEN_ID,
          data : hex32(),
          uid : account.uid,
          createdAt: now + 4
        }

        return db.createAccount(account.uid, account)
          .then(function() {
            return db.createPasswordForgotToken(THROWAWAY_PASSWORD_FORGOT_TOKEN_ID, THROWAWAY_PASSWORD_FORGOT_TOKEN)
          })
          .then(function(passwordForgotToken) {
            // let's add a throwaway accountResetToken, which should be overwritten when
            // we call passwordForgotToken() later.
            return db.forgotPasswordVerified(THROWAWAY_PASSWORD_FORGOT_TOKEN_ID, THROWAWAY_ACCOUNT_RESET_TOKEN)
          })
          .then(function(result) {
            // let's get it back out to make sure it is there
            return db.accountResetToken(THROWAWAY_ACCOUNT_RESET_TOKEN_ID)
          })
          .then(function(token) {
            // check a couple of fields
            assert.deepEqual(token.uid, account.uid, 'token belongs to this account')
            assert.deepEqual(token.tokenData, THROWAWAY_ACCOUNT_RESET_TOKEN.data, 'token data matches')
            assert.equal(token.createdAt, THROWAWAY_ACCOUNT_RESET_TOKEN.createdAt, 'createdAt is correct')
            assert(token.verifierSetAt, 'verifierSetAt is set to a truthy value')
            // get this account out using emailRecord
            var emailBuffer = Buffer(account.email)
            return db.emailRecord(emailBuffer)
          })
          .then(function(result) {
            return db.createPasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID, PASSWORD_FORGOT_TOKEN)
          })
          .then(function(passwordForgotToken) {
            return db.forgotPasswordVerified(PASSWORD_FORGOT_TOKEN_ID, ACCOUNT_RESET_TOKEN)
          })
          .then(function() {
            // let's try and get the throwaway accountResetToken (shouldn't exist any longer)
            return db.accountResetToken(THROWAWAY_ACCOUNT_RESET_TOKEN_ID)
          })
          .then(function(token) {
            assert(false, 'Throwaway Account Reset Token should no longer exist')
          }, function(err) {
            // retrieve passwordForgotToken (shouldn't exist now)
            return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
          })
          .then(function(token) {
            assert(false, 'Password Forgot Token should no longer exist')
          }, function(err) {
            // Password Forgot Token deleted successfully
          })
          .then(function() {
            return db.accountResetToken(ACCOUNT_RESET_TOKEN_ID)
          })
          .then(function(accountResetToken) {
            // tokenId is not returned
            assert.deepEqual(accountResetToken.uid, account.uid, 'token belongs to this account')
            assert.deepEqual(accountResetToken.tokenData, ACCOUNT_RESET_TOKEN.data, 'token data matches')
            assert.equal(accountResetToken.verifierSetAt, account.verifierSetAt, 'verifierSetAt is set correctly')
          })
          .then(function() {
            return db.account(account.uid)
          })
          .then(function(account) {
            assert(account.emailVerified, 'account should now be emailVerified (truthy)')
            assert.equal(account.emailVerified, 1, 'account should now be emailVerified (1)')
          })
          .then(function() {
            return db.deleteAccountResetToken(ACCOUNT_RESET_TOKEN_ID)
          })
          .then(function(result) {
            assert.deepEqual(result, {}, 'Returned an empty object on account reset deletion')
            return db.accountResetToken(ACCOUNT_RESET_TOKEN_ID)
          })
          .then(function(token) {
            assert(false, 'Account Reset Token should no longer exist')
          }, function(err) {
            // Account Reset Token deleted successfully
          })
      }
    )

    it(
      'db.deviceFromTokenVerificationId',
      () => {
        var sessionTokenId = hex32()
        var deviceId = newUuid()
        var createdAt = Date.now()
        var tokenVerificationId = SESSION_TOKEN.tokenVerificationId
        var deviceName = 'test device'
        return db.deviceFromTokenVerificationId(ACCOUNT.uid, hex16())
          .then(function () {
            assert(false, 'trying to retrieve a device from an unknown tokeenVerificationId should have failed')
          }, function (err) {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
          .then(function () {
            return db.createSessionToken(sessionTokenId, SESSION_TOKEN)
          })
          .then(function () {
            return db.deviceFromTokenVerificationId(ACCOUNT.uid, tokenVerificationId)
          })
          .then(function () {
            assert(false, 'no device should be associated with that session')
          }, function (err) {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
          .then(function () {
            return db.createDevice(ACCOUNT.uid, deviceId, {
              sessionTokenId: sessionTokenId,
              createdAt: createdAt,
              name: deviceName,
              type: 'desktop'
            })
          })
          .then(function () {
            return db.deviceFromTokenVerificationId(ACCOUNT.uid, tokenVerificationId)
          })
          .then(function (deviceInfo) {
            assert.deepEqual(deviceInfo.id, deviceId, 'We found our device id back')
            assert.equal(deviceInfo.name, deviceName, 'We found our device name back')
          })
          .then(function () {
            db.deleteDevice(ACCOUNT.uid, deviceId)
          })
      }
    )

    it(
      'db.accountDevices',
      () => {
        var deviceId = newUuid()
        var sessionTokenId = hex32()
        var zombieSessionTokenId = hex32()
        var createdAt = Date.now()
        var deviceInfo = {
          name: 'test device',
          type: 'mobile',
          callbackURL: 'https://foo/bar',
          callbackPublicKey: base64_65(),
          callbackAuthKey: base64_16(),
          callbackIsExpired: false
        }
        var newDeviceId = newUuid()
        var newSessionTokenId = hex32()
        var newTokenVerificationId = hex16()

        // Attempt to update non-existent device
        return db.updateDevice(ACCOUNT.uid, deviceId, deviceInfo)
          .then(function () {
            assert(false, 'updating a non-existent device should have failed')
          }, function (err) {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
          .then(function () {
            // Create a session token
            return db.createSessionToken(sessionTokenId, SESSION_TOKEN)
          })
          .then(function (sessionToken) {
            // Create a device
            return db.createDevice(ACCOUNT.uid, deviceId, {
              sessionTokenId: sessionTokenId,
              createdAt: createdAt
            })
          })
          .then(function (result) {
            assert.deepEqual(result, {}, 'returned empty object')

            // Attempt to create a duplicate device
            return db.createDevice(ACCOUNT.uid, deviceId, {
              sessionTokenId: newSessionTokenId,
              createdAt: Date.now()
            })
            .then(function () {
              assert(false, 'adding a duplicate device should have failed')
            }, function (err) {
              assert.equal(err.code, 409, 'err.code')
              assert.equal(err.errno, 101, 'err.errno')
            })
          })
          .then(function () {
            // Fetch all of the devices for the account
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 1, 'devices length 1')
            return devices[0]
          })
          .then(function (device) {
            assert.deepEqual(device.sessionTokenId, sessionTokenId, 'sessionTokenId')
            assert.equal(device.name, null, 'name')
            assert.deepEqual(device.id, deviceId, 'id')
            assert.equal(device.createdAt, createdAt, 'createdAt')
            assert.equal(device.type, null, 'type')
            assert.equal(device.callbackURL, null, 'callbackURL')
            assert.equal(device.callbackPublicKey, null, 'callbackPublicKey')
            assert.equal(device.callbackAuthKey, null, 'callbackAuthKey')
            assert.equal(device.callbackIsExpired, false, 'callbackIsExpired')
            assert(device.lastAccessTime > 0, 'has a lastAccessTime')
            assert.equal(device.email, ACCOUNT.email, 'email should be account email')

            // Fetch the session token with its verification state and device info
            return db.sessionWithDevice(sessionTokenId)
              .then(
                function (s) {
                  assert.deepEqual(s.deviceId, device.id, 'id')
                  assert.deepEqual(s.uid, device.uid, 'uid')
                  assert.equal(s.deviceName, device.name, 'name')
                  assert.equal(s.deviceType, device.type, 'type')
                  assert.equal(s.deviceCreatedAt, device.createdAt, 'createdAt')
                  assert.equal(s.deviceCallbackURL, device.callbackURL, 'callbackURL')
                  assert.equal(s.deviceCallbackPublicKey, device.callbackPublicKey, 'callbackPublicKey')
                  assert.equal(s.deviceCallbackAuthKey, device.callbackAuthKey, 'callbackAuthKey')
                  assert.equal(s.deviceCallbackIsExpired, device.callbackIsExpired, 'callbackIsExpired')
                  assert.equal(!! s.mustVerify, !! SESSION_TOKEN.mustVerify, 'mustVerify is correct')
                  assert.deepEqual(s.tokenVerificationId, SESSION_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')
                },
                function (e) {
                  assert(false, 'getting the sessionWithDevice should not have failed')
                }
              )
          })
          .then(function () {
            // Verify the session token
            return db.verifyTokens(SESSION_TOKEN.tokenVerificationId, { uid: SESSION_TOKEN.uid })
          })
          .then(function () {
            // Fetch the session token with its verification state and device info
            return db.sessionWithDevice(sessionTokenId)
          })
          .then(function (s) {
            assert.equal(s.mustVerify, null, 'mustVerify is null')
            assert.equal(s.tokenVerificationId, null, 'tokenVerificationId is null')

            // Update the device
            return db.updateDevice(ACCOUNT.uid, deviceId, deviceInfo)
          })
          .then(function (result) {
            assert.deepEqual(result, {}, 'returned empty object')

            // Fetch all of the devices for the account
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 1, 'devices length still 1')
            return devices[0]
          })
          .then(function (device) {
            assert.deepEqual(device.sessionTokenId, sessionTokenId, 'sessionTokenId')
            assert.equal(device.name, deviceInfo.name, 'name')
            assert.deepEqual(device.id, deviceId, 'id')
            assert.equal(device.createdAt, createdAt, 'createdAt')
            assert.equal(device.type, deviceInfo.type, 'type')
            assert.equal(device.callbackURL, deviceInfo.callbackURL, 'callbackURL')
            assert.equal(device.callbackPublicKey, deviceInfo.callbackPublicKey, 'callbackPublicKey')
            assert.equal(device.callbackAuthKey, deviceInfo.callbackAuthKey, 'callbackAuthKey')
            assert.equal(device.callbackIsExpired, deviceInfo.callbackIsExpired, 'callbackIsExpired')
            assert(device.lastAccessTime > 0, 'has a lastAccessTime')
            assert.equal(device.email, ACCOUNT.email, 'email should be account email')

            // Create a second session token
            return db.createSessionToken(newSessionTokenId, SESSION_TOKEN)
          })
          .then(function () {
            // Update the device name and session token
            return db.updateDevice(ACCOUNT.uid, deviceId, {
              sessionTokenId: newSessionTokenId,
              name: 'updated name',
              type: null
            })
          })
          .then(function () {
            // Fetch all of the devices for the account
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 1, 'devices length still 1')
            return devices[0]
          })
          .then(function (device) {
            assert.deepEqual(device.sessionTokenId, newSessionTokenId, 'sessionTokenId updated')
            assert.equal(device.name, 'updated name', 'name updated')
            assert.equal(device.type, deviceInfo.type, 'type unchanged')
            assert.equal(device.callbackURL, deviceInfo.callbackURL, 'callbackURL unchanged')
            assert.equal(device.callbackPublicKey, deviceInfo.callbackPublicKey, 'callbackPublicKey unchanged')
            assert.equal(device.callbackAuthKey, deviceInfo.callbackAuthKey, 'callbackAuthKey unchanged')
            assert.equal(device.callbackIsExpired, deviceInfo.callbackIsExpired, 'callbackIsExpired unchanged')

            // Update the device type and callback params
            return db.updateDevice(ACCOUNT.uid, deviceId, {
              type: 'desktop',
              callbackURL: '',
              callbackPublicKey: '',
              callbackAuthKey: '',
              callbackIsExpired: true
            })
          })
          .then(function (result) {
            // Fetch all of the devices for the account
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 1, 'devices length still 1')
            return devices[0]
          })
          .then(function (device) {
            assert.deepEqual(device.sessionTokenId, newSessionTokenId, 'sessionTokenId updated')
            assert.equal(device.name, 'updated name', 'name unchanged')
            assert.equal(device.type, 'desktop', 'type updated')
            assert.equal(device.callbackURL, '', 'callbackURL updated')
            assert.equal(device.callbackPublicKey, '', 'callbackPublicKey updated')
            assert.equal(device.callbackAuthKey, '', 'callbackAuthKey updated')
            assert.equal(device.callbackIsExpired, true, 'callbackIsExpired updated')

            // Make the device a zombie, by giving it a non-existent session token
            return db.updateDevice(ACCOUNT.uid, deviceId, {
              sessionTokenId: zombieSessionTokenId
            })
          })
          .then(function () {
            // Fetch all of the devices for the account
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 0, 'devices is empty')

            // Reinstate the previous session token for the device
            return db.updateDevice(ACCOUNT.uid, deviceId, {
              sessionTokenId: newSessionTokenId
            })
          })
          .then(function () {
            // Fetch all of the devices for the account
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 1, 'devices contains one item again')

            // Attempt to create a second device with the same session token
            return db.createDevice(ACCOUNT.uid, newUuid(), {
              sessionTokenId: newSessionTokenId,
              name: 'second device',
              createdAt: Date.now(),
              type: 'desktop',
              callbackURL: 'https://foo/bar',
              callbackPublicKey: base64_65(),
              callbackAuthKey: base64_16(),
              callbackIsExpired: false
            })
            .then(function () {
              assert(false, 'adding a second device should have failed when the session token is already registered')
            }, function (err) {
              assert.equal(err.code, 409, 'err.code')
              assert.equal(err.errno, 101, 'err.errno')
            })
          })
          .then(function () {
            // Fetch all of the devices for the account
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 1, 'devices length still 1')

            // Create a second device
            return db.createDevice(ACCOUNT.uid, newDeviceId, {
              sessionTokenId: sessionTokenId,
              name: 'second device',
              createdAt: Date.now(),
              type: 'desktop',
              callbackURL: 'https://foo/bar',
              callbackPublicKey: base64_65(),
              callbackAuthKey: base64_16(),
              callbackIsExpired: false
            })
            .then(function () {
            }, function (err) {
              assert(false, 'adding a second device should not have failed when the session token is not registered')
            })
          })
          .then(function () {
            // Fetch all of the devices for the account
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 2, 'devices length 2')

            // Delete the first device
            return db.deleteDevice(ACCOUNT.uid, deviceId)
          })
          .then(function (result) {
            assert.deepEqual(result, {}, 'returned empty object')

            // Fetch all of the devices for the account
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 1, 'devices length 1')

            // Attempt to delete the first device again
            return db.deleteDevice(ACCOUNT.uid, deviceId)
              .then(function () {
                assert(false, 'deleting a non-existent device should have failed')
              }, function (err) {
                assert.equal(err.code, 404, 'err.code')
                assert.equal(err.errno, 116, 'err.errno')
              })
          })
          .then(function () {
            // Fetch all of the devices for the account
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 1, 'devices length 1')

            // Attempt to fetch the session token that was associated with the deleted device
            return db.sessionWithDevice(newSessionTokenId)
          })
          .then(function () {
            assert(false, 'deleting the device should have deleted the session token')
          }, function (err) {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
          .then(function () {
            // Attempt to verify the session token that was associated with the deleted device
            return db.verifyTokens(newTokenVerificationId, { uid: ACCOUNT.uid })
          })
          .then(function () {
            assert(false, 'deleting the device should have deleted the unverified token')
          }, function (err) {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
          .then(function () {
            // Delete the second device
            return db.deleteDevice(ACCOUNT.uid, newDeviceId)
          })
          .then(function () {
            // Fetch all of the devices for the account
            return db.accountDevices(ACCOUNT.uid)
          })
          .then(function (devices) {
            assert.equal(devices.length, 0, 'devices length 0')
          })
      }
    )

    it(
      'db.resetAccount',
      () => {
        var account = createAccount()
        var uid = account.uid
        var createdAt = Date.now()
        var THROWAWAY_PASSWORD_FORGOT_TOKEN_ID = hex32()
        var THROWAWAY_PASSWORD_FORGOT_TOKEN = {
          data : hex32(),
          uid : uid,
          passCode : hex16(),
          tries : 1,
          createdAt: now
        }
        var THROWAWAY_ACCOUNT_RESET_TOKEN_ID = hex32()
        var THROWAWAY_ACCOUNT_RESET_TOKEN = {
          tokenId : THROWAWAY_ACCOUNT_RESET_TOKEN_ID,
          data : hex32(),
          uid : uid,
          createdAt: now + 4
        }
        var sessionToken = {
          data : hex32(),
          uid : account.uid,
          createdAt : now + 1,
          uaBrowser : 'mock browser',
          uaBrowserVersion : 'mock browser version',
          uaOS : 'mock OS',
          uaOSVersion : 'mock OS version',
          uaDeviceType : 'mock device type',
          mustVerify: true,
          tokenVerificationId : hex16()
        }

        return db.createAccount(account.uid, account)
          .then(function () {
            return db.createSessionToken(SESSION_TOKEN_ID, sessionToken)
          })
          .then(function() {
            return db.createDevice(account.uid, newUuid(), {
              sessionTokenId: SESSION_TOKEN_ID,
              createdAt: createdAt
            })
          })
          .then(function() {
            return db.createPasswordForgotToken(THROWAWAY_PASSWORD_FORGOT_TOKEN_ID, THROWAWAY_PASSWORD_FORGOT_TOKEN)
          })
          .then(function(passwordForgotToken) {
            return P.all([db.account(uid), db.accountEmails(uid)])
          })
          .spread(function(accountResult, emails) {
            // Account should be unverified
            assert.equal(!! accountResult.emailVerified, false, 'email is not verified')
            assert.equal(!! emails[0].isVerified, false, 'email is not verified')
            assert.equal(!! emails[0].isPrimary, true, 'email is primary')
            assert.equal(accountResult.email, emails[0].email, 'emails should match')

            return db.forgotPasswordVerified(THROWAWAY_PASSWORD_FORGOT_TOKEN_ID, THROWAWAY_ACCOUNT_RESET_TOKEN)
          })
          .then(function() {
            return P.all([db.account(uid), db.accountEmails(uid)])
          })
          .spread(function(accountResult, emails) {
            // Account should be verified
            assert.equal(!! accountResult.emailVerified, true, 'email is verified')
            assert.equal(!! emails[0].isVerified, true, 'email is verified')
            assert.equal(!! emails[0].isPrimary, true, 'email is primary')
            assert.equal(accountResult.email, emails[0].email, 'emails should match')
          })
          .then(function() {
            return db.resetAccount(uid, ACCOUNT)
          })
          .then(function() {
            return db.accountDevices(uid)
          })
          .then(function(devices) {
            assert.equal(devices.length, 0, 'The devices length should be zero')

            // Attempt to verify the session token
            return db.verifyTokens(sessionToken.tokenVerificationId, { uid: uid })
          })
          .then(function () {
            assert(false, 'Verifying deleted token should have failed')
          }, function (err) {
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')
          })
          .then(function() {
            // Attempt to fetch the session token
            return db.sessionToken(SESSION_TOKEN_ID)
          })
          .then(function () {
            assert(false, 'Fetching deleted token should have failed')
          }, function (err) {
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')
          })
          .then(function() {
            // account should STILL exist for this email address
            var emailBuffer = Buffer(account.email)
            return db.accountExists(emailBuffer)
          })
          .then(function(exists) {
            assert(exists, 'account still exists ok')
          }, function(err) {
            assert(false, 'the account for this email address should still exist')
          })
      }
    )

    it(
      'securityEvents',
      () => {

        function securityEvents(suite) {
          return suite.setUp().then(function () {
            delete suite.setUp

            var names = Object.keys(suite)

            function run () {
              var unit = names.shift()

              if (unit) {
                return suite[unit]().then(run)
              }
            }

            return run()
          })
        }

        function createSession (id, session) {
          return db.createSessionToken(id, session)
        }

        function verifySession (id, uid) {
          return db.verifyTokens(id, { uid: uid })
        }

        function deleteSession (id) {
          return db.deleteSessionToken(id)
        }

        function insert (uid, addr, name, session) {
          return db.createSecurityEvent({
            uid: uid,
            ipAddr: addr,
            name: name,
            tokenId: session
          })
        }

        function query (uid, addr, cb) {
          return function () {
            return db.securityEvents({
              id: uid,
              ipAddr: addr
            })
            .then(cb)
          }
        }

        var uid1 = ACCOUNT.uid
        var uid2 = newUuid()
        var addr1 = '127.0.0.1'
        var addr2 = '::127.0.0.2'

        var evA = 'account.login'
        var evB = 'account.create'
        var evC = 'account.reset'

        var sessionId1 = hex32()
        var sessionId2 = hex32()
        var sessionId3 = hex32()

        var session1 = {
          data: hex32(),
          uid: uid1,
          createdAt: Date.now(),
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaDeviceType: 'wibble',
          mustVerify: false,
          tokenVerificationId: hex16()
        }

        var session2 = {
          data: hex32(),
          uid: uid1,
          createdAt: Date.now(),
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaDeviceType: 'wibble'
          // no tokenVerificationId means verified
        }

        var session3 = {
          data: hex32(),
          uid: uid1,
          createdAt: Date.now(),
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaDeviceType: 'wibble',
          mustVerify: false,
          tokenVerificationId: hex16()
        }

        return securityEvents({
          setUp: function () {
            return P.all([
              createSession(sessionId1, session1),
              createSession(sessionId2, session2),
              createSession(sessionId3, session3)
            ])
            // Don't paralleize these, the order of them matters
            // because they record timestamps in the db.
            .then(function () {
              return insert(uid1, addr1, evA, sessionId2).delay(10)
            })
            .then(function () {
              return insert(uid1, addr1, evB, sessionId1).delay(10)
            })
            .then(function () {
              return insert(uid1, addr1, evC).delay(10)
            })
            .then(function () {
              return insert(uid1, addr2, evA, sessionId3).delay(10)
            })
            .then(function () {
              return insert(uid2, addr1, evA, hex32())
            })
          },

          testGetEvent: query(
            uid1, addr1,
            function (results) {
              assert.equal(results.length, 3, 'three events for uid and addr')
              // The most recent event is returned first.
              assert.equal(results[0].name, evC, 'correct event name')
              assert.equal(!! results[0].verified, true, 'event without a session is already verified')
              assert(results[0].createdAt < Date.now(), 'createdAt is set')
              assert.equal(results[1].name, evB, 'correct event name')
              assert.equal(!! results[1].verified, false, 'second session is not verified yet')
              assert(results[1].createdAt < results[0].createdAt, 'createdAt is lower than previous event')
              assert.equal(results[2].name, evA, 'correct event name')
              assert.equal(!! results[2].verified, true, 'first session is already verified')
              assert(results[2].createdAt < results[1].createdAt, 'createdAt is lower than previous event')
            }
          ),

          testGetEventAfterSessionVerified: function () {
            return verifySession(session1.tokenVerificationId, uid1)
              .then(query(uid1, addr1, function (results) {
                assert.equal(results.length, 3, 'three events for uid and addr')
                assert.equal(!! results[0].verified, true, 'first session verified')
                assert.equal(!! results[1].verified, true, 'second session verified')
                assert.equal(!! results[2].verified, true, 'third session verified')
              }))
          },

          testGetSecondAddr: query(
            uid1, addr2,
            function (results) {
              assert.equal(results.length, 1, 'one event for addr2')
              assert.equal(results[0].name, evA)
              assert.equal(!! results[0].verified, false, 'session3 not verified yet')
            }
          ),

          testGetSecondAddrAfterDeletingUnverifiedSession: function () {
            return deleteSession(sessionId3)
              .then(query(uid1, addr2, function (results) {
                assert.equal(results.length, 1, 'one event for addr2')
                assert.equal(results[0].name, evA)
                assert.equal(!! results[0].verified, false, 'session3 not verified yet')
              }))
          },

          testGetWithIPv6: query(
            uid1, '::' + addr1,
            function (results) {
              assert.equal(results.length, 3, 'three events for ipv6 addr')
            }
          ),

          testUnknownUid: query(
            newUuid(), addr1,
            function (results) {
              assert.equal(results.length, 0, 'no events for unknown uid')
            }
          )
        })
      }
    )

    it(
      'account deletion',
      () => {
        var uid = ACCOUNT.uid
        return db.deleteAccount(uid)
          .then(function() {
            // account should no longer exist for this email address
            var emailBuffer = Buffer(ACCOUNT.email)
            return db.accountExists(emailBuffer)
          })
          .then(function(exists) {
            assert(false, 'account should no longer exist for this email address')
          }, function(err) {
            // Fetch the session token with its verification state
            return db.sessionTokenWithVerificationStatus(SESSION_TOKEN_ID)
          })
          .then(function () {
            // Attempt to verify session token
            return db.verifyTokens(SESSION_TOKEN.tokenVerificationId, { uid: uid })
          })
          .then(function () {
            assert(false, 'Verifying deleted token should have failed')
          }, function (err) {
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')
          })
          .then(function() {
            // Attempt to fetch session token
            return db.sessionToken(SESSION_TOKEN_ID)
          })
          .then(function () {
            assert(false, 'Fetching deleted token should have failed')
          }, function (err) {
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')
          })
      }
    )

    it(
      'reminders - create and delete',
      () => {
        var fetchQuery = {
          type: 'second',
          reminderTime: 1,
          reminderTimeOutdated: 100,
          limit: 20
        }
        var account = createAccount()
        return db.createAccount(account.uid, account)
          .then(
            function () {
              return db.createVerificationReminder({
                uid: account.uid,
                type: 'second'
              })
            }
          )
          .then(
            function () {
              return P.delay(20).then(function () {
                return db.fetchReminders({}, fetchQuery)
              })
            }
          )
          .then(
            function (result) {
              assert.equal(result[0].type, 'second', 'correct type')
              assert.equal(result[0].uid.toString('hex'), account.uid.toString('hex'), 'correct uid')
            }
          )
          .then(
            function () {
              return db.fetchReminders({}, fetchQuery)
            }
          )
          .then(
            function (result) {
              assert.equal(result.length, 0, 'no more reminders')
            }
          )
      }
    )

    it(
      'reminders - multiple accounts',
      () => {
        var fetchQuery = {
          type: 'first',
          reminderTime: 1,
          reminderTimeOutdated: 3000,
          limit: 20
        }
        var account = createAccount()
        var account2 = createAccount()
        return db.createAccount(account.uid, account)
          .then(
            function () {
              return db.createAccount(account2.uid, account2)
            }
          )
          .then(
            function () {
              // create 'first' reminder for account one.
              return db.createVerificationReminder({
                uid: account.uid,
                type: 'first'
              })
            }
          )
          .then(
            function () {
              // create 'first' reminder for account two.
              return db.createVerificationReminder({
                uid: account2.uid,
                type: 'first'
              })
            }
          )
          .then(
            function () {
              return P.delay(20).then(function () {
                return db.fetchReminders({}, fetchQuery)
              })
            }
          )
          .then(
            function (result) {
              assert.equal(result.length, 2, 'correct size of result')
              assert.equal(result[0].type, 'first', 'correct type')
              assert.equal(result[1].type, 'first', 'correct type')
            }
          )
          .then(
            function () {
              return db.fetchReminders({}, fetchQuery)
            }
          )
          .then(
            function (result) {
              assert.equal(result.length, 0, 'no more first reminders')
            }
          )
      }
    )

    it(
      'reminders - multi fetch',
      () => {
        var fetchQuery = {
          type: 'first',
          reminderTime: 1,
          reminderTimeOutdated: 100,
          limit: 20
        }
        var account = createAccount()
        var account2 = createAccount()
        return db.createAccount(account.uid, account)
          .then(
            function () {
              return db.createAccount(account2.uid, account2)
            }
          )
          .then(
            function () {
              // create 'first' reminder for account one.
              return db.createVerificationReminder({
                uid: account.uid,
                type: 'first'
              })
            }
          )
          .then(
            function () {
              // create 'first' reminder for account two.
              return db.createVerificationReminder({
                uid: account2.uid,
                type: 'first'
              })
            }
          )
          .then(
            function () {
              return P.delay(20).then(function () {
                return P.all([
                  // only one query should give results
                  db.fetchReminders({}, fetchQuery),
                  db.fetchReminders({}, fetchQuery),
                  db.fetchReminders({}, fetchQuery),
                  db.fetchReminders({}, fetchQuery),
                  db.fetchReminders({}, fetchQuery),
                  db.fetchReminders({}, fetchQuery),
                  db.fetchReminders({}, fetchQuery),
                  db.fetchReminders({}, fetchQuery),
                  db.fetchReminders({}, fetchQuery),
                  db.fetchReminders({}, fetchQuery)
                ])
              })
            }
          )
          .then(
            function (results) {
              var found = 0
              results.forEach((result) => {
                if (result.length === 2) {
                  found++
                }
              })

              assert.equal(found, 1, 'only one query has the result')
            }
          )
      }
    )

    it(
      'unblockCodes',
      () => {
        var uid1 = newUuid()
        var code1 = unblockCode()

        return db.consumeUnblockCode(uid1, code1)
          .then(
            function () {
              assert(false, 'consuming unknown code should error')
            },
            function (err) {
              return db.createUnblockCode(uid1, code1)
            }
          )
          .then(
            function () {
              return db.consumeUnblockCode(uid1, code1)
            }
          )
          .then(
            function (code) {
              assert(code.createdAt <= Date.now(), 'returns unblock code timestamp')
              return db.consumeUnblockCode(uid1, code1)
            }
          )
          .then(
            function () {
              assert(false, 'consumed unblock code should not be able to consume again')
            },
            function (err) {
              // consume a consumed code errors
            }
          )
      }
    )

    it(
      'emailBounces',
      () => {
        const data = {
          email: ('' + Math.random()).substr(2) + '@email.bounces',
          bounceType: 'Permanent',
          bounceSubType: 'NoEmail'
        }
        return db.createEmailBounce(data)
          .then(() => {
            return db.fetchEmailBounces(data.email)
          })
          .then(bounces => {
            assert.equal(bounces.length, 1)
            assert.equal(bounces[0].email, data.email)
            assert.equal(bounces[0].bounceType, 1)
            assert.equal(bounces[0].bounceSubType, 3)
          })
      }
    )

    it(
      'emails',
      () => {
        const account = createAccount()
        account.emailVerified = true

        var secondEmail = createEmail({
          uid: account.uid
        })

        /**
         * This sequence of tests, test the happy path of adding an
         * additional email.
         *
         * 1) Create an account
         * 2) Get `accountEmails` only returns email on account table
         * 3) Add an additional email
         * 4) Get `accountEmails` returns both emails
         * 5) Get `getSecondaryEmail` returns specified email on emails table
         * 5) Verify secondary email
         * 6) Get `accountEmails` returns both emails, shows verified
         * 7) Delete secondary email
         * 8) Get `accountEmails` only return email on account table
         * 9) Can create account from deleted account's secondary email
         * 10) Can reuse secondary email from deleted account
         *
         */
        // Lets begin our journey by creating a new account.
        return db.createAccount(account.uid, account)
          .then(function (result) {
            assert.deepEqual(result, {}, 'Returned an empty object on account creation')

            // Attempt to add a new email address to this user's account.
            // At this point we should only have one email address returned, which
            // should be the email on the accounts table.
            return db.accountEmails(account.uid)
          })
          .then(
            function(result) {
              assert.equal(result.length, 1, 'one email returned')

              // Check first email is email from accounts table
              assert.equal(result[0].email, account.email, 'matches account email')
              assert.equal(!! result[0].isPrimary, true, 'isPrimary is true on account email')
              assert.equal(!! result[0].isVerified, account.emailVerified, 'matches account emailVerified')

              // Attempt to create an additional email for this user account.
              return db.createEmail(account.uid, secondEmail)
            }
          )
          .then(function (result) {
            assert.deepEqual(result, {}, 'Returned an empty object on email creation')

            // Check that second email was added to account.
            return db.accountEmails(account.uid)
          })
          .then(
            function(result) {
              assert.equal(result.length, 2, 'two emails returned')

              // Check first email is email from accounts table
              assert.equal(result[0].email, account.email, 'matches account email')
              assert.equal(!! result[0].isPrimary, true, 'isPrimary is true on account email')
              assert.equal(!! result[0].isVerified, account.emailVerified, 'matches account emailVerified')

              // Check second email is from emails table
              assert.equal(result[1].email, secondEmail.email, 'matches secondEmail email')
              assert.equal(!! result[1].isPrimary, false, 'isPrimary is false on secondEmail email')
              assert.equal(!! result[1].isVerified, secondEmail.isVerified, 'matches secondEmail isVerified')

              // Get a specific email
              return db.getSecondaryEmail(secondEmail.email)
            }
          )
          .then(
            function(result) {
              assert.equal(result.email, secondEmail.email, 'matches secondEmail email')
              assert.equal(!! result.isPrimary, false, 'isPrimary is false on secondEmail email')
              assert.equal(!! result.isVerified, secondEmail.isVerified, 'matches secondEmail isVerified')

              // Verify second email
              return db.verifyEmail(secondEmail.uid, secondEmail.emailCode)
            }
          )
          .then(
            function(result) {
              assert.deepEqual(result, {}, 'Returned an empty object on email verification')

              // Get all emails and check to see if second email has been marked verified
              return db.accountEmails(account.uid)
            }
          )
          .then(
            function(result) {
              assert.equal(result.length, 2, 'two email returned')

              // Check second email is from emails table and verified
              assert.equal(result[1].email, secondEmail.email, 'matches secondEmail email')
              assert.equal(!! result[1].isPrimary, false, 'isPrimary is false on secondEmail email')
              assert.equal(!! result[1].isVerified, true, 'secondEmail isVerified is true')

              // Remove additional email from account
              return db.deleteEmail(secondEmail.uid, secondEmail.email)
            }
          )
          .then(
            function(result) {
              assert.deepEqual(result, {}, 'Returned an empty object on email deletion')

              // Get all emails and check to see if it has been removed
              return db.accountEmails(account.uid)
            }
          )
          .then(
            function(result) {
              // Verify that the email has been removed
              assert.equal(result.length, 1, 'one email returned')

              // Only email returned should be from users account
              assert.equal(result[0].email, account.email, 'matches account email')
              assert.equal(!! result[0].isPrimary, true, 'isPrimary is true on account email')
              assert.equal(!! result[0].isVerified, account.emailVerified, 'matches account emailVerified')

              return P.resolve()
            }
          )
          .then(
            function() {
              // Can create an account from a deleted account's secondary email
              const testAccount = createAccount()
              testAccount.emailVerified = true

              const testSecondaryEmail = createEmail({
                uid: testAccount.uid,
                isVerified: true
              })

              return db.createAccount(testAccount.uid, testAccount)
                .then(function () {
                  return db.createEmail(testAccount.uid, testSecondaryEmail)
                })
                .then(function () {
                  return db.deleteAccount(testAccount.uid)
                })
                .then(function () {
                  testAccount.email = testSecondaryEmail.email
                  testAccount.normalizedEmail = testSecondaryEmail.normalizedEmail

                  // Create new account with secondary email that was deleted
                  return db.createAccount(testAccount.uid, testAccount)
                })
                .then(function (res) {
                  assert.deepEqual(res, {}, 'successfully created an account')

                  // Attempt to create secondary email address
                  return db.createEmail(testAccount.uid, testSecondaryEmail)
                    .then(
                      () => {
                        assert(false, 'Should not have created secondary email')
                      },
                      (err) => {
                        assert.equal(err.errno, 101, 'Correct errno')
                      }
                    )
                })
            }
          )
          .then(
            function() {
              // Ensure that secondary emails get removed from an account
              // when account is deleted and that it can be reused
              // in another account
              const testAccount = createAccount()
              testAccount.emailVerified = true

              const testAccount2 = createAccount()
              testAccount2.emailVerified = true

              const testSecondaryEmail = createEmail({
                uid: testAccount.uid,
                isVerified: true
              })

              return db.createAccount(testAccount.uid, testAccount)
                .then(function () {
                  return db.createEmail(testAccount.uid, testSecondaryEmail)
                })
                .then(function () {
                  return db.deleteAccount(testAccount.uid)
                })
                .then(function () {
                  // Create new account and attempt to add secondary email
                  // that was deleted
                  return db.createAccount(testAccount2.uid, testAccount2)
                })
                .then(function (res) {
                  assert.deepEqual(res, {}, 'successfully created an account')
                  testSecondaryEmail.uid = testAccount2.uid
                  return db.createEmail(testAccount2.uid, testSecondaryEmail)
                })
                .then((res) => {
                  assert.deepEqual(res, {}, 'successfully created an secondary email on new account')
                })
            }
          )
          .then(() => {
            /**
             * This sequence of code tests the failure paths
             *
             * 1) Can not add an an email that exits in emails table or accounts table
             * 2) Can not delete primary email
             * 3) Can not create an new account that has an email in the emails table
             * 4) Can not get non-existent secondary email
             */

            // Attempt to add the account email to the emails table.
            const anotherEmail = createEmail({email: account.email})
            return db.createEmail(account.uid, anotherEmail)
              .then(
                () => {
                  assert(false, 'Failed to throw error for creating an already existing email.')
                },
                err => {
                  assert.equal(err.errno, 101, 'should return duplicate entry errno')
                  assert.equal(err.code, 409, 'should return duplicate entry code')
                }
              )
              .then(() => {
                // Attempt to add duplicate email to emails table
                const anotherEmail = createEmail({email: secondEmail.email})
                return db.createEmail(account.uid, anotherEmail)
                  .then(function (result) {
                    assert.deepEqual(result, {}, 'Returned an empty object on email creation')
                    return db.createEmail(account.uid, anotherEmail)
                      .then(
                        () => {
                          assert(false, 'Failed to throw error for creating an already existing email.')
                        },
                        err => {
                          assert.equal(err.errno, 101, 'should return duplicate entry errno')
                          assert.equal(err.code, 409, 'should return duplicate entry code')
                        }
                      )
                  })
              })
              .then(() => {
                // Attempt to delete a primary email
                return db.deleteEmail(account.uid, account.normalizedEmail)
                  .then(
                    () => {
                      assert(false, 'Failed to not delete a primary email')
                    },
                    err => {
                      assert.equal(err.errno, 136, 'should return email delete errno')
                      assert.equal(err.code, 400, 'should return email delete code')
                    }
                  )
              })
              .then(() => {
                // Attempt to create a new account with an existing email in the emails table
                const anotherAccount = createAccount()
                anotherAccount.email = secondEmail.email
                anotherAccount.normalizedEmail = secondEmail.normalizedEmail
                anotherAccount.emailVerified = true

                return db.createAccount(anotherAccount.uid, anotherAccount)
                  .then(
                    () => {
                      assert(false, 'Failed to not created account with duplicate email')
                    },
                    err => {
                      assert.equal(err.errno, 101, 'should return duplicate entry errno')
                      assert.equal(err.code, 409, 'should return duplicate entry code')
                    }
                  )
              })
              .then(() => {
                // Attempt to get a non-existent email
                return db.getSecondaryEmail('non-existent@email.com')
                  .then(
                    () => {
                      assert(false, 'Failed to not get a non-existent email')
                    },
                    (err) => {
                      assert.equal(err.errno, 116, 'should return not found errno')
                      assert.equal(err.code, 404, 'should return not found code')
                    }
                  )
              })
          })
      }
    )

    it('sign-in codes', () => {
      const SIGNIN_CODES = [ hex6(), hex6(), hex6() ]
      const NOW = Date.now()
      const TIMESTAMPS = [ NOW - 1, NOW - 2, NOW - config.signinCodesMaxAge - 1 ]
      const FLOW_IDS = [ hex32(), hex32(), hex32() ]

      // Create an account
      return db.createAccount(ACCOUNT.uid, ACCOUNT)
        // Create 3 sign-in codes, two fresh and the other expired
        .then(() => P.all([
          db.createSigninCode(SIGNIN_CODES[0], ACCOUNT.uid, TIMESTAMPS[0], FLOW_IDS[0]),
          db.createSigninCode(SIGNIN_CODES[1], ACCOUNT.uid, TIMESTAMPS[1], FLOW_IDS[1]),
          db.createSigninCode(SIGNIN_CODES[2], ACCOUNT.uid, TIMESTAMPS[2], FLOW_IDS[2])
        ]))
        .then(results => {
          results.forEach(r => assert.deepEqual(r, {}, 'createSigninCode should return an empty object'))

          // Attempt to create a duplicate code
          return db.createSigninCode(SIGNIN_CODES[0], ACCOUNT.uid, TIMESTAMPS[0])
            .then(
              () => assert(false, 'db.createSigninCode should fail for duplicate codes'),
              err => {
                assert(err, 'db.createSigninCode should reject with an error')
                assert.equal(err.code, 409, 'db.createSigninCode should reject with code 404')
                assert.equal(err.errno, 101, 'db.createSigninCode should reject with errno 116')
              }
            )
        })
        .then(() => {
          // Consume a fresh code
          return db.consumeSigninCode(SIGNIN_CODES[0])
        })
        .then(result => {
          assert.deepEqual(result, {
            email: ACCOUNT.email,
            flowId: FLOW_IDS[0]
          }, 'db.consumeSigninCode should return an email address and flowId for non-expired codes')

          // Attempt to re-consume the consumed code
          return db.consumeSigninCode(SIGNIN_CODES[0])
            .then(
              () => assert(false, 'db.consumeSigninCode should fail for consumed codes'),
              err => {
                assert(err, 'db.consumeSigninCode should reject with an error')
                assert.equal(err.code, 404, 'db.consumeSigninCode should reject with code 404')
                assert.equal(err.errno, 116, 'db.consumeSigninCode should reject with errno 116')
              }
            )
        })
        .then(() => {
          // Attempt to consume the expired code
          return db.consumeSigninCode(SIGNIN_CODES[2])
            .then(
              () => assert(false, 'db.consumeSigninCode should fail for expired codes'),
              err => {
                assert(err, 'db.consumeSigninCode should reject with an error')
                assert.equal(err.code, 404, 'db.consumeSigninCode should reject with code 404')
                assert.equal(err.errno, 116, 'db.consumeSigninCode should reject with errno 116')
              }
            )
        })
        // Clean up the account
        .then(() => db.deleteAccount(ACCOUNT.uid))
        .then(() => {
          // Attempt to use an unused fresh code associated with a deleted account
          return db.consumeSigninCode(SIGNIN_CODES[1])
            .then(
              () => assert(false, 'db.consumeSigninCode should fail for deleted accounts'),
              err => {
                assert(err, 'db.consumeSigninCode should reject with an error')
                assert.equal(err.code, 404, 'db.consumeSigninCode should reject with code 404')
                assert.equal(err.errno, 116, 'db.consumeSigninCode should reject with errno 116')
              }
            )
        })
    })

    it('email on account/email table in sync', () => {
      const account = createAccount()

      return db.createAccount(account.uid, account)
        .then(function (result) {
          assert.deepEqual(result, {}, 'returned empty response on account creation')
          return P.all([db.accountEmails(account.uid), db.account(account.uid)])
        })
        .spread(function (emails, account) {
          assert.equal(emails[0].email, account.email, 'correct email returned')
          assert.equal(!! emails[0].isVerified, !! account.emailVerified, 'correct email verification')
          assert.equal(!! emails[0].isPrimary, true, 'correct email primary')

          // Verify account email
          return db.verifyEmail(account.uid, account.emailCode)
        })
        .then(function (result) {
          assert.deepEqual(result, {}, 'returned empty response on verify email')
          return P.all([db.accountEmails(account.uid), db.account(account.uid)])
        })
        .spread(function (emails, account) {
          assert.equal(emails[0].email, account.email, 'correct email returned')
          assert.equal(!! emails[0].isVerified, !! account.emailVerified, 'correct email verification')
          assert.equal(!! emails[0].isPrimary, true, 'correct email primary')
        })
    })

    describe('db.resetAccountTokens', () => {
      let account, passwordChangeToken, passwordChangeTokenId, passwordForgotToken, passwordForgotTokenId,
        accountResetToken

      before(() => {
        account = createAccount()
        account.emailVerified = true
        passwordChangeToken = {
          data: hex32(),
          uid: account.uid,
          createdAt: now + 4
        }
        passwordChangeTokenId = hex32()
        passwordForgotToken = {
          data: hex32(),
          uid: account.uid,
          passCode: hex16(),
          tries: 1,
          createdAt: Date.now()
        }
        passwordForgotTokenId = hex32()
        accountResetToken = {
          tokenId: passwordForgotTokenId,
          data: hex32(),
          uid: account.uid,
          createdAt: now + 5
        }

        return db.createAccount(account.uid, account)
      })

      it('should remove account reset tokens', () => {
        return db.createPasswordForgotToken(passwordForgotTokenId, passwordForgotToken)
          .then(() => {
            // db.forgotPasswordVerified requires a passwordForgotToken to have been made
            return db.forgotPasswordVerified(passwordForgotTokenId, accountResetToken)
              .then(() => {
                return db.accountResetToken(passwordForgotTokenId)
                  .then((res) => {
                    assert.deepEqual(res.uid, account.uid, 'token belongs to account')
                  })
              })
          })
          .then(() => {
            return db.resetAccountTokens(account.uid)
          })
          .then(() => {
            return db.accountResetToken(passwordForgotTokenId)
              .then(() => {
                assert.equal(false, 'should not have return account reset token token')
              })
              .catch((err) => {
                assert.equal(err.errno, 116, 'did not find password change token')
              })
          })
      })

      it('should remove password change tokens', () => {
        return db.createPasswordChangeToken(passwordChangeTokenId, passwordChangeToken)
          .then(() => {
            return db.passwordChangeToken(passwordChangeTokenId)
              .then((res) => {
                assert.deepEqual(res.uid, account.uid, 'token belongs to account')
              })
          })
          .then(() => {
            return db.resetAccountTokens(account.uid)
          })
          .then(() => {
            return db.passwordChangeToken(passwordChangeTokenId)
              .then(() => {
                assert.equal(false, 'should not have return password change token')
              })
              .catch((err) => {
                assert.equal(err.errno, 116, 'did not find password change token')
              })
          })
      })

      it('should remove password forgot tokens', () => {
        return db.createPasswordForgotToken(passwordForgotTokenId, passwordForgotToken)
          .then(() => {
            return db.passwordForgotToken(passwordForgotTokenId)
              .then((res) => {
                assert.deepEqual(res.uid, account.uid, 'token belongs to account')
              })
          })
          .then(() => {
            return db.resetAccountTokens(account.uid)
          })
          .then(() => {
            return db.passwordForgotToken(passwordForgotTokenId)
              .then(() => {
                assert.equal(false, 'should not have return password forgot token')
              })
              .catch((err) => {
                assert.equal(err.errno, 116, 'did not find password forgot token')
              })
          })
      })
    })

    describe('change email', () => {
      let account, secondEmail

      before(() => {
        account = createAccount()
        account.emailVerified = true
        secondEmail = createEmail({
          uid: account.uid,
          isVerified: true
        })
        return db.createAccount(account.uid, account)
          .then(function () {
            return db.createEmail(account.uid, secondEmail)
          })
          .then(function (result) {
            assert.deepEqual(result, {}, 'Returned an empty object on email creation')
            return db.accountEmails(account.uid)
          })
          .then(function (res) {
            assert.deepEqual(res.length, 2, 'Returns correct amount of emails')
            assert.equal(res[0].email, account.email, 'primary email is the address that was used to create account')
            assert.deepEqual(res[0].emailCode, account.emailCode, 'correct emailCode')
            assert.equal(!! res[0].isVerified, true, 'correct verification set')
            assert.equal(!! res[0].isPrimary, true, 'isPrimary is true')

            assert.equal(res[1].email, secondEmail.email, 'primary email is the address that was used to create account')
            assert.deepEqual(res[1].emailCode, secondEmail.emailCode, 'correct emailCode')
            assert.equal(!! res[1].isVerified, true, 'correct verification set')
            assert.equal(!! res[1].isPrimary, false, 'isPrimary is false')
          })
      })

      it('should change a user\'s email', () => {
        return db.setPrimaryEmail(account.uid, secondEmail.email)
          .then(function (res) {
            assert.deepEqual(res, {}, 'Returned an empty object on email change')
            return db.accountEmails(account.uid)
          })
          .then(function (res) {
            assert.deepEqual(res.length, 2, 'Returns correct amount of emails')

            assert.equal(res[0].email, secondEmail.email, 'primary email is the secondary email address')
            assert.deepEqual(res[0].emailCode, secondEmail.emailCode, 'correct emailCode')
            assert.equal(!! res[0].isVerified, secondEmail.isVerified, 'correct verification set')
            assert.equal(!! res[0].isPrimary, true, 'isPrimary is true')

            assert.equal(res[1].email, account.email, 'should equal account email')
            assert.deepEqual(res[1].emailCode, account.emailCode, 'correct emailCode')
            assert.equal(!! res[1].isVerified, account.emailVerified, 'correct verification set')
            assert.equal(!! res[1].isPrimary, false, 'isPrimary is false')

            // Verify correct email set in session
            const sessionToken = makeMockSessionToken(account.uid)
            return db.createSessionToken(SESSION_TOKEN_ID, sessionToken)
              .then(() => {
                return P.all([db.sessionToken(SESSION_TOKEN_ID), db.sessionTokenWithVerificationStatus(SESSION_TOKEN_ID)])
              })
          })
          .then((res) => {
            res.forEach((session) => {
              assert.equal(session.email, secondEmail.email, 'should equal new primary email')
              assert.deepEqual(session.emailCode, secondEmail.emailCode, 'should equal new primary emailCode')
              assert.deepEqual(session.uid, account.uid, 'should equal account uid')
            })
            return P.all([db.accountRecord(secondEmail.email), db.accountRecord(account.email)])
          })
          .then((res) => {
            assert.deepEqual(res[0], res[1], 'should return the same account record regardless of email used')
            assert.deepEqual(res[0].primaryEmail, secondEmail.email, 'primary email should be set to update email')
            assert.ok(res[0].createdAt, 'should set createdAt')
            assert.deepEqual(res[0].createdAt, res[1].createdAt, 'account records should have the same createdAt')
          })
      })
    })

    describe('db.verifyTokenCode', () => {
      let account, anotherAccount, sessionToken, tokenVerificationCode, tokenId
      before(() => {
        account = createAccount()
        account.emailVerified = true
        return db.createAccount(account.uid, account)
      })

      it('should verify tokenVerificationCode', () => {
        tokenId = hex32()
        sessionToken = makeMockSessionToken(account.uid)
        tokenVerificationCode = sessionToken.tokenVerificationCode
        return db.createSessionToken(tokenId, sessionToken)
          .then(() => {
            return db.sessionTokenWithVerificationStatus(tokenId)
          })
          .then((session) => {
            // Returns unverified session
            assert.equal(session.mustVerify, sessionToken.mustVerify, 'mustVerify must match sessionToken')
            assert.equal(session.tokenVerificationId.toString('hex'), sessionToken.tokenVerificationId.toString('hex'), 'tokenVerificationId must match sessionToken')
            assert.ok(session.tokenVerificationCodeHash, 'tokenVerificationCodeHash exists')
            assert.equal(session.tokenVerificationCodeExpiresAt, sessionToken.tokenVerificationCodeExpiresAt, 'tokenVerificationCodeExpiresAt must match sessionToken')

            // Verify the session
            return db.verifyTokenCode({code: tokenVerificationCode}, account)
          })
          .then(() => {
            return db.sessionTokenWithVerificationStatus(tokenId)
          })
          .then((session) => {
            // Returns verified session
            assert.equal(session.mustVerify, null, 'mustVerify is not set')
            assert.equal(session.tokenVerificationId, null, 'tokenVerificationId is not set')
            assert.equal(session.tokenVerificationCodeHash, null, 'tokenVerificationCodeHash is not set')
            assert.equal(session.tokenVerificationCodeExpiresAt, null, 'tokenVerificationCodeExpiresAt is not set')
          })
      })

      it('shouldn\'t verify expired tokenVerificationCode', () => {
        tokenId = hex32()
        sessionToken = makeMockSessionToken(account.uid)
        sessionToken.tokenVerificationCodeExpiresAt = Date.now() - 2000000000
        tokenVerificationCode = sessionToken.tokenVerificationCode
        return db.createSessionToken(tokenId, sessionToken)
          .then(() => {
            return db.verifyTokenCode({code: tokenVerificationCode}, account)
              .then(() => {
                assert.fail('should not have verified expired token')
              }, (err) => {
                assert.equal(err.errno, 137, 'correct errno, not found')
              })
          })
      })

      it('shouldn\'t verify unknown tokenVerificationCode', () => {
        tokenId = hex32()
        sessionToken = makeMockSessionToken(account.uid)
        tokenVerificationCode = 'iamzinvalidz'
        return db.createSessionToken(tokenId, sessionToken)
          .then(() => {
            return db.verifyTokenCode({code: tokenVerificationCode}, account)
              .then(() => {
                assert.fail('should not have verified unknown token')
              }, (err) => {
                assert.equal(err.errno, 116, 'correct errno, not found')
              })
          })
      })

      it('shouldn\'t verify tokenVerificationCode and uid mismatch', () => {
        tokenId = hex32()
        sessionToken = makeMockSessionToken(account.uid)
        tokenVerificationCode = sessionToken.tokenVerificationCode
        anotherAccount = createAccount()
        anotherAccount.emailVerified = true
        return db.createAccount(anotherAccount.uid, anotherAccount)
          .then(() => {
            return db.createSessionToken(tokenId, sessionToken)
          })
          .then(() => {
            return db.verifyTokenCode({code: tokenVerificationCode}, anotherAccount)
              .then(() => {
                assert.fail('should not have verified unknown token')
              }, (err) => {
                assert.equal(err.errno, 116, 'correct errno, not found')
              })
          })
      })

    })

    after(() => db.close())
  })
}
