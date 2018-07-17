/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict'

const assert = require('insist')
const crypto = require('crypto')
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
    locale: 'en_US',
  }
  account.normalizedEmail = account.email.toLowerCase()
  account.emailBuffer = Buffer.from(account.email)
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

function hex(len) {
  return Buffer.from(crypto.randomBytes(len).toString('hex'), 'hex')
}
function hex6() {
  return hex(6)
}
function hex16() {
  return hex(16)
}
function hex32() {
  return hex(32)
}
// function hex64() { return hex(64) }
function hex96() {
  return hex(96)
}

function makeMockSessionToken(uid, mustVerify) {
  const sessionToken = {
    tokenId: hex32(),
    data: hex32(),
    uid: uid,
    createdAt: Date.now(),
    uaBrowser: 'mock browser',
    uaBrowserVersion: 'mock browser version',
    uaOS: 'mock OS',
    uaOSVersion: 'mock OS version',
    uaDeviceType: 'mock device type',
    mustVerify: mustVerify,
    tokenVerificationId: hex16(),
    tokenVerificationCode: unblockCode(),
    tokenVerificationCodeExpiresAt: Date.now() + 20000
  }
  return sessionToken
}

function makeMockDevice(tokenId) {
  const device = {
    sessionTokenId: tokenId,
    name: 'Test Device',
    type: 'mobile',
    createdAt: Date.now(),
    callbackURL: 'https://push.server',
    callbackPublicKey: 'foo',
    callbackAuthKey: 'bar',
    callbackIsExpired: false,
    availableCommands: {
      'https://identity.mozilla.com/cmd/display-uri': 'metadata-bundle'
    }
  }
  device.deviceId = newUuid()
  return device
}

function makeMockForgotPasswordToken(uid) {
  const token = {
    data: hex32(),
    tokenId: hex32(),
    uid: uid,
    passCode: hex16(),
    tries: 1,
    createdAt: Date.now()
  }
  return token
}

function makeMockKeyFetchToken(uid, verified) {
  const keyFetchToken = {
    authKey: hex32(),
    uid: uid,
    keyBundle: hex96(),
    createdAt: now + 2,
    tokenVerificationId: verified ? undefined : hex16()
  }
  keyFetchToken.tokenId = hex32()
  return keyFetchToken
}

function makeMockChangePasswordToken(uid) {
  const token = {
    data: hex32(),
    uid: uid,
    createdAt: Date.now()
  }
  token.tokenId = hex32()
  return token
}

function makeMockAccountResetToken(uid, tokenId) {
  const token = {
    tokenId: tokenId || hex32(),
    data: hex32(),
    uid: uid,
    createdAt: now + 5
  }
  return token
}

function createRecoveryData() {
  const data = {
    recoveryKeyId: hex(16),
    recoveryData: crypto.randomBytes(32).toString('hex')
  }
  return data
}

// To run these tests from a new backend, pass the config and an already created
// DB API for them to be run against.
module.exports = function (config, DB) {
  describe('db_tests', () => {

    let db, accountData
    before(() => {
      return DB.connect(config)
        .then(db_ => {
          db = db_
          return db.ping()
        })
    })

    beforeEach(() => {
      accountData = createAccount()
      return db.createAccount(accountData.uid, accountData)
    })

    describe('db.account', () => {
      beforeEach(() => {
        return db.accountExists(accountData.emailBuffer)
          .then((exists) => assert(exists, 'account exists for this email address'))
      })

      it('should create account', () => {
        const anotherAccountData = createAccount()
        return db.accountExists(anotherAccountData.emailBuffer)
          .then(assert.fail, (err) => assert.equal(err.code, 404, 'Not found'))
          .then(() => db.createAccount(anotherAccountData.uid, anotherAccountData))
          .then((account) => {
            assert.deepEqual(account, {}, 'Returned an empty object on account creation')
            return db.accountExists(Buffer.from(anotherAccountData.email))
              .then((exists) => assert(exists, 'account exists for this email address'), assert.fail)
          })
      })

      it('should fail with duplicate account', () => {
        return db.createAccount(accountData.uid, accountData)
          .then(assert.fail, (err) => {
            assert(err, 'trying to create the same account produces an error')
            assert.equal(err.code, 409, 'error code')
            assert.equal(err.errno, 101, 'error errno')
            assert.equal(err.message, 'Record already exists', 'message')
            assert.equal(err.error, 'Conflict', 'error')
          })
      })

      it('should return account', () => {
        return db.account(accountData.uid)
          .then((account) => {
            assert.deepEqual(account.uid, accountData.uid, 'uid')
            assert.equal(account.email, accountData.email, 'email')
            assert.deepEqual(account.emailCode, accountData.emailCode, 'emailCode')
            assert.equal(!! account.emailVerified, accountData.emailVerified, 'emailVerified')
            assert.deepEqual(account.kA, accountData.kA, 'kA')
            assert.deepEqual(account.wrapWrapKb, accountData.wrapWrapKb, 'wrapWrapKb')
            assert(! account.verifyHash, 'verifyHash field should be absent')
            assert.deepEqual(account.authSalt, accountData.authSalt, 'authSalt')
            assert.equal(account.verifierVersion, accountData.verifierVersion, 'verifierVersion')
            assert.equal(account.createdAt, accountData.createdAt, 'createdAt')
            assert.equal(account.verifierSetAt, accountData.createdAt, 'verifierSetAt has been set to the same as createdAt')
            assert.equal(account.locale, accountData.locale, 'locale')
          })
      })

      it('should return email record', () => {
        return db.emailRecord(accountData.emailBuffer)
          .then((account) => {
            assert.deepEqual(account.uid, accountData.uid, 'uid')
            assert.equal(account.email, accountData.email, 'email')
            assert.deepEqual(account.emailCode, accountData.emailCode, 'emailCode')
            assert.equal(!! account.emailVerified, accountData.emailVerified, 'emailVerified')
            assert.deepEqual(account.kA, accountData.kA, 'kA')
            assert.deepEqual(account.wrapWrapKb, accountData.wrapWrapKb, 'wrapWrapKb')
            assert(! account.verifyHash, 'verifyHash field should be absent')
            assert.deepEqual(account.authSalt, accountData.authSalt, 'authSalt')
            assert.equal(account.verifierVersion, accountData.verifierVersion, 'verifierVersion')
            assert.equal(account.verifierSetAt, accountData.verifierSetAt, 'verifierSetAt')
            assert.equal(account.hasOwnProperty('locale'), false, 'locale not returned')
          })
      })
    })

    describe('db.checkPassword', () => {
      it('should fail with incorrect password', () => {
        return db.checkPassword(accountData.uid, {verifyHash: Buffer.from(crypto.randomBytes(32))})
          .then(assert.fail, (err) => {
            assert(err, 'incorrect password produces an error')
            assert.equal(err.code, 400, 'error code')
            assert.equal(err.errno, 103, 'error errno')
            assert.equal(err.message, 'Incorrect password', 'message')
            assert.equal(err.error, 'Bad request', 'error')
            return db.checkPassword(accountData.uid, {verifyHash: zeroBuffer32})
          })
      })

      it('should be successful with correct password', () => {
        return db.checkPassword(accountData.uid, {verifyHash: zeroBuffer32})
          .then((account) => {
            assert.deepEqual(account.uid, account.uid, 'uid')
            assert.equal(Object.keys(account).length, 1, 'Only one field (uid) was returned, nothing else')
          })
      })
    })

    describe('session token handling', () => {
      let sessionTokenData
      beforeEach(() => {
        sessionTokenData = makeMockSessionToken(accountData.uid, false)
        return db.createSessionToken(sessionTokenData.tokenId, sessionTokenData)
      })

      it('should get sessions', () => {
        return db.sessions(accountData.uid)
          .then((sessions) => {
            assert(Array.isArray(sessions), 'sessions is an array')
            assert.equal(sessions.length, 1, 'sessions has one item')

            assert.equal(Object.keys(sessions[0]).length, 20, 'session has correct properties')
            assert.equal(sessions[0].tokenId.toString('hex'), sessionTokenData.tokenId.toString('hex'), 'tokenId is correct')
            assert.equal(sessions[0].uid.toString('hex'), accountData.uid.toString('hex'), 'uid is correct')
            assert.equal(sessions[0].createdAt, sessionTokenData.createdAt, 'createdAt is correct')
            assert.equal(sessions[0].uaBrowser, sessionTokenData.uaBrowser, 'uaBrowser is correct')
            assert.equal(sessions[0].uaBrowserVersion, sessionTokenData.uaBrowserVersion, 'uaBrowserVersion is correct')
            assert.equal(sessions[0].uaOS, sessionTokenData.uaOS, 'uaOS is correct')
            assert.equal(sessions[0].uaOSVersion, sessionTokenData.uaOSVersion, 'uaOSVersion is correct')
            assert.equal(sessions[0].uaDeviceType, sessionTokenData.uaDeviceType, 'uaDeviceType is correct')
            assert.equal(sessions[0].uaFormFactor, sessionTokenData.uaFormFactor, 'uaFormFactor is correct')
            assert.equal(sessions[0].lastAccessTime, sessionTokenData.createdAt, 'lastAccessTime is correct')
            assert.equal(sessions[0].authAt, sessionTokenData.createdAt, 'authAt is correct')
          })
      })

      it('should create session', () => {
        accountData = createAccount()
        sessionTokenData = makeMockSessionToken(accountData.uid, false)
        return db.createAccount(accountData.uid, accountData)
          .then(() => db.createSessionToken(sessionTokenData.tokenId, sessionTokenData))
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on session token creation')
            return db.sessions(accountData.uid)
          })
          .then((sessions) => {
            assert(Array.isArray(sessions), 'sessions is an array')
            assert.equal(sessions.length, 1, 'sessions has one item')
          })
      })

      it('should get session token', () => {
        return db.sessionToken(sessionTokenData.tokenId)
          .then((token) => {
            assert.equal(token.hasOwnProperty('tokenId'), false, 'tokenId is not returned')
            assert.deepEqual(token.tokenData, sessionTokenData.data, 'token data matches')
            assert.deepEqual(token.uid, accountData.uid, 'token belongs to this account')
            assert.equal(token.createdAt, sessionTokenData.createdAt, 'createdAt is correct')
            assert.equal(token.uaBrowser, sessionTokenData.uaBrowser, 'uaBrowser is correct')
            assert.equal(token.uaBrowserVersion, sessionTokenData.uaBrowserVersion, 'uaBrowserVersion is correct')
            assert.equal(token.uaOS, sessionTokenData.uaOS, 'uaOS is correct')
            assert.equal(token.uaOSVersion, sessionTokenData.uaOSVersion, 'uaOSVersion is correct')
            assert.equal(token.uaDeviceType, sessionTokenData.uaDeviceType, 'uaDeviceType is correct')
            assert.equal(token.uaFormFactor, sessionTokenData.uaFormFactor, 'uaFormFactor is correct')
            assert.equal(token.lastAccessTime, sessionTokenData.createdAt, 'lastAccessTime was set')
            assert.equal(token.authAt, sessionTokenData.createdAt, 'authAt is correct')
            assert.equal(!! token.emailVerified, accountData.emailVerified, 'token emailVerified is same as account emailVerified')
            assert.equal(token.email, accountData.email, 'token email same as account email')
            assert.deepEqual(token.emailCode, accountData.emailCode, 'token emailCode same as account emailCode')
            assert.equal(token.verifierSetAt, accountData.verifierSetAt, 'verifierSetAt is correct')
            assert.equal(token.accountCreatedAt, accountData.createdAt, 'accountCreatedAt is correct')
          })
      })

      it('should update token', () => {
        const sessionTokenUpdates = {
          uaBrowser: 'foo',
          uaBrowserVersion: '1',
          uaOS: 'bar',
          uaOSVersion: '2',
          uaDeviceType: 'baz',
          lastAccessTime: 42,
          authAt: 1234567
        }
        return db.updateSessionToken(sessionTokenData.tokenId, sessionTokenUpdates)
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on session token update')
            return db.sessionToken(sessionTokenData.tokenId)
          })
          .then((token) => {
            assert.deepEqual(token.tokenData, sessionTokenData.data, 'token data matches')
            assert.deepEqual(token.uid, accountData.uid, 'token belongs to this account')
            assert.equal(token.createdAt, sessionTokenData.createdAt, 'createdAt is correct')
            assert.equal(token.uaBrowser, 'foo', 'uaBrowser is correct')
            assert.equal(token.uaBrowserVersion, '1', 'uaBrowserVersion is correct')
            assert.equal(token.uaOS, 'bar', 'uaOS is correct')
            assert.equal(token.uaOSVersion, '2', 'uaOSVersion is correct')
            assert.equal(token.uaDeviceType, 'baz', 'uaDeviceType is correct')
            assert.equal(token.uaFormFactor, sessionTokenData.uaFormFactor, 'uaFormFactor is correct')
            assert.equal(token.lastAccessTime, 42, 'lastAccessTime is correct')
            assert.equal(token.authAt, 1234567, 'authAt is correct')
            assert.equal(!! token.emailVerified, accountData.emailVerified, 'token emailVerified is same as account emailVerified')
            assert.equal(token.email, accountData.email, 'token email same as account email')
            assert.deepEqual(token.emailCode, accountData.emailCode, 'token emailCode same as account emailCode')
            assert.equal(token.verifierSetAt, accountData.verifierSetAt, 'verifierSetAt is correct')
            assert.equal(token.accountCreatedAt, accountData.createdAt, 'accountCreatedAt is correct')
            assert.equal(token.mustVerify, sessionTokenData.mustVerify, 'mustVerify is set')
            assert.deepEqual(token.tokenVerificationId, sessionTokenData.tokenVerificationId, 'tokenVerificationId is set')
          })
      })

      it('should update mustVerify to true, but not to false', () => {
        return db.sessionToken(sessionTokenData.tokenId)
          .then((token) => {
            assert.equal(token.mustVerify, false, 'mustVerify starts out as false')
            assert.equal(token.uaBrowser, 'mock browser', 'other fields have their default values')
            return db.updateSessionToken(sessionTokenData.tokenId, { mustVerify: true })
          })
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on session token update')
            return db.sessionToken(sessionTokenData.tokenId)
          })
          .then((token) => {
            assert.equal(token.mustVerify, true, 'mustVerify was correctly updated to true')
            assert.equal(token.uaBrowser, 'mock browser', 'other fields were not updated')
            return db.updateSessionToken(sessionTokenData.tokenId, { mustVerify: false })
          })
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on session token update')
            return db.sessionToken(sessionTokenData.tokenId)
          })
          .then((token) => {
            assert.equal(token.mustVerify, true, 'mustVerify was not reset back to false')
            assert.equal(token.uaBrowser, 'mock browser', 'other fields were not updated')
          })
      })

      it('should get verification state', () => {
        return db.sessionToken(sessionTokenData.tokenId)
          .then((token) => {
            assert.deepEqual(token.tokenData, sessionTokenData.data, 'token data matches')
            assert.deepEqual(token.uid, accountData.uid, 'token belongs to this account')
            assert.equal(token.createdAt, sessionTokenData.createdAt, 'createdAt is correct')
            assert.equal(token.uaBrowser, sessionTokenData.uaBrowser, 'uaBrowser is correct')
            assert.equal(token.uaBrowserVersion, sessionTokenData.uaBrowserVersion, 'uaBrowserVersion is correct')
            assert.equal(token.uaOS, sessionTokenData.uaOS, 'uaOS is correct')
            assert.equal(token.uaOSVersion, sessionTokenData.uaOSVersion, 'uaOSVersion is correct')
            assert.equal(token.uaDeviceType, sessionTokenData.uaDeviceType, 'uaDeviceType is correct')
            assert.equal(token.uaFormFactor, sessionTokenData.uaFormFactor, 'uaFormFactor is correct')
            assert.equal(token.lastAccessTime, sessionTokenData.createdAt, 'lastAccessTime was set')
            assert.equal(token.authAt, sessionTokenData.createdAt, 'authAt is correct')
            assert.equal(!! token.emailVerified, accountData.emailVerified, 'token emailVerified is same as account emailVerified')
            assert.equal(token.email, accountData.email, 'token email same as account email')
            assert.deepEqual(token.emailCode, accountData.emailCode, 'token emailCode same as account emailCode')
            assert.equal(token.verifierSetAt, accountData.verifierSetAt, 'verifierSetAt is correct')
            assert.equal(token.accountCreatedAt, accountData.createdAt, 'accountCreatedAt is correct')
            assert.equal(token.mustVerify, sessionTokenData.mustVerify, 'mustVerify is correct')
            assert.deepEqual(token.tokenVerificationId, sessionTokenData.tokenVerificationId, 'tokenVerificationId is correct')

          })
      })

      it('should fail session verification for invalid tokenId', () => {
        return db.verifyTokens(hex16(), accountData)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')

            return db.sessionToken(sessionTokenData.tokenId)
          })
          .then((token) => {
            assert.equal(token.mustVerify, sessionTokenData.mustVerify, 'mustVerify is correct')
            assert.deepEqual(token.tokenVerificationId, sessionTokenData.tokenVerificationId, 'tokenVerificationId is correct')
          })
      })

      it('should fail session verification for invalid uid', () => {
        return db.verifyTokens(sessionTokenData.tokenVerificationId, {uid: hex16()})
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')

            return db.sessionToken(sessionTokenData.tokenId)
          })
          .then((token) => {
            assert.equal(token.mustVerify, sessionTokenData.mustVerify, 'mustVerify is correct')
            assert.deepEqual(token.tokenVerificationId, sessionTokenData.tokenVerificationId, 'tokenVerificationId is correct')
          })
      })

      it('should verify session token', () => {
        return db.verifyTokens(sessionTokenData.tokenVerificationId, accountData)
          .then(() => {
            return db.sessionToken(sessionTokenData.tokenId)
          }, assert.fail)
          .then((token) => {
            assert.equal(!! token.mustVerify, false, 'mustVerify is null')
            assert.equal(token.tokenVerificationId, null, 'tokenVerificationId is null')
          })
      })

      describe('db.accountDevices', () => {
        let deviceData
        beforeEach(() => {
          deviceData = makeMockDevice(sessionTokenData.tokenId)
          return db.createDevice(accountData.uid, deviceData.deviceId, deviceData)
        })

        it('should get device count', () => {
          return db.accountDevices(accountData.uid)
            .then((results) => {
              assert.equal(results.length, 1, 'Account has one device')
            })
        })

        it('db.sessions should contain device data', () => {
          return db.sessions(accountData.uid)
            .then((sessions) => {
              assert.equal(sessions.length, 1, 'sessions contains correct number of items')
              // the next session has a device attached to it
              assert.equal(sessions[0].deviceId.toString('hex'), deviceData.deviceId.toString('hex'))
              assert.equal(sessions[0].deviceName, 'Test Device')
              assert.equal(sessions[0].deviceType, 'mobile')
              assert(sessions[0].deviceCreatedAt)
              assert.equal(sessions[0].deviceCallbackURL, 'https://push.server')
              assert.equal(sessions[0].deviceCallbackPublicKey, 'foo')
              assert.equal(sessions[0].deviceCallbackAuthKey, 'bar')
              assert.equal(sessions[0].deviceCallbackIsExpired, false)
            })
        })

        it('db.deleteSessionToken should delete device', () => {
          return db.accountDevices(accountData.uid)
            .then((results) => {
              assert.equal(results.length, 1, 'Account has one device')
              return db.deleteSessionToken(sessionTokenData.tokenId)
            })
            .then(() => db.accountDevices(accountData.uid))
            .then((results) => {
              assert.equal(results.length, 0, 'Account has no devices')
            })
        })
      })

      describe('db.deleteSessionToken', () => {
        beforeEach(() => {
          return db.deleteSessionToken(sessionTokenData.tokenId)
            .then((result) => {
              assert.deepEqual(result, {}, 'Returned an empty object on forgot session token deletion')
            }, assert.fail)
        })

        it('should delete session', () => {
          return db.sessionToken(sessionTokenData.tokenId)
            .then(assert.fail, (err) => {
              assert.equal(err.errno, 116, 'err.errno is correct')
              assert.equal(err.code, 404, 'err.code is correct')
            })
        })

        it('should fail to verify deleted session', () => {
          return db.verifyTokens(sessionTokenData.tokenVerificationId, accountData)
            .then(assert.fail, (err) => {
              assert.equal(err.errno, 116, 'err.errno is correct')
              assert.equal(err.code, 404, 'err.code is correct')
            })
        })
      })
    })

    describe('key fetch token handling', () => {
      let keyFetchTokenData
      beforeEach(() => {
        keyFetchTokenData = makeMockKeyFetchToken(accountData.uid, false)
        return db.createKeyFetchToken(keyFetchTokenData.tokenId, keyFetchTokenData)
      })

      it('should have created unverified keyfetch token', () => {
        keyFetchTokenData = makeMockKeyFetchToken(accountData.uid, false)
        return db.createKeyFetchToken(keyFetchTokenData.tokenId, keyFetchTokenData)
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on key fetch token creation')
            return db.keyFetchToken(keyFetchTokenData.tokenId)
          })
          .then((token) => {
            assert.equal(token.tokenId, undefined, 'tokenId is not returned')
            assert.deepEqual(token.authKey, keyFetchTokenData.authKey, 'authKey matches')
            assert.deepEqual(token.uid, accountData.uid, 'token belongs to this account')
            assert.equal(token.createdAt, keyFetchTokenData.createdAt, 'createdAt is ok')
            assert.equal(!! token.emailVerified, accountData.emailVerified, 'emailVerified is correct')
            assert.equal(token.email, undefined, 'tokenId is not returned')
            assert.equal(token.emailCode, undefined, 'tokenId is not returned')
            assert.equal(token.verifierSetAt, accountData.verifierSetAt, 'verifierSetAt is correct')
            assert.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')
          })
      })

      it('should have created verified key fetch token', () => {
        keyFetchTokenData = makeMockKeyFetchToken(accountData.uid, true)
        return db.createKeyFetchToken(keyFetchTokenData.tokenId, keyFetchTokenData)
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on key fetch token creation')
            return db.keyFetchTokenWithVerificationStatus(keyFetchTokenData.tokenId)
          })
          .then((token) => {
            assert.equal(token.tokenId, undefined, 'tokenId is not returned')
            assert.deepEqual(token.authKey, keyFetchTokenData.authKey, 'authKey matches')
            assert.deepEqual(token.uid, accountData.uid, 'token belongs to this account')
            assert.equal(token.createdAt, keyFetchTokenData.createdAt, 'createdAt is ok')
            assert.equal(!! token.emailVerified, accountData.emailVerified, 'emailVerified is correct')
            assert.equal(token.email, undefined, 'tokenId is not returned')
            assert.equal(token.emailCode, undefined, 'tokenId is not returned')
            assert.equal(token.verifierSetAt, accountData.verifierSetAt, 'verifierSetAt is correct')
            assert.equal(token.tokenVerificationId, keyFetchTokenData.tokenVerificationId, 'tokenVerificationId is undefined')
          })
      })

      it('should get keyfetch token verification status', () => {
        return db.keyFetchTokenWithVerificationStatus(keyFetchTokenData.tokenId)
          .then((token) => {
            assert.deepEqual(token.authKey, keyFetchTokenData.authKey, 'authKey matches')
            assert.deepEqual(token.uid, accountData.uid, 'token belongs to this account')
            assert.equal(token.createdAt, keyFetchTokenData.createdAt, 'createdAt is ok')
            assert.equal(!! token.emailVerified, accountData.emailVerified, 'emailVerified is correct')
            assert.equal(token.verifierSetAt, accountData.verifierSetAt, 'verifierSetAt is correct')
            assert.deepEqual(token.tokenVerificationId, keyFetchTokenData.tokenVerificationId, 'tokenVerificationId is correct')

          })
      })

      it('should fail keyfetch token verficiation for invalid tokenVerficationId', () => {
        return db.verifyTokens(hex16(), accountData)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')
          })
      })

      it('should fail keyfetch token verficiation for invalid uid', () => {
        return db.verifyTokens(keyFetchTokenData.tokenVerificationId, {uid: hex16()})
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')
          })
      })

      it('should verify keyfetch token', () => {
        return db.keyFetchTokenWithVerificationStatus(keyFetchTokenData.tokenId)
          .then((token) => {
            assert.deepEqual(token.tokenVerificationId, keyFetchTokenData.tokenVerificationId, 'tokenVerificationId is correct')
            return db.verifyTokens(keyFetchTokenData.tokenVerificationId, accountData)
          })
          .then(() => {
            return db.keyFetchTokenWithVerificationStatus(keyFetchTokenData.tokenId)
          })
          .then((token) => {
            assert.equal(token.tokenVerificationId, null, 'tokenVerificationId is null')
          })
      })

      it('should delete key fetch token', () => {
        return db.deleteKeyFetchToken(keyFetchTokenData.tokenId)
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on token delete')
            return db.keyFetchToken(keyFetchTokenData.tokenVerificationId)
              .then(assert.fail, (err) => {
                assert.equal(err.errno, 116, 'err.errno is correct')
                assert.equal(err.code, 404, 'err.code is correct')
              })
          })
      })
    })

    describe('forgot password token handling', () => {
      let forgotPasswordTokenData
      beforeEach(() => {
        forgotPasswordTokenData = makeMockForgotPasswordToken(accountData.uid)
        return db.createPasswordForgotToken(forgotPasswordTokenData.tokenId, forgotPasswordTokenData)
      })

      it('should have created password forgot token', () => {
        return db.passwordForgotToken(forgotPasswordTokenData.tokenId)
          .then((token) => {
            assert.deepEqual(token.tokenData, forgotPasswordTokenData.data, 'token data matches')
            assert.deepEqual(token.uid, accountData.uid, 'token belongs to this account')
            assert.equal(token.createdAt, forgotPasswordTokenData.createdAt, 'createdAt same')
            assert.deepEqual(token.passCode, forgotPasswordTokenData.passCode, 'token passCode same')
            assert.equal(token.tries, forgotPasswordTokenData.tries, 'Tries is correct')
            assert.equal(token.email, accountData.email, 'token email same as account email')
            assert.equal(token.verifierSetAt, accountData.verifierSetAt, 'verifierSetAt is set correctly')
          })
      })


      it('should update password forgot token tries', () => {
        forgotPasswordTokenData.tries = 9
        return db.updatePasswordForgotToken(forgotPasswordTokenData.tokenId, forgotPasswordTokenData)
          .then((result) => {
            assert.deepEqual(result, {}, 'The returned object from the token update is empty')
            return db.passwordForgotToken(forgotPasswordTokenData.tokenId)
          })
          .then((token) => {
            assert.equal(token.tries, 9, 'token now has had 9 tries')
          })
      })

      it('should delete password forgot token', () => {
        return db.deletePasswordForgotToken(forgotPasswordTokenData.tokenId)
          .then((result) => {
            assert.deepEqual(result, {}, 'The returned object from the token delete is empty')
            return db.passwordForgotToken(forgotPasswordTokenData.tokenId)
              .then(assert.fail, (err) => {
                assert.equal(err.errno, 116, 'err.errno is correct')
                assert.equal(err.code, 404, 'err.code is correct')
              })
          })
      })
    })

    describe('change password token handling', () => {
      let changePasswordTokenData
      beforeEach(() => {
        changePasswordTokenData = makeMockChangePasswordToken(accountData.uid)

        return db.createPasswordChangeToken(changePasswordTokenData.tokenId, changePasswordTokenData)
      })

      it('should have created password change token', () => {
        return db.passwordChangeToken(changePasswordTokenData.tokenId)
          .then((token) => {
            assert.equal(token.hasOwnProperty('tokenId'), false, 'tokenId is not returned')
            assert.deepEqual(token.tokenData, changePasswordTokenData.data, 'token data matches')
            assert.deepEqual(token.uid, accountData.uid, 'token belongs to this account')
            assert.equal(token.createdAt, changePasswordTokenData.createdAt, 'createdAt is correct')
            assert.equal(token.verifierSetAt, accountData.verifierSetAt, 'verifierSetAt is set correctly')
          })
      })

      it('should override change password token when creating with same uid', () => {
        const anotherChangePasswordTokenData = makeMockChangePasswordToken(accountData.uid)
        return db.createPasswordChangeToken(anotherChangePasswordTokenData.tokenId, anotherChangePasswordTokenData)
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on change password token creation')

            // Fails to retrieve original change token since it was over written
            return db.passwordChangeToken(changePasswordTokenData.tokenId)
              .then(assert.fail, (err) => {
                assert.equal(err.errno, 116, 'err.errno is correct')
                assert.equal(err.code, 404, 'err.code is correct')
                return db.passwordChangeToken(anotherChangePasswordTokenData.tokenId)
              })
          })
          .then((token) => {
            assert.deepEqual(token.tokenData, anotherChangePasswordTokenData.data, 'token data matches')
            assert.deepEqual(token.uid, accountData.uid, 'token belongs to this account')
            assert.equal(token.createdAt, anotherChangePasswordTokenData.createdAt, 'createdAt is correct')
            assert.equal(token.verifierSetAt, accountData.verifierSetAt, 'verifierSetAt is set correctly')
          })
      })

      it('should have deleted token', () => {
        return db.deletePasswordChangeToken(changePasswordTokenData.tokenId, changePasswordTokenData)
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on forgot password change deletion')
            return db.passwordChangeToken(changePasswordTokenData.tokenId)
              .then(assert.fail, (err) => {
                assert.equal(err.errno, 116, 'err.errno is correct')
                assert.equal(err.code, 404, 'err.code is correct')
              })
          })
      })
    })

    it('should verify account email with legacy db.verifyEmail', () => {
      return db.emailRecord(accountData.emailBuffer)
        .then((emailRecord) => {
          assert.equal(emailRecord.emailVerified, false, 'account should be emailVerified false')
          assert.equal(emailRecord.emailVerified, 0, 'account should be emailVerified (0)')
          return db.verifyEmail(emailRecord.uid, emailRecord.emailCode)
        })
        .then(function (result) {
          assert.deepEqual(result, {}, 'Returned an empty object email verification')
          return db.account(accountData.uid)
        })
        .then(function (account) {
          assert(account.emailVerified, 'account should now be emailVerified (truthy)')
          assert.equal(account.emailVerified, 1, 'account should now be emailVerified (1)')
        })
    })

    it('should change account locale', () => {
      return db.account(accountData.uid)
        .then((account) => {
          assert.equal(account.locale, 'en_US', 'correct locale set')
          accountData.locale = 'en_NZ'
          return db.updateLocale(accountData.uid, accountData)
        })
        .then(function (result) {
          assert.deepEqual(result, {}, 'Returned an empty object on locale update')
          return db.account(accountData.uid)
        })
        .then(function (account) {
          assert.equal(account.locale, 'en_NZ', 'account should now have new locale')
        })
    })

    describe('account reset token handling', () => {
      let accountResetTokenData, forgotPasswordTokenData
      beforeEach(() => {
        forgotPasswordTokenData = makeMockForgotPasswordToken(accountData.uid)
        accountResetTokenData = makeMockAccountResetToken(accountData.uid)
        return db.createPasswordForgotToken(forgotPasswordTokenData.tokenId, forgotPasswordTokenData)
          .then(function () {
            return db.forgotPasswordVerified(forgotPasswordTokenData.tokenId, accountResetTokenData)
          })
      })

      it('db.accountResetToken should create token', () => {
        return db.accountResetToken(accountResetTokenData.tokenId)
          .then((token) => {
            assert.equal(token.hasOwnProperty('tokenId'), false, 'tokenId is not returned')
            assert.deepEqual(token.uid, accountData.uid, 'token belongs to this account')
            assert.deepEqual(token.tokenData, accountResetTokenData.data, 'token data matches')
            assert.equal(token.createdAt, accountResetTokenData.createdAt, 'createdAt is correct')
            assert(token.verifierSetAt, 'verifierSetAt is set to a truthy value')
          })
      })

      it('db.deleteAccountResetToken should delete token', () => {
        return db.deleteAccountResetToken(accountResetTokenData.tokenId)
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on account reset deletion')
            return db.accountResetToken(accountResetTokenData.tokenId)
              .then(assert.fail, (err) => {
                assert.equal(err.errno, 116, 'err.errno is correct')
                assert.equal(err.code, 404, 'err.code is correct')
              })
          })
      })
    })

    describe('db.forgotPasswordVerified', () => {
      let forgotPasswordTokenData, anotherForgotPasswordTokenData, accountResetTokenData, anotherAccountResetTokenData
      beforeEach(() => {
        forgotPasswordTokenData = makeMockForgotPasswordToken(accountData.uid)
        accountResetTokenData = makeMockAccountResetToken(accountData.uid, forgotPasswordTokenData.tokenId)
        anotherForgotPasswordTokenData = makeMockForgotPasswordToken(accountData.uid)
        anotherAccountResetTokenData = makeMockAccountResetToken(accountData.uid, anotherForgotPasswordTokenData.tokenId)

        return db.createPasswordForgotToken(anotherForgotPasswordTokenData.tokenId, anotherForgotPasswordTokenData)
      })

      it('should override accountResetToken when calling `db.forgotPasswordVerified`', () => {
        return db.forgotPasswordVerified(anotherForgotPasswordTokenData.tokenId, anotherAccountResetTokenData)
          .then(() => db.accountResetToken(anotherAccountResetTokenData.tokenId), assert.fail)
          .then((token) => {
            // check a couple of fields
            assert.deepEqual(token.uid, accountData.uid, 'token belongs to this account')
            assert.deepEqual(token.tokenData, anotherAccountResetTokenData.data, 'token data matches')
            assert.equal(token.createdAt, anotherAccountResetTokenData.createdAt, 'createdAt is correct')
            assert(token.verifierSetAt, 'verifierSetAt is set to a truthy value')

            return db.createPasswordForgotToken(forgotPasswordTokenData.tokenId, forgotPasswordTokenData)
          })
          .then(() => db.forgotPasswordVerified(forgotPasswordTokenData.tokenId, forgotPasswordTokenData), assert.fail)
          .then(() => db.accountResetToken(anotherAccountResetTokenData.tokenId))
          .then(assert.fail, (err) => {
            // throw away accountResetToken (shouldn't exist any longer)
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')

            return db.passwordForgotToken(forgotPasswordTokenData.tokenId)
          })
          .then(assert.fail, (err) => {
            // throw away passwordForgotToken (shouldn't exist any longer)
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')

            return db.deleteAccountResetToken(accountResetTokenData.tokenId)
          })
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on account reset deletion')
            return db.accountResetToken(accountResetTokenData.tokenId)
          })
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'err.errno is correct')
            assert.equal(err.code, 404, 'err.code is correct')
          })

      })
    })

    describe('db.deviceFromTokenVerificationId', () => {
      let sessionTokenData
      beforeEach(() => {
        sessionTokenData = makeMockSessionToken(accountData.uid)
        return db.createSessionToken(sessionTokenData.tokenId, sessionTokenData)
      })

      it('should fail for non-existing session', () => {
        return db.deviceFromTokenVerificationId(accountData.uid, hex16())
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
      })

      it('should fail for session with no device', () => {
        return db.deviceFromTokenVerificationId(accountData.uid, sessionTokenData.tokenVerificationId)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
      })

      it('should return device', () => {
        const deviceData = makeMockDevice(sessionTokenData.tokenId)
        return db.createDevice(accountData.uid, deviceData.deviceId, deviceData)
          .then(() => {
            return db.deviceFromTokenVerificationId(accountData.uid, sessionTokenData.tokenVerificationId)
          })
          .then((deviceInfo) => {
            assert.deepEqual(deviceInfo.id, deviceData.deviceId, 'We found our device id back')
            assert.equal(deviceInfo.name, deviceData.name, 'We found our device name back')
          })
      })
    })

    describe('db.accountDevices', () => {
      let deviceInfo, sessionTokenData
      beforeEach(() => {
        sessionTokenData = makeMockSessionToken(accountData.uid)
        deviceInfo = makeMockDevice(sessionTokenData.tokenId)

        return db.createSessionToken(sessionTokenData.tokenId, sessionTokenData)
          .then(() => db.createDevice(accountData.uid, deviceInfo.deviceId, deviceInfo))
          .then((result) => {
            return assert.deepEqual(result, {}, 'returned empty object')
          })
      })

      it('should have created device', () => {
        return db.device(sessionTokenData.uid, deviceInfo.deviceId)
          .then((d) => {
            assert.deepEqual(d.uid, sessionTokenData.uid, 'uid')
            assert.deepEqual(d.id, deviceInfo.deviceId, 'id')
            assert.equal(d.name, deviceInfo.name, 'name')
            assert.equal(d.type, deviceInfo.type, 'type')
            assert.equal(d.createdAt, deviceInfo.createdAt, 'createdAt')
            assert.equal(d.callbackURL, deviceInfo.callbackURL, 'callbackURL')
            assert.equal(d.callbackPublicKey, deviceInfo.callbackPublicKey, 'callbackPublicKey')
            assert.equal(d.callbackAuthKey, deviceInfo.callbackAuthKey, 'callbackAuthKey')
            assert.equal(d.callbackIsExpired, deviceInfo.callbackIsExpired, 'callbackIsExpired')
            assert.deepEqual(d.availableCommands, deviceInfo.availableCommands, 'availableCommands')
          })
      })

      it('should have linked device to session token', () => {
        return db.sessionToken(sessionTokenData.tokenId)
          .then((s) => {
            assert.deepEqual(s.deviceId, deviceInfo.deviceId, 'id')
            assert.deepEqual(s.uid, sessionTokenData.uid, 'uid')
            assert.equal(s.deviceName, deviceInfo.name, 'name')
            assert.equal(s.deviceType, deviceInfo.type, 'type')
            assert.equal(s.deviceCreatedAt, deviceInfo.createdAt, 'createdAt')
            assert.equal(s.deviceCallbackURL, deviceInfo.callbackURL, 'callbackURL')
            assert.equal(s.deviceCallbackPublicKey, deviceInfo.callbackPublicKey, 'callbackPublicKey')
            assert.equal(s.deviceCallbackAuthKey, deviceInfo.callbackAuthKey, 'callbackAuthKey')
            assert.equal(s.deviceCallbackIsExpired, deviceInfo.callbackIsExpired, 'callbackIsExpired')
            assert.deepEqual(s.deviceAvailableCommands, deviceInfo.availableCommands, 'availableCommands')
            assert.equal(!! s.mustVerify, !! sessionTokenData.mustVerify, 'mustVerify is correct')
            assert.deepEqual(s.tokenVerificationId, sessionTokenData.tokenVerificationId, 'tokenVerificationId is correct')
          })
      })

      it('should get all devices', () => {
        return db.accountDevices(accountData.uid)
          .then((devices) => {
            assert.equal(devices.length, 1, 'devices length 1')
            const device = devices[0]
            assert.deepEqual(device.sessionTokenId, sessionTokenData.tokenId, 'sessionTokenId')
            assert.equal(device.name, deviceInfo.name, 'name')
            assert.deepEqual(device.id, deviceInfo.deviceId, 'id')
            assert.equal(device.createdAt, deviceInfo.createdAt, 'createdAt')
            assert.equal(device.type, deviceInfo.type, 'type')
            assert.equal(device.callbackURL, deviceInfo.callbackURL, 'callbackURL')
            assert.equal(device.callbackPublicKey, deviceInfo.callbackPublicKey, 'callbackPublicKey')
            assert.equal(device.callbackAuthKey, deviceInfo.callbackAuthKey, 'callbackAuthKey')
            assert.equal(device.callbackIsExpired, deviceInfo.callbackIsExpired, 'callbackIsExpired')
            assert.deepEqual(device.availableCommands, deviceInfo.availableCommands, 'availableCommands')
            assert(device.lastAccessTime > 0, 'has a lastAccessTime')
          })
      })

      it('should update device', () => {
        deviceInfo.name = 'New New Device'
        deviceInfo.type = 'desktop'
        deviceInfo.callbackURL = ''
        deviceInfo.callbackPublicKey = ''
        deviceInfo.callbackAuthKey = ''
        deviceInfo.callbackIsExpired = true
        deviceInfo.availableCommands = {}

        const newSessionTokenData = makeMockSessionToken(accountData.uid)
        deviceInfo.sessionTokenId = newSessionTokenData.tokenId

        return db.createSessionToken(newSessionTokenData.tokenId, newSessionTokenData)
          .then(() => {
            return db.updateDevice(accountData.uid, deviceInfo.deviceId, deviceInfo)
          })
          .then((result) => {
            assert.deepEqual(result, {}, 'returned empty object')
            return db.accountDevices(accountData.uid)
          })
          .then((devices) => {
            assert.equal(devices.length, 1, 'devices length 1')
            const device = devices[0]
            assert.deepEqual(device.sessionTokenId, newSessionTokenData.tokenId, 'sessionTokenId updated')
            assert.equal(device.name, 'New New Device', 'name updated')
            assert.equal(device.type, 'desktop', 'type unchanged')
            assert.equal(device.callbackURL, '', 'callbackURL unchanged')
            assert.equal(device.callbackPublicKey, '', 'callbackPublicKey unchanged')
            assert.equal(device.callbackAuthKey, '', 'callbackAuthKey unchanged')
            assert.equal(device.callbackIsExpired, true, 'callbackIsExpired unchanged')
            assert.deepEqual(device.availableCommands, {}, 'availableCommands updated')
          })
      })

      it('should fail to return zombie session', () => {
        // zombie devices don't have an associated session
        deviceInfo.sessionTokenId = hex16()
        return db.updateDevice(accountData.uid, deviceInfo.deviceId, deviceInfo)
          .then((result) => {
            assert.deepEqual(result, {}, 'returned empty object')
            return db.accountDevices(accountData.uid)
          })
          .then((devices) => {
            assert.equal(devices.length, 0, 'devices length 0')
          })
      })

      it('should fail add multiple device to session', () => {
        const anotherDevice = makeMockDevice(sessionTokenData.tokenId)
        return db.createDevice(accountData.uid, anotherDevice.deviceId, anotherDevice)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 409, 'err.code')
            assert.equal(err.errno, 101, 'err.errno')
          })
      })

      it('should fail to update non-existent device', () => {
        return db.updateDevice(accountData.uid, hex16(), deviceInfo)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
      })

      it('availableCommands are not cleared if not specified', () => {
        const newDevice = Object.assign({}, deviceInfo)
        delete newDevice.availableCommands
        return db.updateDevice(accountData.uid, deviceInfo.deviceId, newDevice)
          .then(() => {
            return db.device(accountData.uid, deviceInfo.deviceId)
          })
          .then(device => assert.deepEqual(device.availableCommands, {
            'https://identity.mozilla.com/cmd/display-uri': 'metadata-bundle'
          }))
      })

      it('availableCommands are overwritten on update', () => {
        const newDevice = Object.assign({}, deviceInfo, {
          availableCommands: {
            foo: 'bar',
            second: 'command'
          }
        })
        return db.updateDevice(accountData.uid, deviceInfo.deviceId, newDevice)
          .then(() => {
            return db.device(accountData.uid, deviceInfo.deviceId)
          })
          .then(device => assert.deepEqual(device.availableCommands, {
            foo: 'bar',
            second: 'command'
          }))
      })

      it('availableCommands can update metadata on an existing command', () => {
        const newDevice = Object.assign({}, deviceInfo, {
          availableCommands: {
            'https://identity.mozilla.com/cmd/display-uri': 'new-metadata'
          }
        })
        return db.updateDevice(accountData.uid, deviceInfo.deviceId, newDevice)
          .then(() => {
            return db.device(accountData.uid, deviceInfo.deviceId)
          })
          .then(device => assert.deepEqual(device.availableCommands, {
            'https://identity.mozilla.com/cmd/display-uri': 'new-metadata'
          }))
      })

      it('should fail to delete non-existent device', () => {
        return db.deleteDevice(accountData.uid, hex16())
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
      })

      it('should correctly handle multiple devices with different availableCommands maps', () => {
        const sessionToken2 = makeMockSessionToken(accountData.uid)
        const deviceInfo2 = Object.assign(makeMockDevice(sessionToken2.tokenId), {
          availableCommands: {
            'https://identity.mozilla.com/cmd/display-uri': 'device-two-metadata',
            'extra-command': 'extra-data'
          }
        })
        const sessionToken3 = makeMockSessionToken(accountData.uid)
        const deviceInfo3 = Object.assign(makeMockDevice(sessionToken3.tokenId), {
          availableCommands: {}
        })

        return db.createSessionToken(sessionToken2.tokenId, sessionToken2)
          .then(() => db.createDevice(accountData.uid, deviceInfo2.deviceId, deviceInfo2))
          .then(() => db.createSessionToken(sessionToken3.tokenId, sessionToken3))
          .then(() => db.createDevice(accountData.uid, deviceInfo3.deviceId, deviceInfo3))
          .then(() => db.accountDevices(accountData.uid))
          .then(devices => {
            assert.equal(devices.length, 3, 'devices length 3')

            const device1 = devices.find(d => d.sessionTokenId.equals(sessionTokenData.tokenId))
            assert.ok(device1, 'found first device')
            assert.deepEqual(device1.availableCommands, deviceInfo.availableCommands, 'device1 availableCommands')

            const device2 = devices.find(d => d.sessionTokenId.equals(sessionToken2.tokenId))
            assert.ok(device2, 'found second device')
            assert.deepEqual(device2.availableCommands, deviceInfo2.availableCommands, 'device2 availableCommands')

            const device3 = devices.find(d => d.sessionTokenId.equals(sessionToken3.tokenId))
            assert.ok(device3, 'found third device')
            assert.deepEqual(device3.availableCommands, deviceInfo3.availableCommands, 'device3 availableCommands')
          })
      })

      it('should correctly handle multiple sessions with different availableCommands maps', () => {
        const sessionToken2 = makeMockSessionToken(accountData.uid)
        const deviceInfo2 = Object.assign(makeMockDevice(sessionToken2.tokenId), {
          availableCommands: {
            'https://identity.mozilla.com/cmd/display-uri': 'device-two-metadata',
            'extra-command': 'extra-data'
          }
        })
        const sessionToken3 = makeMockSessionToken(accountData.uid)

        return db.createSessionToken(sessionToken2.tokenId, sessionToken2)
          .then(() => db.createDevice(accountData.uid, deviceInfo2.deviceId, deviceInfo2))
          .then(() => db.createSessionToken(sessionToken3.tokenId, sessionToken3))
          .then(() => db.sessions(accountData.uid))
          .then(sessions => {
            assert.equal(sessions.length, 3, 'sessions length 3')

            const session1 = sessions.find(s => s.tokenId.equals(sessionTokenData.tokenId))
            assert.ok(session1, 'found first session')
            assert.deepEqual(session1.deviceAvailableCommands, deviceInfo.availableCommands, 'session1 availableCommands')

            const session2 = sessions.find(s => s.tokenId.equals(sessionToken2.tokenId))
            assert.ok(session2, 'found second session')
            assert.deepEqual(session2.deviceAvailableCommands, deviceInfo2.availableCommands, 'session2 availableCommands')

            const session3 = sessions.find(s => s.tokenId.equals(sessionToken3.tokenId))
            assert.ok(session3, 'found third session')
            assert.deepEqual(session3.deviceId, null, 'session3 deviceId')
            assert.deepEqual(session3.deviceAvailableCommands, null, 'session3 availableCommands')
          })
      })

      it('should delete session when device is deleted', () => {
        return db.deleteDevice(accountData.uid, deviceInfo.deviceId)
          .then(result => {
            assert.deepEqual(result, {sessionTokenId: sessionTokenData.tokenId})

            // Fetch all of the devices for the account
            return db.accountDevices(accountData.uid)
          })
          .then((devices) => assert.equal(devices.length, 0, 'devices length 0'))
      })
    })

    describe('db.resetAccount', () => {
      let passwordForgotTokenData, sessionTokenData, deviceInfo
      beforeEach(() => {
        sessionTokenData = makeMockSessionToken(accountData.uid, true)
        passwordForgotTokenData = makeMockForgotPasswordToken(accountData.uid)
        deviceInfo = makeMockDevice(sessionTokenData.tokenId)

        return db.createSessionToken(sessionTokenData.tokenId, sessionTokenData)
          .then(() => db.createDevice(accountData.uid, deviceInfo.deviceId, deviceInfo))
          .then(() => db.createPasswordForgotToken(passwordForgotTokenData.tokenId, passwordForgotTokenData))
      })

      it('should verify account upon forgot token creation', () => {
        return db.accountEmails(accountData.uid)
          .then((emails) => {
            // Account should be unverified
            assert.equal(emails.length, 1, 'correct number of emails')
            assert.equal(!! emails[0].isVerified, false, 'email is not verified')
            assert.equal(!! emails[0].isPrimary, true, 'email is primary')

            return db.forgotPasswordVerified(passwordForgotTokenData.tokenId, passwordForgotTokenData)
          })
          .then(() => db.accountEmails(accountData.uid))
          .then((emails) => {
            // Account should be verified
            assert.equal(emails.length, 1, 'correct number of emails')
            assert.equal(!! emails[0].isVerified, true, 'email is verified')
            assert.equal(!! emails[0].isPrimary, true, 'email is primary')
          })
      })

      it('should remove devices after account reset', () => {
        return db.accountDevices(accountData.uid)
          .then((devices) => {
            assert.equal(devices.length, 1, 'The devices length should be one')
            return db.resetAccount(accountData.uid, accountData)
          })
          .then(() => db.accountDevices(accountData.uid))
          .then((devices) => {
            assert.equal(devices.length, 0, 'The devices length should be zero')
          })
      })

      it('should remove session after account reset', () => {
        return db.resetAccount(accountData.uid, accountData)
          .then(() => db.sessionToken(sessionTokenData.tokenId))
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
      })

      it('should still retrieve account after account reset', () => {
        return db.account(accountData.uid)
          .then((account) => {
            assert.ok(account, 'account exists')
            return db.resetAccount(accountData.uid, accountData)
          })
          .then(() => db.account(accountData.uid))
          .then((account) => assert.ok(account, 'account exists'))
      })

    })

    describe('db.securityEvents', () => {
      let session1, session2, session3, uid1, uid2
      const evA = 'account.login', evB = 'account.create', evC = 'account.reset'
      const addr1 = '127.0.0.1', addr2 = '::127.0.0.2'

      function insert(uid, addr, name, session) {
        return db.createSecurityEvent({
          uid: uid,
          ipAddr: addr,
          name: name,
          tokenId: session
        })
      }

      beforeEach(() => {
        session1 = makeMockSessionToken(accountData.uid)
        session2 = makeMockSessionToken(accountData.uid)
        // Make session verified
        delete session2.tokenVerificationId

        session3 = makeMockSessionToken(accountData.uid)

        uid1 = accountData.uid
        uid2 = newUuid()

        return P.all([
          db.createSessionToken(session1.tokenId, session1),
          db.createSessionToken(session2.tokenId, session2),
          db.createSessionToken(session3.tokenId, session3)
        ])
        // Don't paralleize these, the order of them matters
        // because they record timestamps in the db.
          .then(() => insert(uid1, addr1, evA, session2.tokenId).delay(10))
          .then(() => insert(uid1, addr1, evB, session1.tokenId).delay(10))
          .then(() => insert(uid1, addr1, evC).delay(10))
          .then(() => insert(uid1, addr2, evA, session3.tokenId).delay(10))
          .then(() => insert(uid2, addr1, evA, hex32()))
      })

      it('should get security event', () => {
        return db.securityEvents({id: uid1, ipAddr: addr1})
          .then((results) => {
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
          })
      })

      it('should get event after session verified', () => {
        return db.verifyTokens(session1.tokenVerificationId, {uid: uid1})
          .then(() => db.securityEvents({id: uid1, ipAddr: addr1}))
          .then((results) => {
            assert.equal(results.length, 3, 'three events for uid and addr')
            assert.equal(!! results[0].verified, true, 'first session verified')
            assert.equal(!! results[1].verified, true, 'second session verified')
            assert.equal(!! results[2].verified, true, 'third session verified')
          })
      })

      it('should get second address', () => {
        return db.securityEvents({id: uid1, ipAddr: addr2})
          .then((results) => {
            assert.equal(results.length, 1, 'one event for addr2')
            assert.equal(results[0].name, evA)
            assert.equal(!! results[0].verified, false, 'session3 not verified yet')
          })
      })

      it('should get second addr after deleting unverified session', () => {
        return db.deleteSessionToken(session3.tokenId)
          .then(() => db.securityEvents({id: uid1, ipAddr: addr2}))
          .then((results) => {
            assert.equal(results.length, 1, 'one event for addr2')
            assert.equal(results[0].name, evA)
            assert.equal(!! results[0].verified, false, 'session3 not verified yet')
          })
      })

      it('should get with IPv6', () => {
        return db.securityEvents({id: uid1, ipAddr: '::' + addr1})
          .then((results) => assert.equal(results.length, 3, 'three events for ipv6 addr'))
      })

      it('should fail with unknown uid', () => {
        return db.securityEvents({id: newUuid(), ipAddr: addr1})
          .then((results) => assert.equal(results.length, 0, 'no events for unknown uid'))
      })
    })

    describe('db.deleteAccount', () => {
      let sessionTokenData
      beforeEach(() => {
        sessionTokenData = makeMockSessionToken(accountData.uid)

        return db.createSessionToken(sessionTokenData.tokenId, sessionTokenData)
          .then(() => db.accountExists(accountData.emailBuffer))
          .then((exists) => {
            assert.ok(exists, 'account exists')
            return db.deleteAccount(accountData.uid)
          })
      })

      it('should have delete account', () => {
        return db.accountExists(accountData.emailBuffer)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
      })

      it('should fail to verify session', () => {
        return db.verifyTokens(sessionTokenData.tokenVerificationId, accountData)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
      })

      it('should fail to fetch session', () => {
        return db.sessionToken(sessionTokenData.tokenId)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
      })
    })

    describe('reminders', () => {
      let accountData2, fetchQuery
      beforeEach(() => {
        accountData2 = createAccount()
        return db.createAccount(accountData2.uid, accountData2)
      })

      it('create and delete', () => {
        fetchQuery = {
          type: 'second',
          reminderTime: 1,
          reminderTimeOutdated: 100,
          limit: 20
        }

        return db.createVerificationReminder({uid: accountData.uid, type: 'second'})
          .then(() => P.delay(20))
          .then(() => db.fetchReminders({}, fetchQuery))
          .then((result) => {
            assert.equal(result[0].type, 'second', 'correct type')
            assert.equal(result[0].uid.toString('hex'), accountData.uid.toString('hex'), 'correct uid')
            return db.fetchReminders({}, fetchQuery)
          })
          .then((result) => assert.equal(result.length, 0, 'no more reminders'))
      })

      it('multiple accounts', () => {
        fetchQuery = {
          type: 'first',
          reminderTime: 1,
          reminderTimeOutdated: 3000,
          limit: 20
        }

        // create 'first' reminder for account one.
        return db.createVerificationReminder({uid: accountData.uid, type: 'first'})
        // create 'first' reminder for account two.
          .then(() => db.createVerificationReminder({uid: accountData2.uid, type: 'first'}))
          .then(() => P.delay(20))
          .then(() => db.fetchReminders({}, fetchQuery))
          .then((result) => {
            assert.equal(result.length, 2, 'correct size of result')
            assert.equal(result[0].type, 'first', 'correct type')
            assert.equal(result[1].type, 'first', 'correct type')
            return db.fetchReminders({}, fetchQuery)
          })
          .then((result) => assert.equal(result.length, 0, 'no more first reminders'))
      })

      it('multi fetch', () => {
        fetchQuery = {
          type: 'first',
          reminderTime: 1,
          reminderTimeOutdated: 100,
          limit: 20
        }

        // create 'first' reminder for account one.
        return db.createVerificationReminder({uid: accountData.uid, type: 'first'})
        // create 'first' reminder for account two.
          .then(() => db.createVerificationReminder({uid: accountData2.uid, type: 'first'}))
          .then(() => P.delay(20))
          .then(() => P.all([
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
          ]))
          .then((results) => {
            let found = 0
            results.forEach((result) => {
              if (result.length === 2) {
                found++
              }
            })

            assert.equal(found, 1, 'only one query has the result')
          })
      })
    })

    describe('unblockCodes', () => {
      let uid1, code1, code2
      beforeEach(() => {
        uid1 = newUuid()
        code1 = unblockCode()

        code2 = unblockCode()
        return P.all([
          db.createUnblockCode(uid1, code1),
          db.createUnblockCode(uid1, code2)
        ])
      })

      it('should fail to consume unknown code', () => {
        return db.consumeUnblockCode(newUuid(), code1)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
      })

      it('should fail to consume old unblock code', () => {
        return db.consumeUnblockCode(uid1, code1)
          .then((code) => {
            assert.ok(code)
            return db.consumeUnblockCode(uid1, code2)
              .then(assert.fail, (err) => {
                assert.equal(err.code, 404, 'err.code')
                assert.equal(err.errno, 116, 'err.errno')
              })
          })
      })

      it('should consume unblock code', () => {
        return db.consumeUnblockCode(uid1, code1)
          .then((code) => {
            assert(code.createdAt <= Date.now(), 'returns unblock code timestamp')
          })
      })

      it('should fail to consume code twice', () => {
        return db.consumeUnblockCode(uid1, code1)
          .then((code) => {
            assert(code.createdAt <= Date.now(), 'returns unblock code timestamp')
            return db.consumeUnblockCode(uid1, code1)
              .then(assert.fail, (err) => {
                assert.equal(err.code, 404, 'err.code')
                assert.equal(err.errno, 116, 'err.errno')
              })
          })
      })

      it('should delete all code when successfully consumed code', () => {
        return db.consumeUnblockCode(uid1, 'NOTREAL')
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
            return db.consumeUnblockCode(uid1, code1)
          })
          .then((code) => {
            assert(code.createdAt <= Date.now(), 'returns unblock code timestamp')
            return db.consumeUnblockCode(uid1, code2)
          }, assert.fail)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code')
            assert.equal(err.errno, 116, 'err.errno')
          })
      })
    })

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

    describe('emails', () => {
      let secondEmail
      beforeEach(() => {
        accountData = createAccount()
        accountData.emailVerified = true
        secondEmail = createEmail({
          uid: accountData.uid
        })

        return db.createAccount(accountData.uid, accountData)
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on account creation')

            return db.createEmail(accountData.uid, secondEmail)
          })
          .then((result) => assert.deepEqual(result, {}, 'Returned an empty object on email creation'))
      })

      it('should return only account email if no secondary email', () => {
        const anotherAccountData = createAccount()
        return db.createAccount(anotherAccountData.uid, anotherAccountData)
          .then(() => db.accountEmails(anotherAccountData.uid))
          .then((result) => {
            assert.equal(result.length, 1, 'one email returned')

            // Check first email is email from accounts table
            assert.equal(result[0].email, anotherAccountData.email, 'matches account email')
            assert.equal(!! result[0].isPrimary, true, 'isPrimary is true on account email')
            assert.equal(!! result[0].isVerified, anotherAccountData.emailVerified, 'matches account emailVerified')
          })
      })

      it('should return secondary emails', () => {
        return db.accountEmails(accountData.uid)
          .then((result) => {
            assert.equal(result.length, 2, 'two emails returned')

            // Check first email is email from accounts table
            assert.equal(result[0].email, accountData.email, 'matches account email')
            assert.equal(!! result[0].isPrimary, true, 'isPrimary is true on account email')
            assert.equal(!! result[0].isVerified, accountData.emailVerified, 'matches account emailVerified')

            // Check second email is from emails table
            assert.equal(result[1].email, secondEmail.email, 'matches secondEmail email')
            assert.equal(!! result[1].isPrimary, false, 'isPrimary is false on secondEmail email')
            assert.equal(!! result[1].isVerified, secondEmail.isVerified, 'matches secondEmail isVerified')
          })
      })

      it('should get secondary email', () => {
        return db.getSecondaryEmail(secondEmail.email)
          .then((result) => {
            assert.equal(result.email, secondEmail.email, 'matches secondEmail email')
            assert.equal(!! result.isPrimary, false, 'isPrimary is false on secondEmail email')
            assert.equal(!! result.isVerified, secondEmail.isVerified, 'matches secondEmail isVerified')
          })
      })

      it('should verify secondary email', () => {
        return db.verifyEmail(secondEmail.uid, secondEmail.emailCode)
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on email verification')
            return db.accountEmails(accountData.uid)
          })
          .then((result) => {
            assert.equal(result.length, 2, 'two email returned')

            // Check second email is from emails table and verified
            assert.equal(result[1].email, secondEmail.email, 'matches secondEmail email')
            assert.equal(!! result[1].isPrimary, false, 'isPrimary is false on secondEmail email')
            assert.equal(!! result[1].isVerified, true, 'secondEmail isVerified is true')
          })
      })

      it('should delete email', () => {
        return db.deleteEmail(secondEmail.uid, secondEmail.email)
          .then((result) => {
            assert.deepEqual(result, {}, 'Returned an empty object on email deletion')

            // Get all emails and check to see if it has been removed
            return db.accountEmails(accountData.uid)
          })
          .then((result) => {
            // Verify that the email has been removed
            assert.equal(result.length, 1, 'one email returned')

            // Only email returned should be from users account
            assert.equal(result[0].email, accountData.email, 'matches account email')
            assert.equal(!! result[0].isPrimary, true, 'isPrimary is true on account email')
            assert.equal(!! result[0].isVerified, accountData.emailVerified, 'matches account emailVerified')

          })
      })

      it('should free secondary email on account deletion', () => {
        let anotherAccountData
        return db.verifyEmail(secondEmail.uid, secondEmail.emailCode)
          .then(() => db.deleteAccount(accountData.uid))
          .then(() => {
            anotherAccountData = createAccount()
            anotherAccountData.email = secondEmail.email
            anotherAccountData.normalizedEmail = secondEmail.normalizedEmail

            return db.createAccount(anotherAccountData.uid, anotherAccountData)
          })
          .then((result) => {
            assert.deepEqual(result, {}, 'successfully created an account')

            // Attempt to create secondary email address
            return db.createEmail(accountData.uid, secondEmail)
              .then(assert.fail, (err) => assert.equal(err.errno, 101, 'Correct errno'))
          })
      })

      it('should fail to add secondary email that exists on account table', () => {
        const anotherEmail = createEmail({email: accountData.email})
        return db.createEmail(accountData.uid, anotherEmail)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 101, 'should return duplicate entry errno')
            assert.equal(err.code, 409, 'should return duplicate entry code')
          })
      })

      it('should fail to add duplicate secondary email', () => {
        const anotherEmail = createEmail({email: secondEmail.email})
        return db.createEmail(accountData.uid, anotherEmail)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 101, 'should return duplicate entry errno')
            assert.equal(err.code, 409, 'should return duplicate entry code')
          })
      })

      it('should fail to delete primary email', () => {
        return db.deleteEmail(accountData.uid, accountData.normalizedEmail)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 136, 'should return email delete errno')
            assert.equal(err.code, 400, 'should return email delete code')
          })
      })

      it('should fail to create account that used a secondary email as primary', () => {
        const anotherAccount = createAccount()
        anotherAccount.email = secondEmail.email
        anotherAccount.normalizedEmail = secondEmail.normalizedEmail
        return db.createAccount(anotherAccount.uid, anotherAccount)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 101, 'should return duplicate entry errno')
            assert.equal(err.code, 409, 'should return duplicate entry code')
          })
      })

      it('should fail to get non-existent secondary email', () => {
        return db.getSecondaryEmail('non-existent@email.com')
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'should return not found errno')
            assert.equal(err.code, 404, 'should return not found code')
          })
      })
    })

    describe('sign-in codes', () => {
      let SIGNIN_CODES, NOW, TIMESTAMPS, FLOW_IDS

      beforeEach(() => {
        SIGNIN_CODES = [hex6(), hex6(), hex6()]
        NOW = Date.now()
        TIMESTAMPS = [NOW - 1, NOW - 2, NOW - config.signinCodesMaxAge - 1]
        FLOW_IDS = [hex32(), hex32(), hex32()]

        return P.all([
          db.createSigninCode(SIGNIN_CODES[0], accountData.uid, TIMESTAMPS[0], FLOW_IDS[0]),
          db.createSigninCode(SIGNIN_CODES[1], accountData.uid, TIMESTAMPS[1], FLOW_IDS[1]),
          db.createSigninCode(SIGNIN_CODES[2], accountData.uid, TIMESTAMPS[2], FLOW_IDS[2])
        ])
          .then((results) => {
            results.forEach(r => assert.deepEqual(r, {}, 'createSigninCode should return an empty object'))
          })
      })

      it('should fail to create duplicate sign-in code', () => {
        return db.createSigninCode(SIGNIN_CODES[0], accountData.uid, TIMESTAMPS[0])
          .then(assert.fail, (err) => {
            assert(err, 'db.createSigninCode should reject with an error')
            assert.equal(err.code, 409, 'db.createSigninCode should reject with code 404')
            assert.equal(err.errno, 101, 'db.createSigninCode should reject with errno 116')
          })
      })

      it('should consume sign-in code', () => {
        return db.consumeSigninCode(SIGNIN_CODES[0])
          .then((result) => {
            assert.deepEqual(result, {
              email: accountData.email,
              flowId: FLOW_IDS[0]
            }, 'db.consumeSigninCode should return an email address and flowId for non-expired codes')
          })
      })

      it('should fail consume sign-in code twice', () => {
        return db.consumeSigninCode(SIGNIN_CODES[0])
          .then(() => db.consumeSigninCode(SIGNIN_CODES[0]))
          .then(assert.fail, (err) => {
            assert(err, 'db.consumeSigninCode should reject with an error')
            assert.equal(err.code, 404, 'db.consumeSigninCode should reject with code 404')
            assert.equal(err.errno, 116, 'db.consumeSigninCode should reject with errno 116')
          })
      })

      it('should fail consume expired sign-in code', () => {
        return db.consumeSigninCode(SIGNIN_CODES[2])
          .then(assert.fail, (err) => {
            assert(err, 'db.consumeSigninCode should reject with an error')
            assert.equal(err.code, 404, 'db.consumeSigninCode should reject with code 404')
            assert.equal(err.errno, 116, 'db.consumeSigninCode should reject with errno 116')
          })
      })

      it('should fail to use sign-in code from deleted account', () => {
        return db.deleteAccount(accountData.uid)
          .then(() => {
            return db.consumeSigninCode(SIGNIN_CODES[1])
              .then(assert.fail, (err) => {
                assert(err, 'db.consumeSigninCode should reject with an error')
                assert.equal(err.code, 404, 'db.consumeSigninCode should reject with code 404')
                assert.equal(err.errno, 116, 'db.consumeSigninCode should reject with errno 116')
              })
          })
      })
    })

    it('should keep account emails and emails in sync', () => {
      return P.all([db.accountEmails(accountData.uid), db.account(accountData.uid)])
        .spread(function (emails, account) {
          assert.equal(emails[0].email, account.email, 'correct email returned')
          assert.equal(!! emails[0].isVerified, !! account.emailVerified, 'correct email verification')
          assert.equal(!! emails[0].isPrimary, true, 'correct email primary')

          // Verify account email
          return db.verifyEmail(account.uid, account.emailCode)
        })
        .then(function (result) {
          assert.deepEqual(result, {}, 'returned empty response on verify email')
          return P.all([db.accountEmails(accountData.uid), db.account(accountData.uid)])
        })
        .spread(function (emails, account) {
          assert.equal(emails[0].email, account.email, 'correct email returned')
          assert.equal(!! emails[0].isVerified, !! account.emailVerified, 'correct email verification')
          assert.equal(!! emails[0].isPrimary, true, 'correct email primary')
        })
    })

    describe('db.resetAccountTokens', () => {
      let passwordChangeToken, passwordForgotToken, accountResetToken

      beforeEach(() => {
        accountData.emailVerified = true
        passwordChangeToken = makeMockChangePasswordToken(accountData.uid)
        passwordForgotToken = makeMockForgotPasswordToken(accountData.uid)
        accountResetToken = makeMockAccountResetToken(accountData.uid, passwordForgotToken.tokenId)
      })

      it('should remove account reset tokens', () => {
        return db.createPasswordForgotToken(passwordForgotToken.tokenId, passwordForgotToken)
          .then(() => {
            // db.forgotPasswordVerified requires a passwordForgotToken to have been made
            return db.forgotPasswordVerified(passwordForgotToken.tokenId, accountResetToken)
              .then(() => {
                return db.accountResetToken(passwordForgotToken.tokenId)
                  .then((res) => assert.deepEqual(res.uid, accountData.uid, 'token belongs to account'))
              })
          })
          .then(() => db.resetAccountTokens(accountData.uid))
          .then(() => {
            return db.accountResetToken(passwordForgotToken.tokenId)
              .then(() => assert.equal(false, 'should not have return account reset token token'))
              .catch((err) => assert.equal(err.errno, 116, 'did not find password change token'))
          })
      })

      it('should remove password change tokens', () => {
        return db.createPasswordChangeToken(passwordChangeToken.tokenId, passwordChangeToken)
          .then(() => {
            return db.passwordChangeToken(passwordChangeToken.tokenId)
              .then((res) => assert.deepEqual(res.uid, accountData.uid, 'token belongs to account'))
          })
          .then(() => db.resetAccountTokens(accountData.uid))
          .then(() => {
            return db.passwordChangeToken(passwordChangeToken.tokenId)
              .then(() => assert.equal(false, 'should not have return password change token'))
              .catch((err) => assert.equal(err.errno, 116, 'did not find password change token'))
          })
      })

      it('should remove password forgot tokens', () => {
        return db.createPasswordForgotToken(passwordForgotToken.tokenId, passwordForgotToken)
          .then(() => {
            return db.passwordForgotToken(passwordForgotToken.tokenId)
              .then((res) => assert.deepEqual(res.uid, accountData.uid, 'token belongs to account'))
          })
          .then(() => db.resetAccountTokens(accountData.uid))
          .then(() => {
            return db.passwordForgotToken(passwordForgotToken.tokenId)
              .then(() => assert.equal(false, 'should not have return password forgot token'))
              .catch((err) => assert.equal(err.errno, 116, 'did not find password forgot token'))
          })
      })
    })

    describe('db.setPrimaryEmail', () => {
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
        let sessionTokenData
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
            sessionTokenData = makeMockSessionToken(account.uid)
            return db.createSessionToken(sessionTokenData.tokenId, sessionTokenData)
              .then(() => {
                return db.sessionToken(sessionTokenData.tokenId)
              })
          })
          .then((session) => {
            assert.equal(session.email, secondEmail.email, 'should equal new primary email')
            assert.deepEqual(session.emailCode, secondEmail.emailCode, 'should equal new primary emailCode')
            assert.deepEqual(session.uid, account.uid, 'should equal account uid')
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
        sessionToken = makeMockSessionToken(account.uid, false)
        tokenVerificationCode = sessionToken.tokenVerificationCode
        return db.createSessionToken(tokenId, sessionToken)
          .then(() => {
            return db.sessionToken(tokenId)
          })
          .then((session) => {
            // Returns unverified session
            assert.equal(session.mustVerify, sessionToken.mustVerify, 'mustVerify must match sessionToken')
            assert.equal(session.tokenVerificationId.toString('hex'), sessionToken.tokenVerificationId.toString('hex'), 'tokenVerificationId must match sessionToken')

            // Verify the session
            return db.verifyTokenCode({code: tokenVerificationCode}, account)
          })
          .then(() => {
            return db.sessionToken(tokenId)
          })
          .then((session) => {
            // Returns verified session
            assert.equal(!! session.mustVerify, false, 'mustVerify is false')
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

    describe('Totp handling', () => {
      let sharedSecret, epoch
      beforeEach(() => {
        sharedSecret = crypto.randomBytes(40).toString('hex')
        epoch = 0
        return db.createTotpToken(accountData.uid, {sharedSecret, epoch})
          .then((result) => assert.ok(result, 'token created'))
      })

      it('should create totp token', () => {
        return db.totpToken(accountData.uid)
          .then((token) => {
            assert.equal(token.sharedSecret, sharedSecret, 'correct sharedSecret')
            assert.equal(token.epoch, epoch, 'correct epoch')
            assert.equal(token.verified, false, 'correct verified')
            assert.equal(token.enabled, true, 'correct enabled')
          })
      })

      it('should fail to get unknown totp token', () => {
        return db.totpToken(newUuid())
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'correct errno, not found')
          })
      })

      it('should fail to create second token for same user', () => {
        return db.createTotpToken(accountData.uid, {sharedSecret, epoch})
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 101, 'correct errno, duplicate')
          })
      })

      it('should delete totp token', () => {
        return db.deleteTotpToken(accountData.uid)
          .then((result) => {
            assert.ok(result)
            return db.totpToken(accountData.uid)
              .then(assert.fail, (err) => {
                assert.equal(err.errno, 116, 'correct errno, not found')
              })
          })
      })

      it('should update totp token', () => {
        return db.updateTotpToken(accountData.uid, {verified: true, enabled: true})
          .then((result) => {
            assert.ok(result)
            return db.totpToken(accountData.uid)
              .then((token) => {
                assert.equal(token.sharedSecret, sharedSecret, 'correct sharedSecret')
                assert.equal(token.epoch, epoch, 'correct epoch')
                assert.equal(token.verified, true, 'correct verified')
                assert.equal(token.enabled, true, 'correct enable')
              })
          })
      })

      it('should fail to update unknown totp token', () => {
        return db.updateTotpToken(newUuid(), {verified: true, enabled: true})
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'correct errno, not found')
          })
      })
    })

    describe('db.verifyTokensWithMethod', () => {
      let account, sessionToken, tokenId
      before(() => {
        account = createAccount()
        account.emailVerified = true
        tokenId = hex32()
        sessionToken = makeMockSessionToken(account.uid, false)
        return db.createAccount(account.uid, account)
          .then(() => db.createSessionToken(tokenId, sessionToken))
          .then(() => db.sessionToken(tokenId))
          .then((session) => {
            // Returns unverified session
            assert.equal(session.tokenVerificationId.toString('hex'), sessionToken.tokenVerificationId.toString('hex'), 'tokenVerificationId must match sessionToken')
            assert.equal(session.verificationMethod, undefined, 'verificationMethod not set')
          })
      })

      it('should fail to verify with unknown sessionId', () => {
        const verifyOptions = {
          verificationMethod: 'totp-2fa'
        }
        return db.verifyTokensWithMethod(hex32(), verifyOptions)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'correct errno, not found')
          })
      })

      it('should update session verificationMethod', () => {
        const verifyOptions = {
          verificationMethod: 'totp-2fa'
        }
        return db.verifyTokens(sessionToken.tokenVerificationId, account)
          .then(() => {
            return db.sessionToken(tokenId)
          }, assert.fail)
          .then((token) => {
            assert.equal(token.mustVerify, false, 'mustVerify is false')
            assert.equal(token.tokenVerificationId, null, 'tokenVerificationId is null')
            assert.equal(token.verificationMethod, null, 'verificationMethod is null')
            return db.verifyTokensWithMethod(tokenId, verifyOptions)
          })
          .then(() => {
            return db.sessionToken(tokenId)
          }, assert.fail)
          .then((token) => {
            assert.equal(token.mustVerify, false, 'mustVerify is false')
            assert.equal(token.tokenVerificationId, null, 'tokenVerificationId is null')
            assert.equal(token.verificationMethod, 2, 'verificationMethod is set')
          })
      })

      it('should fail to verify unknown verification method', () => {
        const verifyOptions = {
          verificationMethod: 'super-invalid-method'
        }
        return db.verifyTokensWithMethod(tokenId, verifyOptions)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 138, 'correct errno, invalid verification method')
          })
      })

      it('should verify with verification method', () => {
        const verifyOptions = {
          verificationMethod: 'totp-2fa'
        }
        return db.verifyTokensWithMethod(tokenId, verifyOptions)
          .then((res) => {
            assert.ok(res)

            // Ensure session really has been verified and correct methods set
            return db.sessionToken(tokenId)
          })
          .then((session) => {
            assert.equal(session.tokenVerificationId, undefined, 'tokenVerificationId must be undefined')
            assert.equal(session.verificationMethod, 2, 'verificationMethod set')
            assert.ok(session.verifiedAt, 'verifiedAt set')
          })
      })
    })

    describe('recovery codes', () => {
      let account
      beforeEach(() => {
        account = createAccount()
        account.emailVerified = true
        return db.createAccount(account.uid, account)
      })

      it('should fail to generate for unknown user', () => {
        return db.replaceRecoveryCodes(hex16(), 2)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'correct errno, not found')
          })
      })

      const codeLengthTest = [0, 4, 8]
      const codeTest = /^[a-zA-Z0-9]{0,20}$/
      codeLengthTest.forEach((num) => {
        it('should generate ' + num + ' recovery codes', () => {
          return db.replaceRecoveryCodes(account.uid, num)
            .then((codes) => {
              assert.equal(codes.length, num, 'correct number of codes')
              codes.forEach((code) => {
                assert.equal(codeTest.test(code), true, 'matches recovery code format')
              })
              assert.equal()
            }, (err) => {
              assert.equal(err.errno, 116, 'correct errno, not found')
            })
        })
      })

      it('should replace recovery codes', () => {
        let firstCodes
        return db.replaceRecoveryCodes(account.uid, 2)
          .then((codes) => {
            firstCodes = codes
            assert.equal(firstCodes.length, 2, 'correct number of codes')

            return db.replaceRecoveryCodes(account.uid, 3)
          })
          .then((codes) => {
            assert.equal(codes.length, 3, 'correct number of codes')
            assert.notDeepEqual(codes, firstCodes, 'codes are different')
          })
      })

      describe('should consume recovery codes', function () {
        // Consuming recovery codes is more time intensive since the scrypt hashes need
        // to be compared. Let set timeout higher than 2s default.
        this.timeout(12000)

        let recoveryCodes
        beforeEach(() => {
          return db.replaceRecoveryCodes(account.uid, 2)
            .then((codes) => {
              recoveryCodes = codes
              assert.equal(recoveryCodes.length, 2, 'correct number of recovery codes')
            })
        })

        it('should fail to consume recovery code with unknown uid', () => {
          return db.consumeRecoveryCode(hex16(), 'recoverycodez')
            .then(assert.fail, (err) => {
              assert.equal(err.errno, 116, 'correct errno, not found')
            })
        })

        it('should fail to consume recovery code with unknown code', () => {
          return db.replaceRecoveryCodes(account.uid, 3)
            .then(() => {
              return db.consumeRecoveryCode(account.uid, 'notvalidcode')
                .then(assert.fail, (err) => {
                  assert.equal(err.errno, 116, 'correct errno, unknown recovery code')
                })
            })
        })

        it('should fail to consume code twice', () => {
          return db.consumeRecoveryCode(account.uid, recoveryCodes[0])
            .then((result) => {
              assert.equal(result.remaining, 1, 'correct number of remaining codes')

              // Should fail to consume code twice
              return db.consumeRecoveryCode(account.uid, recoveryCodes[0])
                .then(assert.fail, (err) => {
                  assert.equal(err.errno, 116, 'correct errno, unknown recovery code')
                })
            })
        })

        it('should consume code', () => {
          return db.consumeRecoveryCode(account.uid, recoveryCodes[0])
            .then((result) => {
              assert.equal(result.remaining, 1, 'correct number of remaining codes')

              return db.consumeRecoveryCode(account.uid, recoveryCodes[1])
                .then((result) => {
                  assert.equal(result.remaining, 0, 'correct number of remaining codes')
                })
            })
        })
      })
    })

    describe('account recovery key', () => {
      let account, data
      beforeEach(() => {
        account = createAccount()
        return db.createAccount(account.uid, account)
          .then(() => {
            data = createRecoveryData()
            // Create a valid recovery key
            return db.createRecoveryKey(account.uid, data)
          })
          .then((res) => {
            assert.ok(res, 'empty response')
          })
      })

      it('should fail to create for unknown user', () => {
        return db.createRecoveryKey('12312312312', data)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'not found')
          })
      })

      it('should fail to create multiple keys', () => {
        data = createRecoveryData()
        return db.createRecoveryKey(account.uid, data)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 101, 'record exists')
          })
      })

      it('should get account recovery key', () => {
        const options = {
          id: account.uid
        }
        return db.getRecoveryKey(options)
          .then((res) => {
            assert.equal(res.recoveryData, data.recoveryData, 'recovery data set')
            assert.equal(res.recoveryKeyId.toString('hex'), data.recoveryKeyId.toString('hex'), 'recovery data set')
          })
      })

      it('should fail to get key for incorrect user', () => {
        const options = {
          id: 'unknown'
        }
        return db.getRecoveryKey(options)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'not found')
          })
      })

      it('should fail to get unknown key', () => {
        account = createAccount()
        return db.createAccount(account.uid, account)
          .then(() => {
            const options = {
              id: account.uid
            }
            return db.getRecoveryKey(options)
              .then(assert.fail, (err) => {
                assert.equal(err.errno, 116, 'not found')
              })
          })
      })

      it('should delete account recovery key', () => {
        const options = {
          id: account.uid,
          recoveryKeyId: data.recoveryKeyId
        }
        return db.deleteRecoveryKey(options)
          .then((res) => {
            assert.ok(res)
          })
      })
    })

    after(() => db.close())
  })
}
