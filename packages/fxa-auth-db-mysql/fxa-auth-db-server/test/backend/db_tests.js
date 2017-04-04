/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test
var crypto = require('crypto')
var base64url = require('base64url')
var P = require('bluebird')

var zeroBuffer16 = Buffer.from('00000000000000000000000000000000', 'hex')
var zeroBuffer32 = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
var now = Date.now()

function newUuid() {
  return crypto.randomBytes(16)
}

function unblockCode() {
  return crypto.randomBytes(4).toString('hex')
}

function createAccount() {
  var account = {
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
  var email = {
    email: ('' + Math.random()).substr(2) + '@bar.com',
    uid: data.uid,
    emailCode: data.emailCode || crypto.randomBytes(16),
    isVerified: false,
    isPrimary: false,
    createdAt: Date.now()
  }
  email.email = data.email || email.email
  email.normalizedEmail = email.email.toLowerCase()

  return email
}


var ACCOUNT = createAccount()

function hex(len) {
  return Buffer(crypto.randomBytes(len).toString('hex'), 'hex')
}
function hex16() { return hex(16) }
function hex32() { return hex(32) }
// function hex64() { return hex(64) }
function hex96() { return hex(96) }

function base64(len) {
  return base64url(crypto.randomBytes(len))
}

function base64_16() { return base64(16) }
function base64_65() { return base64(65) }

var SESSION_TOKEN_ID = hex32()
var SESSION_TOKEN = {
  data : hex32(),
  uid : ACCOUNT.uid,
  createdAt : now + 1,
  uaBrowser : 'mock browser',
  uaBrowserVersion : 'mock browser version',
  uaOS : 'mock OS',
  uaOSVersion : 'mock OS version',
  uaDeviceType : 'mock device type',
  mustVerify: true,
  tokenVerificationId : hex16()
}

var KEY_FETCH_TOKEN_ID = hex32()
var KEY_FETCH_TOKEN = {
  authKey : hex32(),
  uid : ACCOUNT.uid,
  keyBundle : hex96(),
  createdAt : now + 2,
  tokenVerificationId : hex16()
}

var PASSWORD_FORGOT_TOKEN_ID = hex32()
var PASSWORD_FORGOT_TOKEN = {
  data : hex32(),
  uid : ACCOUNT.uid,
  passCode : hex16(),
  tries : 1,
  createdAt: now + 3
}

var PASSWORD_CHANGE_TOKEN_ID = hex32()
var PASSWORD_CHANGE_TOKEN = {
  data : hex32(),
  uid : ACCOUNT.uid,
  createdAt: now + 4
}

var ACCOUNT_RESET_TOKEN_ID = hex32()
var ACCOUNT_RESET_TOKEN = {
  tokenId : ACCOUNT_RESET_TOKEN_ID,
  data : hex32(),
  uid : ACCOUNT.uid,
  createdAt: now + 5
}

// To run these tests from a new backend, pass the config and an already created
// DB API for them to be run against.
module.exports = function(config, DB) {
  DB.connect(config)
    .then(
      function (db) {

        test(
          'ping',
          function (t) {
            t.plan(1)
            return db.ping()
            .then(function(account) {
              t.pass('Got the ping ok')
            }, function(err) {
              t.fail('Should not have arrived here')
            })
          }
        )

        test(
          'account creation and password checking',
          function (t) {
            t.plan(41)
            var emailBuffer = Buffer(ACCOUNT.email)
            return db.accountExists(emailBuffer)
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
              var emailBuffer = Buffer(ACCOUNT.email)
              return db.accountExists(emailBuffer)
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
              t.notOk(account.verifyHash, 'verifyHash field should be absent')
              t.deepEqual(account.authSalt, ACCOUNT.authSalt, 'authSalt')
              t.equal(account.verifierVersion, ACCOUNT.verifierVersion, 'verifierVersion')
              t.equal(account.createdAt, ACCOUNT.createdAt, 'createdAt')
              t.equal(account.verifierSetAt, account.createdAt, 'verifierSetAt has been set to the same as createdAt')
              t.equal(account.locale, ACCOUNT.locale, 'locale')
            })
            .then(function() {
              t.pass('Checking bad password')
              return db.checkPassword(ACCOUNT.uid, {verifyHash: Buffer(crypto.randomBytes(32))})
            })
            .then(function() {
              t.fail('password check should fail')
            }, function(err) {
              t.ok(err, 'incorrect password produces an error')
              t.equal(err.code, 400, 'error code')
              t.equal(err.errno, 103, 'error errno')
              t.equal(err.message, 'Incorrect password', 'message')
              t.equal(err.error, 'Bad request', 'error')
            })
            .then(function() {
              t.pass('Checking password')
              return db.checkPassword(ACCOUNT.uid, {verifyHash: zeroBuffer32})
            })
            .then(function(account) {
              t.deepEqual(account.uid, ACCOUNT.uid, 'uid')
              t.equal(Object.keys(account).length, 1, 'Only one field (uid) was returned, nothing else')
            })
            .then(function() {
              t.pass('Retrieving account using email')
              var emailBuffer = Buffer(ACCOUNT.email)
              return db.emailRecord(emailBuffer)
            })
            .then(function(account) {
              t.deepEqual(account.uid, ACCOUNT.uid, 'uid')
              t.equal(account.email, ACCOUNT.email, 'email')
              t.deepEqual(account.emailCode, ACCOUNT.emailCode, 'emailCode')
              t.equal(!!account.emailVerified, ACCOUNT.emailVerified, 'emailVerified')
              t.deepEqual(account.kA, ACCOUNT.kA, 'kA')
              t.deepEqual(account.wrapWrapKb, ACCOUNT.wrapWrapKb, 'wrapWrapKb')
              t.notOk(account.verifyHash, 'verifyHash field should be absent')
              t.deepEqual(account.authSalt, ACCOUNT.authSalt, 'authSalt')
              t.equal(account.verifierVersion, ACCOUNT.verifierVersion, 'verifierVersion')
              t.equal(account.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt')
              // locale not returned with .emailRecord() (unlike .account() when it is)
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
                t.equal(err.code, 409, 'error code')
                t.equal(err.errno, 101, 'error errno')
                t.equal(err.message, 'Record already exists', 'message')
                t.equal(err.error, 'Conflict', 'error')
              }
            )
          }
        )

        test(
          'session token handling',
          function (t) {
            t.plan(123)

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
              mustVerify: false,
              tokenVerificationId: hex16()
            }
            var DEVICE_ID = newUuid()

            // Fetch all of the sessions tokens for the account
            return db.sessions(ACCOUNT.uid)
              .then(function(sessions) {
                t.ok(Array.isArray(sessions), 'sessions is an array')
                t.equal(sessions.length, 0, 'sessions is empty')
                // Create a session token
                return db.createSessionToken(SESSION_TOKEN_ID, SESSION_TOKEN)
              })
              .then(function(result) {
                t.deepEqual(result, {}, 'Returned an empty object on session token creation')

                // Fetch all of the sessions tokens for the account
                return db.sessions(ACCOUNT.uid)
              })
              .then(function (sessions) {
                t.equal(sessions.length, 1, 'sessions contains one item')
                t.equal(Object.keys(sessions[0]).length, 16, 'session has correct properties')
                t.equal(sessions[0].tokenId.toString('hex'), SESSION_TOKEN_ID.toString('hex'), 'tokenId is correct')
                t.equal(sessions[0].uid.toString('hex'), ACCOUNT.uid.toString('hex'), 'uid is correct')
                t.equal(sessions[0].createdAt, SESSION_TOKEN.createdAt, 'createdAt is correct')
                t.equal(sessions[0].uaBrowser, SESSION_TOKEN.uaBrowser, 'uaBrowser is correct')
                t.equal(sessions[0].uaBrowserVersion, SESSION_TOKEN.uaBrowserVersion, 'uaBrowserVersion is correct')
                t.equal(sessions[0].uaOS, SESSION_TOKEN.uaOS, 'uaOS is correct')
                t.equal(sessions[0].uaOSVersion, SESSION_TOKEN.uaOSVersion, 'uaOSVersion is correct')
                t.equal(sessions[0].uaDeviceType, SESSION_TOKEN.uaDeviceType, 'uaDeviceType is correct')
                t.equal(sessions[0].lastAccessTime, SESSION_TOKEN.createdAt, 'lastAccessTime is correct')

                // Fetch the session token
                return db.sessionToken(SESSION_TOKEN_ID)
              })
              .then(function(token) {
                // tokenId is not returned from db.sessionToken()
                t.deepEqual(token.tokenData, SESSION_TOKEN.data, 'token data matches')
                t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
                t.equal(token.createdAt, SESSION_TOKEN.createdAt, 'createdAt is correct')
                t.equal(token.uaBrowser, SESSION_TOKEN.uaBrowser, 'uaBrowser is correct')
                t.equal(token.uaBrowserVersion, SESSION_TOKEN.uaBrowserVersion, 'uaBrowserVersion is correct')
                t.equal(token.uaOS, SESSION_TOKEN.uaOS, 'uaOS is correct')
                t.equal(token.uaOSVersion, SESSION_TOKEN.uaOSVersion, 'uaOSVersion is correct')
                t.equal(token.uaDeviceType, SESSION_TOKEN.uaDeviceType, 'uaDeviceType is correct')
                t.equal(token.lastAccessTime, SESSION_TOKEN.createdAt, 'lastAccessTime was set')
                t.equal(!!token.emailVerified, ACCOUNT.emailVerified, 'token emailVerified is same as account emailVerified')
                t.equal(token.email, ACCOUNT.email, 'token email same as account email')
                t.deepEqual(token.emailCode, ACCOUNT.emailCode, 'token emailCode same as account emailCode')
                t.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is correct')
                t.equal(token.accountCreatedAt, ACCOUNT.createdAt, 'accountCreatedAt is correct')

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
                t.deepEqual(result, {}, 'Returned an empty object on session token update')

                // Fetch all of the sessions tokens for the account
                return db.sessions(ACCOUNT.uid)
              })
              .then(function (sessions) {
                t.equal(sessions.length, 1, 'sessions still contains one item')
                t.equal(sessions[0].tokenId.toString('hex'), SESSION_TOKEN_ID.toString('hex'), 'tokenId is correct')
                t.equal(sessions[0].uid.toString('hex'), ACCOUNT.uid.toString('hex'), 'uid is correct')
                t.equal(sessions[0].createdAt, SESSION_TOKEN.createdAt, 'createdAt is correct')
                t.equal(sessions[0].uaBrowser, 'foo', 'uaBrowser is correct')
                t.equal(sessions[0].uaBrowserVersion, '1', 'uaBrowserVersion is correct')
                t.equal(sessions[0].uaOS, 'bar', 'uaOS is correct')
                t.equal(sessions[0].uaOSVersion, '2', 'uaOSVersion is correct')
                t.equal(sessions[0].uaDeviceType, 'baz', 'uaDeviceType is correct')
                t.equal(sessions[0].lastAccessTime, 42, 'lastAccessTime is correct')

                // Fetch the session token
                return db.sessionToken(SESSION_TOKEN_ID)
              })
              .then(function(token) {
                t.deepEqual(token.tokenData, SESSION_TOKEN.data, 'token data matches')
                t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
                t.equal(token.createdAt, SESSION_TOKEN.createdAt, 'createdAt is correct')
                t.equal(token.uaBrowser, 'foo', 'uaBrowser is correct')
                t.equal(token.uaBrowserVersion, '1', 'uaBrowserVersion is correct')
                t.equal(token.uaOS, 'bar', 'uaOS is correct')
                t.equal(token.uaOSVersion, '2', 'uaOSVersion is correct')
                t.equal(token.uaDeviceType, 'baz', 'uaDeviceType is correct')
                t.equal(token.lastAccessTime, 42, 'lastAccessTime is correct')
                t.equal(!!token.emailVerified, ACCOUNT.emailVerified, 'token emailVerified is same as account emailVerified')
                t.equal(token.email, ACCOUNT.email, 'token email same as account email')
                t.deepEqual(token.emailCode, ACCOUNT.emailCode, 'token emailCode same as account emailCode')
                t.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is correct')
                t.equal(token.accountCreatedAt, ACCOUNT.createdAt, 'accountCreatedAt is correct')
                t.equal(token.mustVerify, undefined, 'mustVerify is undefined')
                t.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

                // Fetch the session token with its verification state
                return db.sessionTokenWithVerificationStatus(SESSION_TOKEN_ID)
              })
              .then(function (token) {
                t.deepEqual(token.tokenData, SESSION_TOKEN.data, 'token data matches')
                t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
                t.equal(token.createdAt, SESSION_TOKEN.createdAt, 'createdAt is correct')
                t.equal(token.uaBrowser, 'foo', 'uaBrowser is correct')
                t.equal(token.uaBrowserVersion, '1', 'uaBrowserVersion is correct')
                t.equal(token.uaOS, 'bar', 'uaOS is correct')
                t.equal(token.uaOSVersion, '2', 'uaOSVersion is correct')
                t.equal(token.uaDeviceType, 'baz', 'uaDeviceType is correct')
                t.equal(token.lastAccessTime, 42, 'lastAccessTime is correct')
                t.equal(!!token.emailVerified, ACCOUNT.emailVerified, 'token emailVerified is same as account emailVerified')
                t.equal(token.email, ACCOUNT.email, 'token email same as account email')
                t.deepEqual(token.emailCode, ACCOUNT.emailCode, 'token emailCode same as account emailCode')
                t.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is correct')
                t.equal(token.accountCreatedAt, ACCOUNT.createdAt, 'accountCreatedAt is correct')
                t.equal(!!token.mustVerify, !!SESSION_TOKEN.mustVerify, 'mustVerify is correct')
                t.deepEqual(token.tokenVerificationId, SESSION_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')

                // Create a verified session token
                return db.createSessionToken(VERIFIED_SESSION_TOKEN_ID, {
                  data: hex32(),
                  uid: ACCOUNT.uid,
                  createdAt: Date.now(),
                  uaBrowser: 'a',
                  uaBrowserVersion: 'b',
                  uaOS: 'c',
                  uaOSVersion: 'd',
                  uaDeviceType: 'e'
                })
              })
              .then(function (result) {
                t.deepEqual(result, {}, 'Returned an empty object on session token creation')

                // Fetch all of the sessions tokens for the account
                return db.sessions(ACCOUNT.uid)
              })
              .then(function (sessions) {
                t.equal(sessions.length, 2, 'sessions contains one item')
                var index = 0
                if (sessions[0].tokenId.toString('hex') === SESSION_TOKEN_ID.toString('hex')) {
                  index = 1
                }
                t.equal(sessions[index].tokenId.toString('hex'), VERIFIED_SESSION_TOKEN_ID.toString('hex'), 'tokenId is correct')
                t.equal(sessions[index].uid.toString('hex'), ACCOUNT.uid.toString('hex'), 'uid is correct')
                t.equal(sessions[index].uaBrowser, 'a', 'uaBrowser is correct')
                t.equal(sessions[index].uaBrowserVersion, 'b', 'uaBrowserVersion is correct')
                t.equal(sessions[index].uaOS, 'c', 'uaOS is correct')
                t.equal(sessions[index].uaOSVersion, 'd', 'uaOSVersion is correct')
                t.equal(sessions[index].uaDeviceType, 'e', 'uaDeviceType is correct')

                // Fetch the verified session token
                return db.sessionToken(VERIFIED_SESSION_TOKEN_ID)
              })
              .then(function(token) {
                t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
                t.equal(token.uaBrowser, 'a', 'uaBrowser is correct')
                t.equal(token.uaBrowserVersion, 'b', 'uaBrowserVersion is correct')
                t.equal(token.uaOS, 'c', 'uaOS is correct')
                t.equal(token.uaOSVersion, 'd', 'uaOSVersion is correct')
                t.equal(token.uaDeviceType, 'e', 'uaDeviceType is correct')
                t.equal(!!token.emailVerified, ACCOUNT.emailVerified, 'token emailVerified is same as account emailVerified')
                t.equal(token.mustVerify, undefined, 'mustVerify is undefined')
                t.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

                // Fetch the verified session token with its verification state
                return db.sessionTokenWithVerificationStatus(VERIFIED_SESSION_TOKEN_ID)
              })
              .then(function (token) {
                t.equal(token.mustVerify, null, 'mustVerify is null')
                t.equal(token.tokenVerificationId, null, 'tokenVerificationId is null')

                // Attempt to verify session token with invalid tokenVerificationId
                return db.verifyTokens(hex16(), { uid: ACCOUNT.uid })
              })
              .then(function () {
                t.fail('Verifying session token with invalid tokenVerificationId should have failed')
              }, function (err) {
                t.equal(err.errno, 116, 'err.errno is correct')
                t.equal(err.code, 404, 'err.code is correct')
              })
              .then(function() {
                // Fetch the unverified session token with its verification state
                return db.sessionTokenWithVerificationStatus(SESSION_TOKEN_ID)
              })
              .then(function (token) {
                t.equal(!!token.mustVerify, !!SESSION_TOKEN.mustVerify, 'mustVerify is correct')
                t.deepEqual(token.tokenVerificationId, SESSION_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')

                // Attempt to verify session token with invalid uid
                return db.verifyTokens(SESSION_TOKEN.tokenVerificationId, { uid: hex16() })
              })
              .then(function () {
                t.fail('Verifying session token with invalid uid should have failed')
              }, function (err) {
                t.equal(err.errno, 116, 'err.errno is correct')
                t.equal(err.code, 404, 'err.code is correct')
              })
              .then(function() {
                // Fetch the unverified session token with its verification state
                return db.sessionTokenWithVerificationStatus(SESSION_TOKEN_ID)
              })
              .then(function (token) {
                t.equal(!!token.mustVerify, !!SESSION_TOKEN.mustVerify, 'mustVerify is correct')
                t.deepEqual(token.tokenVerificationId, SESSION_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')

                // Verify the session token
                return db.verifyTokens(SESSION_TOKEN.tokenVerificationId, { uid: ACCOUNT.uid })
              })
              .then(function() {
                // Fetch the newly verified session token
                return db.sessionToken(SESSION_TOKEN_ID)
              })
              .then(function(token) {
                t.equal(token.mustVerify, undefined, 'mustVerify is undefined')
                t.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

                // Fetch the newly verified session token with its verification state
                return db.sessionTokenWithVerificationStatus(SESSION_TOKEN_ID)
              })
              .then(function (token) {
                t.equal(token.mustVerify, null, 'mustVerify is null')
                t.equal(token.tokenVerificationId, null, 'tokenVerificationId is null')

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
                  callbackAuthKey: 'bar'
                })
              })
              .then(function() {
                // Fetch devices for the account
                return db.accountDevices(ACCOUNT.uid)
              })
              .then(function(results) {
                t.equal(results.length, 1, 'Account has one device')

                // Fetch devices for the account
                return db.sessions(ACCOUNT.uid)
              })
              .then(function(sessions) {
                // by default sessions are not sorted
                sessions.sort(function(s1, s2) {
                  return s1.createdAt - s2.createdAt
                })

                t.equal(sessions.length, 3, 'sessions contains correct number of items')
                // the next session has a device attached to it
                t.equal(sessions[0].deviceId.toString('hex'), DEVICE_ID.toString('hex'))
                t.equal(sessions[0].deviceName, 'Test Device')
                t.equal(sessions[0].deviceType, 'mobile')
                t.ok(sessions[0].deviceCreatedAt)
                t.equal(sessions[0].deviceCallbackURL, 'https://push.server')
                t.equal(sessions[0].deviceCallbackPublicKey, 'foo')
                t.equal(sessions[0].deviceCallbackAuthKey, 'bar')
                t.equal(sessions[1].deviceId, null)
                t.equal(sessions[2].deviceId, null)

                // Delete all three session tokens
                return P.all([
                  db.deleteSessionToken(SESSION_TOKEN_ID),
                  db.deleteSessionToken(VERIFIED_SESSION_TOKEN_ID),
                  db.deleteSessionToken(UNVERIFIED_SESSION_TOKEN_ID)
                ])
              })
              .then(function(results) {
                t.equal(results.length, 3)
                results.forEach(function (result) {
                  t.deepEqual(result, {}, 'Returned an empty object on forgot session token deletion')
                })

                // Fetch devices for the account
                return db.accountDevices(ACCOUNT.uid)
              })
              .then(function(results) {
                t.equal(results.length, 0, 'Account has no devices')

                // Attempt to verify deleted unverified session token
                return db.verifyTokens(UNVERIFIED_SESSION_TOKEN.tokenVerificationId, { uid: ACCOUNT.uid })
              })
              .then(function () {
                t.fail('Verifying deleted unverified session token should have failed')
              }, function (err) {
                t.equal(err.errno, 116, 'err.errno is correct')
                t.equal(err.code, 404, 'err.code is correct')
              })
              .then(function() {
                // Fetch all of the sessions tokens for the account
                return db.sessions(ACCOUNT.uid)
              })
              .then(function (sessions) {
                t.equal(sessions.length, 0, 'sessions is empty')

                // Attempt to fetch a deleted session token
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
            t.plan(23)

            var VERIFIED_KEY_FETCH_TOKEN_ID = hex32()

            // Create a key fetch token
            return db.createKeyFetchToken(KEY_FETCH_TOKEN_ID, KEY_FETCH_TOKEN)
              .then(function(result) {
                t.deepEqual(result, {}, 'Returned an empty object on key fetch token creation')

                // Fetch the key fetch token
                return db.keyFetchToken(KEY_FETCH_TOKEN_ID)
              })
              .then(function(token) {
                // tokenId is not returned
                t.deepEqual(token.authKey, KEY_FETCH_TOKEN.authKey, 'authKey matches')
                t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
                t.equal(token.createdAt, KEY_FETCH_TOKEN.createdAt, 'createdAt is ok')
                t.equal(!!token.emailVerified, ACCOUNT.emailVerified, 'emailVerified is correct')
                // email is not returned
                // emailCode is not returned
                t.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is correct')
                t.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

                // Fetch the key fetch token with its verification state
                return db.keyFetchTokenWithVerificationStatus(KEY_FETCH_TOKEN_ID)
              })
              .then(function(token) {
                t.deepEqual(token.authKey, KEY_FETCH_TOKEN.authKey, 'authKey matches')
                t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
                t.equal(token.createdAt, KEY_FETCH_TOKEN.createdAt, 'createdAt is ok')
                t.equal(!!token.emailVerified, ACCOUNT.emailVerified, 'emailVerified is correct')
                t.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is correct')
                t.deepEqual(token.tokenVerificationId, KEY_FETCH_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')

                // Attempt to verify key fetch token with invalid tokenVerificationId
                return db.verifyTokens(hex16(), { uid: KEY_FETCH_TOKEN.uid })
              })
              .then(function () {
                t.fail('Verifying key fetch token with invalid tokenVerificationId should have failed')
              }, function () {
                t.pass('Verifying key fetch token with invalid tokenVerificationId failed as expected')
              })
              .then(function() {
                // Fetch the key fetch token with its verification state
                return db.keyFetchTokenWithVerificationStatus(KEY_FETCH_TOKEN_ID)
              })
              .then(function (token) {
                t.deepEqual(token.tokenVerificationId, KEY_FETCH_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')

                // Attempt to verify key fetch token with invalid uid
                return db.verifyTokens(KEY_FETCH_TOKEN.tokenVerificationId, { uid: hex16() })
              })
              .then(function () {
                t.fail('Verifying key fetch token with invalid uid should have failed')
              }, function () {
                t.pass('Verifying key fetch token with invalid uid failed as expected')
              })
              .then(function() {
                // Fetch the key fetch token with its verification state
                return db.keyFetchTokenWithVerificationStatus(KEY_FETCH_TOKEN_ID)
              })
              .then(function (token) {
                t.deepEqual(token.tokenVerificationId, KEY_FETCH_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')

                // Verify the key fetch token
                return db.verifyTokens(KEY_FETCH_TOKEN.tokenVerificationId, { uid: SESSION_TOKEN.uid })
              })
              .then(function() {
                // Fetch the key fetch token
                return db.keyFetchToken(KEY_FETCH_TOKEN_ID)
              })
              .then(function(token) {
                t.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

                // Fetch the key fetch token with its verification state
                return db.keyFetchTokenWithVerificationStatus(KEY_FETCH_TOKEN_ID)
              })
              .then(function(token) {
                t.equal(token.tokenVerificationId, null, 'tokenVerificationId is null')

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
                t.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

                // Fetch the verified key fetch token with its verification state
                return db.keyFetchTokenWithVerificationStatus(VERIFIED_KEY_FETCH_TOKEN_ID)
              })
              .then(function(token) {
                t.equal(token.tokenVerificationId, null, 'tokenVerificationId is null')

                // Delete both key fetch tokens
                return P.all([
                  db.deleteKeyFetchToken(KEY_FETCH_TOKEN_ID),
                  db.deleteKeyFetchToken(VERIFIED_KEY_FETCH_TOKEN_ID)
                ])
              })
              .then(function(result) {
                t.deepEqual(result, [{}, {}], 'Returned empty objects on forgot key fetch token deletion')

                // Attempt to fetch a deleted key fetch token
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
            t.plan(25)

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
                t.deepEqual(result, {}, 'Returned an empty object on forgot password token creation')
                return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
              })
              .then(function(newToken) {
                token = newToken
                // tokenId is not returned
                t.deepEqual(token.tokenData, PASSWORD_FORGOT_TOKEN.data, 'token data matches')
                t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
                t.equal(token.createdAt, PASSWORD_FORGOT_TOKEN.createdAt, 'createdAt same')
                t.deepEqual(token.passCode, PASSWORD_FORGOT_TOKEN.passCode, 'token passCode same')
                t.equal(token.tries, PASSWORD_FORGOT_TOKEN.tries, 'Tries is correct')
                t.equal(token.email, ACCOUNT.email, 'token email same as account email')
                t.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is set correctly')
              })
              .then(function() {
                return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
              })
              .then(function(newToken) {
                token = newToken
                // tokenId is not returned
                t.deepEqual(token.tokenData, PASSWORD_FORGOT_TOKEN.data, 'token data matches')
                t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
                t.equal(token.createdAt, PASSWORD_FORGOT_TOKEN.createdAt, 'createdAt is correct')
                t.deepEqual(token.passCode, PASSWORD_FORGOT_TOKEN.passCode, 'token passCode same')
                t.equal(token.tries, PASSWORD_FORGOT_TOKEN.tries, 'Tries is correct')
                t.equal(token.email, ACCOUNT.email, 'token email same as account email')
                t.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is correct')
              })
              .then(function() {
                // just update the tries
                token.tries = 9
                return db.updatePasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID, token)
              })
              .then(function(result) {
                t.deepEqual(result, {}, 'The returned object from the token update is empty')
                // re-fetch the updated token
                return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
              })
              .then(function(newToken) {
                t.deepEqual(newToken.uid, ACCOUNT.uid, 'token belongs to this account')
                t.equal(newToken.tries, 9, 'token now has had 9 tries')
                return db.deletePasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
              })
              .then(function(result) {
                t.deepEqual(result, {}, 'Returned an empty object on forgot password token deletion')
                return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
              })
              .then(function(newToken /* unused */) {
                t.fail('Password Forgot Token should no longer exist')
              }, function(err) {
                t.pass('Password Forgot Token deleted successfully')
              })
              .then(function() {
                // insert a throwaway token
                return db.createPasswordForgotToken(THROWAWAY_PASSWORD_FORGOT_TOKEN_ID, THROWAWAY_PASSWORD_FORGOT_TOKEN)
              })
              .then(function(result) {
                t.deepEqual(result, {}, 'Returned an empty object on forgot password token creation')
                // and we should be able to retrieve it as usual
                return db.passwordForgotToken(THROWAWAY_PASSWORD_FORGOT_TOKEN_ID)
              })
              .then(function(token) {
                // just check that the tokenData is what we expect (complete tests are above)
                t.deepEqual(token.tokenData, THROWAWAY_PASSWORD_FORGOT_TOKEN.data, 'token data matches')
                // now, let's insert a different passwordForgotToken with the same uid
                return db.createPasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID, PASSWORD_FORGOT_TOKEN)
              })
              .then(function(result) {
                t.deepEqual(result, {}, 'Returned an empty object on forgot password token creation (when overwriting another)')
                // if we retrieve the throwaway one, we should fail
                return db.passwordForgotToken(THROWAWAY_PASSWORD_FORGOT_TOKEN_ID)
              })
              .then(function(newToken /* unused */) {
                t.fail('Throwaway Password Forgot Token should no longer exist')
              }, function(err) {
                t.pass('Throwaway Password Forgot Token deleted successfully')
                // but the new one is still there
                return db.passwordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
              })
              .then(function(token) {
                // just check that the tokenData is what we expect (complete tests are above)
                t.deepEqual(token.tokenData, PASSWORD_FORGOT_TOKEN.data, 'token data matches')
              }, function(err) {
                t.fail('We should have been able to retrieve the new password forgot token')
              })
              .then(function() {
                return db.deletePasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID)
              })
          }
        )

        test(
          'change password token handling',
          function (t) {
            t.plan(13)

            var THROWAWAY_PASSWORD_CHANGE_TOKEN_ID = hex32()
            var THROWAWAY_PASSWORD_CHANGE_TOKEN = {
              data : hex32(),
              uid : ACCOUNT.uid, // same account uid
              createdAt: Date.now()
            }

            return db.createPasswordChangeToken(PASSWORD_CHANGE_TOKEN_ID, PASSWORD_CHANGE_TOKEN)
              .then(function(result) {
                t.deepEqual(result, {}, 'Returned an empty object on change password token creation')
                return db.passwordChangeToken(PASSWORD_CHANGE_TOKEN_ID)
              })
              .then(function(token) {
                // tokenId is not returned
                t.deepEqual(token.tokenData, PASSWORD_CHANGE_TOKEN.data, 'token data matches')
                t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
                t.equal(token.createdAt, PASSWORD_CHANGE_TOKEN.createdAt, 'createdAt is correct')
                t.equal(token.verifierSetAt, ACCOUNT.verifierSetAt, 'verifierSetAt is set correctly')
                t.equal(token.email, ACCOUNT.email, 'email is set correctly')
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
              .then(function() {
                // insert a throwaway token
                return db.createPasswordChangeToken(THROWAWAY_PASSWORD_CHANGE_TOKEN_ID, THROWAWAY_PASSWORD_CHANGE_TOKEN)
              })
              .then(function(result) {
                t.deepEqual(result, {}, 'Returned an empty object on change password token creation')
                // and we should be able to retrieve it as usual
                return db.passwordChangeToken(THROWAWAY_PASSWORD_CHANGE_TOKEN_ID)
              })
              .then(function(token) {
                // just check that the tokenData is what we expect (complete tests are above)
                t.deepEqual(token.tokenData, THROWAWAY_PASSWORD_CHANGE_TOKEN.data, 'token data matches')
                // now, let's insert a different passwordChangeToken with the same uid
                return db.createPasswordChangeToken(PASSWORD_CHANGE_TOKEN_ID, PASSWORD_CHANGE_TOKEN)
              })
              .then(function(result) {
                t.deepEqual(result, {}, 'Returned an empty object on change password token creation (when overwriting another)')
                // if we retrieve the throwaway one, we should fail
                return db.passwordChangeToken(THROWAWAY_PASSWORD_CHANGE_TOKEN_ID)
              })
              .then(function(newToken /* unused */) {
                t.fail('Throwaway Password Change Token should no longer exist')
              }, function(err) {
                t.pass('Throwaway Password Change Token deleted successfully')
                // but the new one is still there
                return db.passwordChangeToken(PASSWORD_CHANGE_TOKEN_ID)
              })
              .then(function(token) {
                // just check that the tokenData is what we expect (complete tests are above)
                t.deepEqual(token.tokenData, PASSWORD_CHANGE_TOKEN.data, 'token data matches')
              }, function(err) {
                t.fail('We should have been able to retrieve the new password change token')
              })
          }
        )

        test(
          'email verification and locale change',
          function (t) {
            t.plan(6)

            var emailBuffer = Buffer(ACCOUNT.email)
            return db.emailRecord(emailBuffer)
            .then(function(emailRecord) {
              return db.verifyEmail(emailRecord.uid, emailRecord.emailCode)
            })
            .then(function(result) {
              t.deepEqual(result, {}, 'Returned an empty object email verification')
              return db.account(ACCOUNT.uid)
            })
            .then(function(account) {
              t.ok(account.emailVerified, 'account should now be emailVerified (truthy)')
              t.equal(account.emailVerified, 1, 'account should now be emailVerified (1)')

              account.locale = 'en_NZ'
              return db.updateLocale(ACCOUNT.uid, account)
            })
            .then(function(result) {
              t.deepEqual(result, {}, 'Returned an empty object for updateLocale')
              return db.account(ACCOUNT.uid)
            })
            .then(function(account) {
              t.equal(account.locale, 'en_NZ', 'account should now have new locale')

              // test verifyEmail for a non-existant account
              return db.verifyEmail(newUuid(), account.emailCode)
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
            t.plan(6)

            return db.createPasswordForgotToken(PASSWORD_FORGOT_TOKEN_ID, PASSWORD_FORGOT_TOKEN)
              .then(function(passwordForgotToken) {
                return db.forgotPasswordVerified(PASSWORD_FORGOT_TOKEN_ID, ACCOUNT_RESET_TOKEN)
              })
              .then(function(result) {
                return db.accountResetToken(ACCOUNT_RESET_TOKEN_ID)
              })
              .then(function(token) {
                // tokenId is not returned
                t.deepEqual(token.uid, ACCOUNT.uid, 'token belongs to this account')
                t.deepEqual(token.tokenData, ACCOUNT_RESET_TOKEN.data, 'token data matches')
                t.equal(token.createdAt, ACCOUNT_RESET_TOKEN.createdAt, 'createdAt is correct')
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
            t.plan(17)
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
                t.deepEqual(token.uid, account.uid, 'token belongs to this account')
                t.deepEqual(token.tokenData, THROWAWAY_ACCOUNT_RESET_TOKEN.data, 'token data matches')
                t.equal(token.createdAt, THROWAWAY_ACCOUNT_RESET_TOKEN.createdAt, 'createdAt is correct')
                t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')
                // get this account out using emailRecord
                var emailBuffer = Buffer(account.email)
                return db.emailRecord(emailBuffer)
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
                // let's try and get the throwaway accountResetToken (shouldn't exist any longer)
                return db.accountResetToken(THROWAWAY_ACCOUNT_RESET_TOKEN_ID)
              })
              .then(function(token) {
                t.fail('Throwaway Account Reset Token should no longer exist')
              }, function(err) {
                t.pass('Throwaway Account Reset Token deleted during forgotPasswordVerified')
                // retrieve passwordForgotToken (shouldn't exist now)
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
                t.deepEqual(accountResetToken.uid, account.uid, 'token belongs to this account')
                t.deepEqual(accountResetToken.tokenData, ACCOUNT_RESET_TOKEN.data, 'token data matches')
                t.equal(accountResetToken.verifierSetAt, account.verifierSetAt, 'verifierSetAt is set correctly')
              })
              .then(function() {
                return db.account(account.uid)
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
          'db.deviceFromTokenVerificationId',
          function (t) {
            t.plan(8)
            var sessionTokenId = hex32()
            var deviceId = newUuid()
            var createdAt = Date.now()
            var tokenVerificationId = SESSION_TOKEN.tokenVerificationId
            var deviceName = 'test device'
            return db.deviceFromTokenVerificationId(ACCOUNT.uid, hex16())
              .then(function () {
                t.fail('trying to retrieve a device from an unknown tokeenVerificationId should have failed')
              }, function (err) {
                t.pass('trying to retrieve a device from an unknown tokeenVerificationId failed')
                t.equal(err.code, 404, 'err.code')
                t.equal(err.errno, 116, 'err.errno')
              })
              .then(function () {
                return db.createSessionToken(sessionTokenId, SESSION_TOKEN)
              })
              .then(function () {
                return db.deviceFromTokenVerificationId(ACCOUNT.uid, tokenVerificationId)
              })
              .then(function () {
                t.fail('no device should be associated with that session')
              }, function (err) {
                t.pass('no device was associated with that session')
                t.equal(err.code, 404, 'err.code')
                t.equal(err.errno, 116, 'err.errno')
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
                t.deepEqual(deviceInfo.id, deviceId, 'We found our device id back')
                t.equal(deviceInfo.name, deviceName, 'We found our device name back')
              })
              .then(function () {
                db.deleteDevice(ACCOUNT.uid, deviceId)
              })
          }
        )

        test(
          'db.accountDevices',
          function (t) {
            t.plan(77)
            var deviceId = newUuid()
            var sessionTokenId = hex32()
            var zombieSessionTokenId = hex32()
            var createdAt = Date.now()
            var deviceInfo = {
              name: 'test device',
              type: 'mobile',
              callbackURL: 'https://foo/bar',
              callbackPublicKey: base64_65(),
              callbackAuthKey: base64_16()
            }
            var newDeviceId = newUuid()
            var newSessionTokenId = hex32()
            var newTokenVerificationId = hex16()

            // Attempt to update non-existent device
            return db.updateDevice(ACCOUNT.uid, deviceId, deviceInfo)
              .then(function () {
                t.fail('updating a non-existent device should have failed')
              }, function (err) {
                t.pass('updating a non-existent device failed')
                t.equal(err.code, 404, 'err.code')
                t.equal(err.errno, 116, 'err.errno')
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
                .catch(function () {
                  t.fail('adding a new device should not have failed')
                })
              })
              .then(function (result) {
                t.deepEqual(result, {}, 'returned empty object')

                // Attempt to create a duplicate device
                return db.createDevice(ACCOUNT.uid, deviceId, {
                  sessionTokenId: newSessionTokenId,
                  createdAt: Date.now()
                })
                .then(function () {
                  t.fail('adding a duplicate device should have failed')
                }, function (err) {
                  t.pass('adding a duplicate device failed')
                  t.equal(err.code, 409, 'err.code')
                  t.equal(err.errno, 101, 'err.errno')
                })
              })
              .then(function () {
                // Fetch all of the devices for the account
                return db.accountDevices(ACCOUNT.uid)
              })
              .then(function (devices) {
                t.equal(devices.length, 1, 'devices length 1')
                return devices[0]
              })
              .then(function (device) {
                t.deepEqual(device.sessionTokenId, sessionTokenId, 'sessionTokenId')
                t.equal(device.name, null, 'name')
                t.deepEqual(device.id, deviceId, 'id')
                t.equal(device.createdAt, createdAt, 'createdAt')
                t.equal(device.type, null, 'type')
                t.equal(device.callbackURL, null, 'callbackURL')
                t.equal(device.callbackPublicKey, null, 'callbackPublicKey')
                t.equal(device.callbackAuthKey, null, 'callbackAuthKey')
                t.ok(device.lastAccessTime > 0, 'has a lastAccessTime')
                t.equal(device.email, ACCOUNT.email, 'email should be account email')

                // Fetch the session token with its verification state and device info
                return db.sessionWithDevice(sessionTokenId)
                  .then(
                    function (s) {
                      t.deepEqual(s.deviceId, device.id, 'id')
                      t.deepEqual(s.uid, device.uid, 'uid')
                      t.equal(s.deviceName, device.name, 'name')
                      t.equal(s.deviceType, device.type, 'type')
                      t.equal(s.deviceCreatedAt, device.createdAt, 'createdAt')
                      t.equal(s.deviceCallbackURL, device.callbackURL, 'callbackURL')
                      t.equal(s.deviceCallbackPublicKey, device.callbackPublicKey, 'callbackPublicKey')
                      t.equal(s.deviceCallbackAuthKey, device.callbackAuthKey, 'callbackAuthKey')
                      t.equal(!!s.mustVerify, !!SESSION_TOKEN.mustVerify, 'mustVerify is correct')
                      t.deepEqual(s.tokenVerificationId, SESSION_TOKEN.tokenVerificationId, 'tokenVerificationId is correct')
                    },
                    function (e) {
                      t.fail('getting the sessionWithDevice should not have failed')
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
                t.equal(s.mustVerify, null, 'mustVerify is null')
                t.equal(s.tokenVerificationId, null, 'tokenVerificationId is null')

                // Update the device
                return db.updateDevice(ACCOUNT.uid, deviceId, deviceInfo)
                  .catch(function () {
                    t.fail('updating an existing device should not have failed')
                  })
              })
              .then(function (result) {
                t.deepEqual(result, {}, 'returned empty object')

                // Fetch all of the devices for the account
                return db.accountDevices(ACCOUNT.uid)
              })
              .then(function (devices) {
                t.equal(devices.length, 1, 'devices length still 1')
                return devices[0]
              })
              .then(function (device) {
                t.deepEqual(device.sessionTokenId, sessionTokenId, 'sessionTokenId')
                t.equal(device.name, deviceInfo.name, 'name')
                t.deepEqual(device.id, deviceId, 'id')
                t.equal(device.createdAt, createdAt, 'createdAt')
                t.equal(device.type, deviceInfo.type, 'type')
                t.equal(device.callbackURL, deviceInfo.callbackURL, 'callbackURL')
                t.equal(device.callbackPublicKey, deviceInfo.callbackPublicKey, 'callbackPublicKey')
                t.equal(device.callbackAuthKey, deviceInfo.callbackAuthKey, 'callbackAuthKey')
                t.ok(device.lastAccessTime > 0, 'has a lastAccessTime')
                t.equal(device.email, ACCOUNT.email, 'email should be account email')

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
                .catch(function () {
                  t.fail('updating an existing device should not have failed')
                })
              })
              .then(function () {
                // Fetch all of the devices for the account
                return db.accountDevices(ACCOUNT.uid)
              })
              .then(function (devices) {
                t.equal(devices.length, 1, 'devices length still 1')
                return devices[0]
              })
              .then(function (device) {
                t.deepEqual(device.sessionTokenId, newSessionTokenId, 'sessionTokenId updated')
                t.equal(device.name, 'updated name', 'name updated')
                t.equal(device.type, deviceInfo.type, 'type unchanged')
                t.equal(device.callbackURL, deviceInfo.callbackURL, 'callbackURL unchanged')
                t.equal(device.callbackPublicKey, deviceInfo.callbackPublicKey, 'callbackPublicKey unchanged')
                t.equal(device.callbackAuthKey, deviceInfo.callbackAuthKey, 'callbackAuthKey unchanged')

                // Update the device type and callback params
                return db.updateDevice(ACCOUNT.uid, deviceId, {
                  type: 'desktop',
                  callbackURL: '',
                  callbackPublicKey: '',
                  callbackAuthKey: ''
                })
                .catch(function () {
                  t.fail('updating an existing device should not have failed')
                })
              })
              .then(function (result) {
                // Fetch all of the devices for the account
                return db.accountDevices(ACCOUNT.uid)
              })
              .then(function (devices) {
                t.equal(devices.length, 1, 'devices length still 1')
                return devices[0]
              })
              .then(function (device) {
                t.deepEqual(device.sessionTokenId, newSessionTokenId, 'sessionTokenId updated')
                t.equal(device.name, 'updated name', 'name unchanged')
                t.equal(device.type, 'desktop', 'type updated')
                t.equal(device.callbackURL, '', 'callbackURL updated')
                t.equal(device.callbackPublicKey, '', 'callbackPublicKey updated')
                t.equal(device.callbackAuthKey, '', 'callbackAuthKey updated')

                // Make the device a zombie, by giving it a non-existent session token
                return db.updateDevice(ACCOUNT.uid, deviceId, {
                  sessionTokenId: zombieSessionTokenId
                })
                .catch(function () {
                  t.fail('updating an existing device should not have failed')
                })
              })
              .then(function () {
                // Fetch all of the devices for the account
                return db.accountDevices(ACCOUNT.uid)
              })
              .then(function (devices) {
                t.equal(devices.length, 0, 'devices is empty')

                // Reinstate the previous session token for the device
                return db.updateDevice(ACCOUNT.uid, deviceId, {
                  sessionTokenId: newSessionTokenId
                })
                .catch(function () {
                  t.fail('updating an existing device should not have failed')
                })
              })
              .then(function () {
                // Fetch all of the devices for the account
                return db.accountDevices(ACCOUNT.uid)
              })
              .then(function (devices) {
                t.equal(devices.length, 1, 'devices contains one item again')

                // Attempt to create a second device with the same session token
                return db.createDevice(ACCOUNT.uid, newUuid(), {
                  sessionTokenId: newSessionTokenId,
                  name: 'second device',
                  createdAt: Date.now(),
                  type: 'desktop',
                  callbackURL: 'https://foo/bar',
                  callbackPublicKey: base64_65(),
                  callbackAuthKey: base64_16()
                })
                .then(function () {
                  t.fail('adding a second device should have failed when the session token is already registered')
                }, function (err) {
                  t.pass('adding a second device failed when the session token is already registered')
                  t.equal(err.code, 409, 'err.code')
                  t.equal(err.errno, 101, 'err.errno')
                })
              })
              .then(function () {
                // Fetch all of the devices for the account
                return db.accountDevices(ACCOUNT.uid)
              })
              .then(function (devices) {
                t.equal(devices.length, 1, 'devices length still 1')

                // Create a second device
                return db.createDevice(ACCOUNT.uid, newDeviceId, {
                  sessionTokenId: sessionTokenId,
                  name: 'second device',
                  createdAt: Date.now(),
                  type: 'desktop',
                  callbackURL: 'https://foo/bar',
                  callbackPublicKey: base64_65(),
                  callbackAuthKey: base64_16()
                })
                .then(function () {
                  t.pass('adding a second device did not fail when the session token is not registered')
                }, function (err) {
                  t.fail('adding a second device should not have failed when the session token is not registered')
                })
              })
              .then(function () {
                // Fetch all of the devices for the account
                return db.accountDevices(ACCOUNT.uid)
              })
              .then(function (devices) {
                t.equal(devices.length, 2, 'devices length 2')

                // Delete the first device
                return db.deleteDevice(ACCOUNT.uid, deviceId)
              })
              .then(function (result) {
                t.deepEqual(result, {}, 'returned empty object')

                // Fetch all of the devices for the account
                return db.accountDevices(ACCOUNT.uid)
              })
              .then(function (devices) {
                t.equal(devices.length, 1, 'devices length 1')

                // Attempt to delete the first device again
                return db.deleteDevice(ACCOUNT.uid, deviceId)
                  .then(function () {
                    t.fail('deleting a non-existent device should have failed')
                  }, function (err) {
                    t.pass('deleting a non-existent device failed')
                    t.equal(err.code, 404, 'err.code')
                    t.equal(err.errno, 116, 'err.errno')
                  })
              })
              .then(function () {
                // Fetch all of the devices for the account
                return db.accountDevices(ACCOUNT.uid)
              })
              .then(function (devices) {
                t.equal(devices.length, 1, 'devices length 1')

                // Attempt to fetch the session token that was associated with the deleted device
                return db.sessionWithDevice(newSessionTokenId)
              })
              .then(function () {
                t.fail('deleting the device should have deleted the session token')
              }, function (err) {
                t.pass('deleting the device also deleted the session token')
                t.equal(err.code, 404, 'err.code')
                t.equal(err.errno, 116, 'err.errno')
              })
              .then(function () {
                // Attempt to verify the session token that was associated with the deleted device
                return db.verifyTokens(newTokenVerificationId, { uid: ACCOUNT.uid })
              })
              .then(function () {
                t.fail('deleting the device should have deleted the unverified token')
              }, function (err) {
                t.pass('deleting the device also deleted the unverified token')
                t.equal(err.code, 404, 'err.code')
                t.equal(err.errno, 116, 'err.errno')
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
                t.equal(devices.length, 0, 'devices length 0')
              })
          }
        )

        test(
          'db.resetAccount',
          function (t) {
            t.plan(10)
            var uid = ACCOUNT.uid
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

            return db.createSessionToken(SESSION_TOKEN_ID, SESSION_TOKEN)
              .then(function(sessionToken) {
                t.pass('.createSessionToken() did not error')
                return db.createDevice(ACCOUNT.uid, newUuid(), {
                  sessionTokenId: SESSION_TOKEN_ID,
                  createdAt: createdAt
                })
              })
              .then(function() {
                t.pass('.createDevice() did not error')
                return db.createPasswordForgotToken(THROWAWAY_PASSWORD_FORGOT_TOKEN_ID, THROWAWAY_PASSWORD_FORGOT_TOKEN)
              })
              .then(function(passwordForgotToken) {
                return db.forgotPasswordVerified(THROWAWAY_PASSWORD_FORGOT_TOKEN_ID, THROWAWAY_ACCOUNT_RESET_TOKEN)
              })
              .then(function() {
                return db.resetAccount(uid, ACCOUNT)
              })
              .then(function(sessionToken) {
                t.pass('.resetAccount() did not error')
                return db.accountDevices(uid)
              })
              .then(function(devices) {
                t.pass('.accountDevices() did not error')
                t.equal(devices.length, 0, 'The devices length should be zero')

                // Attempt to verify the session token
                return db.verifyTokens(SESSION_TOKEN.tokenVerificationId, { uid: uid })
              })
              .then(function () {
                t.fail('Verifying deleted token should have failed')
              }, function (err) {
                t.equal(err.errno, 116, 'err.errno is correct')
                t.equal(err.code, 404, 'err.code is correct')
              })
              .then(function() {
                // Attempt to fetch the session token
                return db.sessionToken(SESSION_TOKEN_ID)
              })
              .then(function () {
                t.fail('Fetching deleted token should have failed')
              }, function (err) {
                t.equal(err.errno, 116, 'err.errno is correct')
                t.equal(err.code, 404, 'err.code is correct')
              })
              .then(function() {
                // account should STILL exist for this email address
                var emailBuffer = Buffer(ACCOUNT.email)
                return db.accountExists(emailBuffer)
              })
              .then(function(exists) {
                t.ok(exists, 'account still exists ok')
              }, function(err) {
                t.fail('the account for this email address should still exist')
              })
          }
        )

        test(
          'securityEvents',
          function (t) {

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
              }).then(function () {
                t.end()
              }, t.fail)
            }

            function createSession (id, session) {
              return db.createSessionToken(id, session).catch(function (e) {
                t.fail('createSession ' + id.toString('hex') + ' failed: ' + e)
              })
            }

            function verifySession (id, uid) {
              return db.verifyTokens(id, { uid: uid }).catch(function (e) {
                t.fail('verifySession ' + id.toString('hex') + ' failed: ' + e)
              })
            }

            function deleteSession (id) {
              return db.deleteSessionToken(id).catch(function (e) {
                t.fail('deleteSession ' + id.toString('hex') + ' failed: ' + e)
              })
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
                  t.equal(results.length, 3, 'three events for uid and addr')
                  // The most recent event is returned first.
                  t.equal(results[0].name, evC, 'correct event name')
                  t.equal(!!results[0].verified, true, 'event without a session is already verified')
                  t.ok(results[0].createdAt < Date.now(), 'createdAt is set')
                  t.equal(results[1].name, evB, 'correct event name')
                  t.equal(!!results[1].verified, false, 'second session is not verified yet')
                  t.ok(results[1].createdAt < results[0].createdAt, 'createdAt is lower than previous event')
                  t.equal(results[2].name, evA, 'correct event name')
                  t.equal(!!results[2].verified, true, 'first session is already verified')
                  t.ok(results[2].createdAt < results[1].createdAt, 'createdAt is lower than previous event')
                }
              ),

              testGetEventAfterSessionVerified: function () {
                return verifySession(session1.tokenVerificationId, uid1)
                  .then(query(uid1, addr1, function (results) {
                    t.equal(results.length, 3, 'three events for uid and addr')
                    t.equal(!!results[0].verified, true, 'first session verified')
                    t.equal(!!results[1].verified, true, 'second session verified')
                    t.equal(!!results[2].verified, true, 'third session verified')
                  }))
              },

              testGetSecondAddr: query(
                uid1, addr2,
                function (results) {
                  t.equal(results.length, 1, 'one event for addr2')
                  t.equal(results[0].name, evA)
                  t.equal(!!results[0].verified, false, 'session3 not verified yet')
                }
              ),

              testGetSecondAddrAfterDeletingUnverifiedSession: function () {
                return deleteSession(sessionId3)
                  .then(query(uid1, addr2, function (results) {
                    t.equal(results.length, 1, 'one event for addr2')
                    t.equal(results[0].name, evA)
                    t.equal(!!results[0].verified, false, 'session3 not verified yet')
                  }))
              },

              testGetWithIPv6: query(
                uid1, '::' + addr1,
                function (results) {
                  t.equal(results.length, 3, 'three events for ipv6 addr')
                }
              ),

              testUnknownUid: query(
                newUuid(), addr1,
                function (results) {
                  t.equal(results.length, 0, 'no events for unknown uid')
                }
              )
            })
          }
        )

        test(
          'account deletion',
          function (t) {
            t.plan(5)
            var uid = ACCOUNT.uid
            return db.deleteAccount(uid)
              .then(function() {
                // account should no longer exist for this email address
                var emailBuffer = Buffer(ACCOUNT.email)
                return db.accountExists(emailBuffer)
              })
              .then(function(exists) {
                t.fail('account should no longer exist for this email address')
              }, function(err) {
                t.pass('account no longer exists for this email address')
                // Fetch the session token with its verification state
                return db.sessionTokenWithVerificationStatus(SESSION_TOKEN_ID)
              })
              .then(function () {
                // Attempt to verify session token
                return db.verifyTokens(SESSION_TOKEN.tokenVerificationId, { uid: uid })
              })
              .then(function () {
                t.fail('Verifying deleted token should have failed')
              }, function (err) {
                t.equal(err.errno, 116, 'err.errno is correct')
                t.equal(err.code, 404, 'err.code is correct')
              })
              .then(function() {
                // Attempt to fetch session token
                return db.sessionToken(SESSION_TOKEN_ID)
              })
              .then(function () {
                t.fail('Fetching deleted token should have failed')
              }, function (err) {
                t.equal(err.errno, 116, 'err.errno is correct')
                t.equal(err.code, 404, 'err.code is correct')
              })
          }
        )

        test(
          'reminders - create and delete',
          function (t) {
            t.plan(3)
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
                  t.equal(result[0].type, 'second', 'correct type')
                  t.equal(result[0].uid.toString('hex'), account.uid.toString('hex'), 'correct uid')
                }
              )
              .then(
                function () {
                  return db.fetchReminders({}, fetchQuery)
                }
              )
              .then(
                function (result) {
                  t.equal(result.length, 0, 'no more reminders')
                  t.end()
                }
              )
          }
        )

        test(
          'reminders - multiple accounts',
          function (t) {
            t.plan(4)
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
                    return db.fetchReminders({}, fetchQuery)
                  })
                }
              )
              .then(
                function (result) {
                  t.equal(result.length, 2, 'correct size of result')
                  t.equal(result[0].type, 'first', 'correct type')
                  t.equal(result[1].type, 'first', 'correct type')
                }
              )
              .then(
                function () {
                  return db.fetchReminders({}, fetchQuery)
                }
              )
              .then(
                function (result) {
                  t.equal(result.length, 0, 'no more first reminders')
                  t.end()
                }
              )
          }
        )

        test(
          'reminders - multi fetch',
          function (t) {
            t.plan(1)
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

                  t.equal(found, 1, 'only one query has the result')
                }
              )
          }
        )

        test(
          'unblockCodes',
          function (t) {
            t.plan(5)
            var uid1 = newUuid()
            var code1 = unblockCode()

            db.consumeUnblockCode(uid1, code1)
              .then(
                function () {
                  t.fail('consuming unknown code should error')
                },
                function (err) {
                  t.pass('consuming unknown code errors')
                  return db.createUnblockCode(uid1, code1)
                }
              )
              .then(
                function () {
                  t.pass('creates an unblock code')
                  return db.consumeUnblockCode(uid1, code1)
                }
              )
              .then(
                function (code) {
                  t.pass('consumes the unblock code')
                  t.ok(code.createdAt <= Date.now(), 'returns unblock code timestamp')
                  return db.consumeUnblockCode(uid1, code1)
                }
              )
              .then(
                function () {
                  t.fail('consumed unblock code should not be able to consume again')
                },
                function (err) {
                  t.pass('consume a consumed code errors')
                }
              )
              .then(
                function () {
                  t.end()
                },
                function (err) {
                  t.fail(err)
                }
              )
          }
        )

        test(
          'emailBounces',
          t => {
            t.plan(4)
            const data = {
              email: ('' + Math.random()).substr(2) + '@email.bounces',
              bounceType: 'Permanent',
              bounceSubType: 'NoEmail'
            }
            db.createEmailBounce(data)
              .then(() => {
                return db.fetchEmailBounces(data.email)
              })
              .then(bounces => {
                t.equal(bounces.length, 1)
                t.equal(bounces[0].email, data.email)
                t.equal(bounces[0].bounceType, 1)
                t.equal(bounces[0].bounceSubType, 3)

              })
              .then(
                () => {
                  t.end()
                },
                (err) => {
                  t.fail(err)
                }
              )
          }
        )

        test(
          'emails',
          t => {
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
             * 5) Verify secondary email
             * 6) Get `accountEmails` returns both emails, shows verified
             * 7) Delete secondary email
             * 8) Get `accountEmails` only return email on account table
             *
             */
            // Lets begin our journey by creating a new account.
            db.createAccount(account.uid, account)
              .then(function (result) {
                t.deepEqual(result, {}, 'Returned an empty object on account creation')

                // Attempt to add a new email address to this user's account.
                // At this point we should only have one email address returned, which
                // should be the email on the accounts table.
                return db.accountEmails(account.uid)
              })
              .then(
                function(result) {
                  t.equal(result.length, 1, 'one email returned')

                  // Check first email is email from accounts table
                  t.equal(result[0].email, account.email, 'matches account email')
                  t.equal(!!result[0].isPrimary, true, 'isPrimary is true on account email')
                  t.equal(!!result[0].isVerified, account.emailVerified, 'matches account emailVerified')

                  // Attempt to create an additional email for this user account.
                  return db.createEmail(account.uid, secondEmail)
                }
              )
              .then(function (result) {
                t.deepEqual(result, {}, 'Returned an empty object on email creation')

                // Check that second email was added to account.
                return db.accountEmails(account.uid)
              })
              .then(
                function(result) {
                  t.equal(result.length, 2, 'two emails returned')

                  // Check first email is email from accounts table
                  t.equal(result[0].email, account.email, 'matches account email')
                  t.equal(!!result[0].isPrimary, true, 'isPrimary is true on account email')
                  t.equal(!!result[0].isVerified, account.emailVerified, 'matches account emailVerified')

                  // Check second email is from emails table
                  t.equal(result[1].email, secondEmail.email, 'matches secondEmail email')
                  t.equal(!!result[1].isPrimary, false, 'isPrimary is false on secondEmail email')
                  t.equal(!!result[1].isVerified, secondEmail.isVerified, 'matches secondEmail isVerified')

                  // Verify second email
                  return db.verifyEmail(secondEmail.uid, secondEmail.emailCode)
                }
              )
              .then(
                function(result) {
                  t.deepEqual(result, {}, 'Returned an empty object on email verification')

                  // Get all emails and check to see if second email has been marked verified
                  return db.accountEmails(account.uid)
                }
              )
              .then(
                function(result) {
                  t.equal(result.length, 2, 'two email returned')

                  // Check second email is from emails table and verified
                  t.equal(result[1].email, secondEmail.email, 'matches secondEmail email')
                  t.equal(!!result[1].isPrimary, false, 'isPrimary is false on secondEmail email')
                  t.equal(!!result[1].isVerified, true, 'secondEmail isVerified is true')

                  // Remove additional email from account
                  return db.deleteEmail(secondEmail.uid, secondEmail.email)
                }
              )
              .then(
                function(result) {
                  t.deepEqual(result, {}, 'Returned an empty object on email deletion')

                  // Get all emails and check to see if it has been removed
                  return db.accountEmails(account.uid)
                }
              )
              .then(
                function(result) {
                  // Verify that the email has been removed
                  t.equal(result.length, 1, 'one email returned')

                  // Only email returned should be from users account
                  t.equal(result[0].email, account.email, 'matches account email')
                  t.equal(!!result[0].isPrimary, true, 'isPrimary is true on account email')
                  t.equal(!!result[0].isVerified, account.emailVerified, 'matches account emailVerified')

                  return P.resolve()
                }
              )
              .then(
                function() {
                  /**
                   * This sequence of code tests the failure paths
                   *
                   * 1) Can not add an an email that exits in emails table or accounts table
                   * 2) Can not delete primary email
                   * 3) Can not create an new account that has an email in the emails table
                   */

                  // Attempt to add the account email to the emails table.
                  const anotherEmail = createEmail({email: account.email})
                  return db.createEmail(account.uid, anotherEmail)
                }
              )
              .then(
                function() {
                  t.fail('Failed to throw error for creating an already existing email.')
                }
              )
              .catch(function (err) {
                t.equal(err.errno, 101, 'should return duplicate entry errno')
                t.equal(err.code, 409, 'should return duplicate entry code')

                // Attempt to add duplicate email to emails table
                const anotherEmail = createEmail({email: secondEmail.email})
                return db.createEmail(account.uid, anotherEmail)
                  .then(function (result) {
                    t.deepEqual(result, {}, 'Returned an empty object on email creation')
                    return db.createEmail(account.uid, anotherEmail)
                      .then(function () {
                        t.fail('Failed to throw error for creating an already existing email.')
                      })
                  })
              })
              .catch(function (err) {
                t.equal(err.errno, 101, 'should return duplicate entry errno')
                t.equal(err.code, 409, 'should return duplicate entry code')

                // Attempt to delete an email that is on the account table
                return db.deleteEmail(account.uid, account.normalizedEmail)
                  .then(function () {
                    t.fail('Failed to not delete an email in the account table.')
                  })
              })
              .catch(function (err) {
                t.equal(err.errno, 136, 'should return email delete errno')
                t.equal(err.code, 400, 'should return email delete code')

                // Attempt to create a new account with an existing email in the emails table
                const anotherAccount = createAccount()
                anotherAccount.email = secondEmail.email
                anotherAccount.normalizedEmail = secondEmail.normalizedEmail
                anotherAccount.emailVerified = true

                return db.createAccount(anotherAccount.uid, anotherAccount)
                  .then(function () {
                    t.fail('Failed to not created account with duplicate email')
                  })
                  .catch(function (err) {
                    t.equal(err.errno, 101, 'should return duplicate entry errno')
                    t.equal(err.code, 409, 'should return duplicate entry code')
                  })
              })
              .then(
                () => {
                  t.end()
                },
                (err) => {
                  t.fail(err)
                }
              )
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
}
