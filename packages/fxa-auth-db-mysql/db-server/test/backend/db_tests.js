/* eslint-disable no-prototype-builtins */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const { assert } = require('chai');
const crypto = require('crypto');
const P = require('bluebird');
const util = require('../../../lib/db/util');
const { normalizeEmail } = require('fxa-shared/email/helpers');

const zeroBuffer16 = Buffer.from('00000000000000000000000000000000', 'hex');
const zeroBuffer32 = Buffer.from(
  '0000000000000000000000000000000000000000000000000000000000000000',
  'hex'
);
const now = Date.now();

function newUuid() {
  return crypto.randomBytes(16);
}

function unblockCode() {
  return crypto.randomBytes(4).toString('hex');
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
  };
  account.normalizedEmail = normalizeEmail(account.email);
  account.emailBuffer = Buffer.from(account.email);
  return account;
}

function createEmail(data) {
  const email = {
    email: ('' + Math.random()).substr(2) + '@bar.com',
    uid: data.uid,
    emailCode: data.emailCode || crypto.randomBytes(16),
    isVerified: data.isVerified || false,
    verifiedAt: data.verifiedAt || null,
    isPrimary: false,
    createdAt: Date.now(),
  };
  email.email = data.email || email.email;
  email.normalizedEmail = normalizeEmail(email.email);

  return email;
}

function hex(len) {
  return Buffer.from(crypto.randomBytes(len).toString('hex'), 'hex');
}
function hex6() {
  return hex(6);
}
function hex16() {
  return hex(16);
}
function hex32() {
  return hex(32);
}
// function hex64() { return hex(64) }
function hex96() {
  return hex(96);
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
    tokenVerificationCodeExpiresAt: Date.now() + 20000,
  };
  return sessionToken;
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
      'https://identity.mozilla.com/cmd/display-uri': 'metadata-bundle',
    },
  };
  device.deviceId = newUuid();
  return device;
}

function makeMockRefreshToken(uid) {
  const refreshToken = {
    tokenId: hex32(),
    uid: uid,
  };
  return refreshToken;
}

function makeMockOAuthDevice(tokenId) {
  const device = {
    refreshTokenId: tokenId,
    name: 'Test OAuth Device',
    type: 'mobile',
    createdAt: Date.now(),
    callbackURL: 'https://push.server',
    callbackPublicKey: 'foo',
    callbackAuthKey: 'bar',
    callbackIsExpired: false,
    availableCommands: {
      'https://identity.mozilla.com/cmd/display-uri': 'metadata-bundle',
    },
  };
  device.deviceId = newUuid();
  return device;
}

function makeMockForgotPasswordToken(uid) {
  const token = {
    data: hex32(),
    tokenId: hex32(),
    uid: uid,
    passCode: hex16(),
    tries: 1,
    createdAt: Date.now(),
  };
  return token;
}

function makeMockKeyFetchToken(uid, verified) {
  const keyFetchToken = {
    authKey: hex32(),
    uid: uid,
    keyBundle: hex96(),
    createdAt: now + 2,
    tokenVerificationId: verified ? undefined : hex16(),
  };
  keyFetchToken.tokenId = hex32();
  return keyFetchToken;
}

function makeMockChangePasswordToken(uid) {
  const token = {
    data: hex32(),
    uid: uid,
    createdAt: Date.now(),
  };
  token.tokenId = hex32();
  return token;
}

function makeMockAccountResetToken(uid, tokenId) {
  const token = {
    tokenId: tokenId || hex32(),
    data: hex32(),
    uid: uid,
    createdAt: now + 5,
  };
  return token;
}

function createRecoveryData() {
  const data = {
    recoveryKeyId: hex(16),
    recoveryData: crypto.randomBytes(32).toString('hex'),
    enabled: true,
  };
  return data;
}

// To run these tests from a new backend, pass the config and an already created
// DB API for them to be run against.
module.exports = function (config, DB) {
  describe('db_tests', () => {
    let db, accountData;
    before(() => {
      return DB.connect(config).then((db_) => {
        db = db_;
        return db.ping();
      });
    });

    beforeEach(() => {
      accountData = createAccount();
      return db.createAccount(accountData.uid, accountData);
    });

    describe('db.account', () => {
      beforeEach(() => {
        return db
          .accountExists(accountData.emailBuffer)
          .then((exists) =>
            assert(exists, 'account exists for this email address')
          );
      });

      it('should create account', () => {
        const anotherAccountData = createAccount();
        return db
          .accountExists(anotherAccountData.emailBuffer)
          .then(assert.fail, (err) => assert.equal(err.code, 404, 'Not found'))
          .then(() =>
            db.createAccount(anotherAccountData.uid, anotherAccountData)
          )
          .then((account) => {
            assert.deepEqual(
              account,
              {},
              'Returned an empty object on account creation'
            );
            return db
              .accountExists(Buffer.from(anotherAccountData.email))
              .then(
                (exists) =>
                  assert(exists, 'account exists for this email address'),
                assert.fail
              );
          });
      });

      it('should fail with duplicate account', () => {
        return db
          .createAccount(accountData.uid, accountData)
          .then(assert.fail, (err) => {
            assert(err, 'trying to create the same account produces an error');
            assert.equal(err.code, 409, 'error code');
            assert.equal(err.errno, 101, 'error errno');
            assert.equal(err.message, 'Record already exists', 'message');
            assert.equal(err.error, 'Conflict', 'error');
          });
      });

      it('should return account', () => {
        return db.account(accountData.uid).then((account) => {
          assert.deepEqual(account.uid, accountData.uid, 'uid');
          assert.equal(account.email, accountData.email, 'email');
          assert.deepEqual(
            account.emailCode,
            accountData.emailCode,
            'emailCode'
          );
          assert.equal(
            !!account.emailVerified,
            accountData.emailVerified,
            'emailVerified'
          );
          assert.deepEqual(account.kA, accountData.kA, 'kA');
          assert.deepEqual(
            account.wrapWrapKb,
            accountData.wrapWrapKb,
            'wrapWrapKb'
          );
          assert(!account.verifyHash, 'verifyHash field should be absent');
          assert.deepEqual(account.authSalt, accountData.authSalt, 'authSalt');
          assert.equal(
            account.verifierVersion,
            accountData.verifierVersion,
            'verifierVersion'
          );
          assert.equal(account.createdAt, accountData.createdAt, 'createdAt');
          assert.equal(
            account.verifierSetAt,
            accountData.createdAt,
            'verifierSetAt has been set to the same as createdAt'
          );
          assert.equal(account.locale, accountData.locale, 'locale');
          assert.equal(
            account.profileChangedAt,
            account.createdAt,
            'profileChangedAt set to createdAt'
          );
        });
      });

      it('should return email record', () => {
        return db.emailRecord(accountData.emailBuffer).then((account) => {
          assert.deepEqual(account.uid, accountData.uid, 'uid');
          assert.equal(account.email, accountData.email, 'email');
          assert.deepEqual(
            account.emailCode,
            accountData.emailCode,
            'emailCode'
          );
          assert.equal(
            !!account.emailVerified,
            accountData.emailVerified,
            'emailVerified'
          );
          assert.deepEqual(account.kA, accountData.kA, 'kA');
          assert.deepEqual(
            account.wrapWrapKb,
            accountData.wrapWrapKb,
            'wrapWrapKb'
          );
          assert(!account.verifyHash, 'verifyHash field should be absent');
          assert.deepEqual(account.authSalt, accountData.authSalt, 'authSalt');
          assert.equal(
            account.verifierVersion,
            accountData.verifierVersion,
            'verifierVersion'
          );
          assert.equal(
            account.verifierSetAt,
            accountData.verifierSetAt,
            'verifierSetAt'
          );
          assert.equal(
            account.hasOwnProperty('locale'),
            false,
            'locale not returned'
          );
        });
      });
    });

    describe('db.checkPassword', () => {
      it('should fail with incorrect password', () => {
        return db
          .checkPassword(accountData.uid, {
            verifyHash: Buffer.from(crypto.randomBytes(32)),
          })
          .then(assert.fail, (err) => {
            assert(err, 'incorrect password produces an error');
            assert.equal(err.code, 400, 'error code');
            assert.equal(err.errno, 103, 'error errno');
            assert.equal(err.message, 'Incorrect password', 'message');
            assert.equal(err.error, 'Bad request', 'error');
            return db.checkPassword(accountData.uid, {
              verifyHash: zeroBuffer32,
            });
          });
      });

      it('should be successful with correct password', () => {
        return db
          .checkPassword(accountData.uid, { verifyHash: zeroBuffer32 })
          .then((account) => {
            assert.deepEqual(account.uid, account.uid, 'uid');
            assert.lengthOf(Object.keys(account), 1);
          });
      });
    });

    describe('session token handling', () => {
      let sessionTokenData;
      beforeEach(() => {
        sessionTokenData = makeMockSessionToken(accountData.uid, false);
        return db.createSessionToken(
          sessionTokenData.tokenId,
          sessionTokenData
        );
      });

      it('should get sessions', () => {
        return db.sessions(accountData.uid).then((sessions) => {
          assert.isArray(sessions);
          assert.lengthOf(sessions, 1);

          assert.lengthOf(Object.keys(sessions[0]), 20);
          assert.equal(
            sessions[0].tokenId.toString('hex'),
            sessionTokenData.tokenId.toString('hex'),
            'tokenId is correct'
          );
          assert.equal(
            sessions[0].uid.toString('hex'),
            accountData.uid.toString('hex'),
            'uid is correct'
          );
          assert.equal(
            sessions[0].createdAt,
            sessionTokenData.createdAt,
            'createdAt is correct'
          );
          assert.equal(
            sessions[0].uaBrowser,
            sessionTokenData.uaBrowser,
            'uaBrowser is correct'
          );
          assert.equal(
            sessions[0].uaBrowserVersion,
            sessionTokenData.uaBrowserVersion,
            'uaBrowserVersion is correct'
          );
          assert.equal(
            sessions[0].uaOS,
            sessionTokenData.uaOS,
            'uaOS is correct'
          );
          assert.equal(
            sessions[0].uaOSVersion,
            sessionTokenData.uaOSVersion,
            'uaOSVersion is correct'
          );
          assert.equal(
            sessions[0].uaDeviceType,
            sessionTokenData.uaDeviceType,
            'uaDeviceType is correct'
          );
          assert.equal(
            sessions[0].uaFormFactor,
            sessionTokenData.uaFormFactor,
            'uaFormFactor is correct'
          );
          assert.equal(
            sessions[0].lastAccessTime,
            sessionTokenData.createdAt,
            'lastAccessTime is correct'
          );
          assert.equal(
            sessions[0].authAt,
            sessionTokenData.createdAt,
            'authAt is correct'
          );
        });
      });

      it('should create session', () => {
        accountData = createAccount();
        sessionTokenData = makeMockSessionToken(accountData.uid, false);
        return db
          .createAccount(accountData.uid, accountData)
          .then(() =>
            db.createSessionToken(sessionTokenData.tokenId, sessionTokenData)
          )
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on session token creation'
            );
            return db.sessions(accountData.uid);
          })
          .then((sessions) => {
            assert.isArray(sessions);
            assert.lengthOf(sessions, 1);
          });
      });

      it('should get session token', () => {
        return db.sessionToken(sessionTokenData.tokenId).then((token) => {
          assert.isFalse(token.hasOwnProperty('tokenId'));
          assert.deepEqual(
            token.tokenData,
            sessionTokenData.data,
            'token data matches'
          );
          assert.deepEqual(
            token.uid,
            accountData.uid,
            'token belongs to this account'
          );
          assert.equal(
            token.createdAt,
            sessionTokenData.createdAt,
            'createdAt is correct'
          );
          assert.equal(
            token.uaBrowser,
            sessionTokenData.uaBrowser,
            'uaBrowser is correct'
          );
          assert.equal(
            token.uaBrowserVersion,
            sessionTokenData.uaBrowserVersion,
            'uaBrowserVersion is correct'
          );
          assert.equal(token.uaOS, sessionTokenData.uaOS, 'uaOS is correct');
          assert.equal(
            token.uaOSVersion,
            sessionTokenData.uaOSVersion,
            'uaOSVersion is correct'
          );
          assert.equal(
            token.uaDeviceType,
            sessionTokenData.uaDeviceType,
            'uaDeviceType is correct'
          );
          assert.equal(
            token.uaFormFactor,
            sessionTokenData.uaFormFactor,
            'uaFormFactor is correct'
          );
          assert.equal(
            token.lastAccessTime,
            sessionTokenData.createdAt,
            'lastAccessTime was set'
          );
          assert.equal(
            token.authAt,
            sessionTokenData.createdAt,
            'authAt is correct'
          );
          assert.equal(
            !!token.emailVerified,
            accountData.emailVerified,
            'token emailVerified is same as account emailVerified'
          );
          assert.equal(
            token.email,
            accountData.email,
            'token email same as account email'
          );
          assert.deepEqual(
            token.emailCode,
            accountData.emailCode,
            'token emailCode same as account emailCode'
          );
          assert.equal(
            token.verifierSetAt,
            accountData.verifierSetAt,
            'verifierSetAt is correct'
          );
          assert.equal(
            token.accountCreatedAt,
            accountData.createdAt,
            'accountCreatedAt is correct'
          );
          assert.equal(
            token.profileChangedAt,
            accountData.createdAt,
            'profileChangedAt is correct'
          );
        });
      });

      it('should update token', () => {
        const sessionTokenUpdates = {
          uaBrowser: 'foo',
          uaBrowserVersion: '1',
          uaOS: 'bar',
          uaOSVersion: '2',
          uaDeviceType: 'baz',
          lastAccessTime: 42,
          authAt: 1234567,
        };
        return db
          .updateSessionToken(sessionTokenData.tokenId, sessionTokenUpdates)
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on session token update'
            );
            return db.sessionToken(sessionTokenData.tokenId);
          })
          .then((token) => {
            assert.deepEqual(
              token.tokenData,
              sessionTokenData.data,
              'token data matches'
            );
            assert.deepEqual(
              token.uid,
              accountData.uid,
              'token belongs to this account'
            );
            assert.equal(
              token.createdAt,
              sessionTokenData.createdAt,
              'createdAt is correct'
            );
            assert.equal(token.uaBrowser, 'foo', 'uaBrowser is correct');
            assert.equal(
              token.uaBrowserVersion,
              '1',
              'uaBrowserVersion is correct'
            );
            assert.equal(token.uaOS, 'bar', 'uaOS is correct');
            assert.equal(token.uaOSVersion, '2', 'uaOSVersion is correct');
            assert.equal(token.uaDeviceType, 'baz', 'uaDeviceType is correct');
            assert.equal(
              token.uaFormFactor,
              sessionTokenData.uaFormFactor,
              'uaFormFactor is correct'
            );
            assert.equal(token.lastAccessTime, 42, 'lastAccessTime is correct');
            assert.equal(token.authAt, 1234567, 'authAt is correct');
            assert.equal(
              !!token.emailVerified,
              accountData.emailVerified,
              'token emailVerified is same as account emailVerified'
            );
            assert.equal(
              token.email,
              accountData.email,
              'token email same as account email'
            );
            assert.deepEqual(
              token.emailCode,
              accountData.emailCode,
              'token emailCode same as account emailCode'
            );
            assert.equal(
              token.verifierSetAt,
              accountData.verifierSetAt,
              'verifierSetAt is correct'
            );
            assert.equal(
              token.accountCreatedAt,
              accountData.createdAt,
              'accountCreatedAt is correct'
            );
            assert.equal(
              token.mustVerify,
              sessionTokenData.mustVerify,
              'mustVerify is set'
            );
            assert.deepEqual(
              token.tokenVerificationId,
              sessionTokenData.tokenVerificationId,
              'tokenVerificationId is set'
            );
          });
      });

      it('should update mustVerify to true, but not to false', () => {
        return db
          .sessionToken(sessionTokenData.tokenId)
          .then((token) => {
            assert.equal(
              token.mustVerify,
              false,
              'mustVerify starts out as false'
            );
            assert.equal(
              token.uaBrowser,
              'mock browser',
              'other fields have their default values'
            );
            return db.updateSessionToken(sessionTokenData.tokenId, {
              mustVerify: true,
            });
          })
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on session token update'
            );
            return db.sessionToken(sessionTokenData.tokenId);
          })
          .then((token) => {
            assert.equal(
              token.mustVerify,
              true,
              'mustVerify was correctly updated to true'
            );
            assert.equal(
              token.uaBrowser,
              'mock browser',
              'other fields were not updated'
            );
            return db.updateSessionToken(sessionTokenData.tokenId, {
              mustVerify: false,
            });
          })
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on session token update'
            );
            return db.sessionToken(sessionTokenData.tokenId);
          })
          .then((token) => {
            assert.equal(
              token.mustVerify,
              true,
              'mustVerify was not reset back to false'
            );
            assert.equal(
              token.uaBrowser,
              'mock browser',
              'other fields were not updated'
            );
          });
      });

      it('should get verification state', () => {
        return db.sessionToken(sessionTokenData.tokenId).then((token) => {
          assert.deepEqual(
            token.tokenData,
            sessionTokenData.data,
            'token data matches'
          );
          assert.deepEqual(
            token.uid,
            accountData.uid,
            'token belongs to this account'
          );
          assert.equal(
            token.createdAt,
            sessionTokenData.createdAt,
            'createdAt is correct'
          );
          assert.equal(
            token.uaBrowser,
            sessionTokenData.uaBrowser,
            'uaBrowser is correct'
          );
          assert.equal(
            token.uaBrowserVersion,
            sessionTokenData.uaBrowserVersion,
            'uaBrowserVersion is correct'
          );
          assert.equal(token.uaOS, sessionTokenData.uaOS, 'uaOS is correct');
          assert.equal(
            token.uaOSVersion,
            sessionTokenData.uaOSVersion,
            'uaOSVersion is correct'
          );
          assert.equal(
            token.uaDeviceType,
            sessionTokenData.uaDeviceType,
            'uaDeviceType is correct'
          );
          assert.equal(
            token.uaFormFactor,
            sessionTokenData.uaFormFactor,
            'uaFormFactor is correct'
          );
          assert.equal(
            token.lastAccessTime,
            sessionTokenData.createdAt,
            'lastAccessTime was set'
          );
          assert.equal(
            token.authAt,
            sessionTokenData.createdAt,
            'authAt is correct'
          );
          assert.equal(
            !!token.emailVerified,
            accountData.emailVerified,
            'token emailVerified is same as account emailVerified'
          );
          assert.equal(
            token.email,
            accountData.email,
            'token email same as account email'
          );
          assert.deepEqual(
            token.emailCode,
            accountData.emailCode,
            'token emailCode same as account emailCode'
          );
          assert.equal(
            token.verifierSetAt,
            accountData.verifierSetAt,
            'verifierSetAt is correct'
          );
          assert.equal(
            token.accountCreatedAt,
            accountData.createdAt,
            'accountCreatedAt is correct'
          );
          assert.equal(
            token.mustVerify,
            sessionTokenData.mustVerify,
            'mustVerify is correct'
          );
          assert.deepEqual(
            token.tokenVerificationId,
            sessionTokenData.tokenVerificationId,
            'tokenVerificationId is correct'
          );
        });
      });

      it('should fail session verification for invalid tokenId', () => {
        return db
          .verifyTokens(hex16(), accountData)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'err.errno is correct');
            assert.equal(err.code, 404, 'err.code is correct');

            return db.sessionToken(sessionTokenData.tokenId);
          })
          .then((token) => {
            assert.equal(
              token.mustVerify,
              sessionTokenData.mustVerify,
              'mustVerify is correct'
            );
            assert.deepEqual(
              token.tokenVerificationId,
              sessionTokenData.tokenVerificationId,
              'tokenVerificationId is correct'
            );
          });
      });

      it('should fail session verification for invalid uid', () => {
        return db
          .verifyTokens(sessionTokenData.tokenVerificationId, { uid: hex16() })
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'err.errno is correct');
            assert.equal(err.code, 404, 'err.code is correct');

            return db.sessionToken(sessionTokenData.tokenId);
          })
          .then((token) => {
            assert.equal(
              token.mustVerify,
              sessionTokenData.mustVerify,
              'mustVerify is correct'
            );
            assert.deepEqual(
              token.tokenVerificationId,
              sessionTokenData.tokenVerificationId,
              'tokenVerificationId is correct'
            );
          });
      });

      it('should verify session token', () => {
        return db
          .verifyTokens(sessionTokenData.tokenVerificationId, accountData)
          .then(() => {
            return db.sessionToken(sessionTokenData.tokenId);
          }, assert.fail)
          .then((token) => {
            assert.equal(!!token.mustVerify, false, 'mustVerify is null');
            assert.isNull(token.tokenVerificationId);
          });
      });

      describe('db.accountDevices', () => {
        let deviceData;
        beforeEach(() => {
          deviceData = makeMockDevice(sessionTokenData.tokenId);
          return db.createDevice(
            accountData.uid,
            deviceData.deviceId,
            deviceData
          );
        });

        it('should get device count', () => {
          return db.accountDevices(accountData.uid).then((results) => {
            assert.lengthOf(results, 1);
          });
        });

        it('db.sessions should contain device data', () => {
          return db.sessions(accountData.uid).then((sessions) => {
            assert.lengthOf(sessions, 1);
            // the next session has a device attached to it
            assert.equal(
              sessions[0].deviceId.toString('hex'),
              deviceData.deviceId.toString('hex')
            );
            assert.equal(sessions[0].deviceName, 'Test Device');
            assert.equal(sessions[0].deviceType, 'mobile');
            assert(sessions[0].deviceCreatedAt);
            assert.equal(sessions[0].deviceCallbackURL, 'https://push.server');
            assert.equal(sessions[0].deviceCallbackPublicKey, 'foo');
            assert.equal(sessions[0].deviceCallbackAuthKey, 'bar');
            assert.equal(sessions[0].deviceCallbackIsExpired, false);
          });
        });

        it('db.deleteSessionToken should delete device', () => {
          return db
            .accountDevices(accountData.uid)
            .then((results) => {
              assert.lengthOf(results, 1);
              return db.deleteSessionToken(sessionTokenData.tokenId);
            })
            .then(() => db.accountDevices(accountData.uid))
            .then((results) => {
              assert.lengthOf(results, 0);
            });
        });
      });

      describe('db.deleteSessionToken', () => {
        beforeEach(() => {
          return db
            .deleteSessionToken(sessionTokenData.tokenId)
            .then((result) => {
              assert.deepEqual(
                result,
                {},
                'Returned an empty object on forgot session token deletion'
              );
            }, assert.fail);
        });

        it('should delete session', () => {
          return db
            .sessionToken(sessionTokenData.tokenId)
            .then(assert.fail, (err) => {
              assert.equal(err.errno, 116, 'err.errno is correct');
              assert.equal(err.code, 404, 'err.code is correct');
            });
        });

        it('should fail to verify deleted session', () => {
          return db
            .verifyTokens(sessionTokenData.tokenVerificationId, accountData)
            .then(assert.fail, (err) => {
              assert.equal(err.errno, 116, 'err.errno is correct');
              assert.equal(err.code, 404, 'err.code is correct');
            });
        });
      });
    });

    describe('key fetch token handling', () => {
      let keyFetchTokenData;
      beforeEach(() => {
        keyFetchTokenData = makeMockKeyFetchToken(accountData.uid, false);
        return db.createKeyFetchToken(
          keyFetchTokenData.tokenId,
          keyFetchTokenData
        );
      });

      it('should have created unverified keyfetch token', () => {
        keyFetchTokenData = makeMockKeyFetchToken(accountData.uid, false);
        return db
          .createKeyFetchToken(keyFetchTokenData.tokenId, keyFetchTokenData)
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on key fetch token creation'
            );
            return db.keyFetchToken(keyFetchTokenData.tokenId);
          })
          .then((token) => {
            assert.isUndefined(token.tokenId);
            assert.deepEqual(
              token.authKey,
              keyFetchTokenData.authKey,
              'authKey matches'
            );
            assert.deepEqual(
              token.uid,
              accountData.uid,
              'token belongs to this account'
            );
            assert.equal(
              token.createdAt,
              keyFetchTokenData.createdAt,
              'createdAt is ok'
            );
            assert.equal(
              !!token.emailVerified,
              accountData.emailVerified,
              'emailVerified is correct'
            );
            assert.isUndefined(token.email);
            assert.isUndefined(token.emailCode);
            assert.equal(
              token.verifierSetAt,
              accountData.verifierSetAt,
              'verifierSetAt is correct'
            );
            assert.isUndefined(token.tokenVerificationId);
          });
      });

      it('should have created verified key fetch token', () => {
        keyFetchTokenData = makeMockKeyFetchToken(accountData.uid, true);
        return db
          .createKeyFetchToken(keyFetchTokenData.tokenId, keyFetchTokenData)
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on key fetch token creation'
            );
            return db.keyFetchTokenWithVerificationStatus(
              keyFetchTokenData.tokenId
            );
          })
          .then((token) => {
            assert.isUndefined(token.tokenId);
            assert.deepEqual(
              token.authKey,
              keyFetchTokenData.authKey,
              'authKey matches'
            );
            assert.deepEqual(
              token.uid,
              accountData.uid,
              'token belongs to this account'
            );
            assert.equal(
              token.createdAt,
              keyFetchTokenData.createdAt,
              'createdAt is ok'
            );
            assert.equal(
              !!token.emailVerified,
              accountData.emailVerified,
              'emailVerified is correct'
            );
            assert.isUndefined(token.email);
            assert.isUndefined(token.emailCode);
            assert.equal(
              token.verifierSetAt,
              accountData.verifierSetAt,
              'verifierSetAt is correct'
            );
            assert.equal(
              token.tokenVerificationId,
              keyFetchTokenData.tokenVerificationId,
              'tokenVerificationId is undefined'
            );
          });
      });

      it('should get keyfetch token verification status', () => {
        return db
          .keyFetchTokenWithVerificationStatus(keyFetchTokenData.tokenId)
          .then((token) => {
            assert.deepEqual(
              token.authKey,
              keyFetchTokenData.authKey,
              'authKey matches'
            );
            assert.deepEqual(
              token.uid,
              accountData.uid,
              'token belongs to this account'
            );
            assert.equal(
              token.createdAt,
              keyFetchTokenData.createdAt,
              'createdAt is ok'
            );
            assert.equal(
              !!token.emailVerified,
              accountData.emailVerified,
              'emailVerified is correct'
            );
            assert.equal(
              token.verifierSetAt,
              accountData.verifierSetAt,
              'verifierSetAt is correct'
            );
            assert.deepEqual(
              token.tokenVerificationId,
              keyFetchTokenData.tokenVerificationId,
              'tokenVerificationId is correct'
            );
          });
      });

      it('should fail keyfetch token verficiation for invalid tokenVerficationId', () => {
        return db
          .verifyTokens(hex16(), accountData)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'err.errno is correct');
            assert.equal(err.code, 404, 'err.code is correct');
          });
      });

      it('should fail keyfetch token verficiation for invalid uid', () => {
        return db
          .verifyTokens(keyFetchTokenData.tokenVerificationId, { uid: hex16() })
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'err.errno is correct');
            assert.equal(err.code, 404, 'err.code is correct');
          });
      });

      it('should verify keyfetch token', () => {
        return db
          .keyFetchTokenWithVerificationStatus(keyFetchTokenData.tokenId)
          .then((token) => {
            assert.deepEqual(
              token.tokenVerificationId,
              keyFetchTokenData.tokenVerificationId,
              'tokenVerificationId is correct'
            );
            return db.verifyTokens(
              keyFetchTokenData.tokenVerificationId,
              accountData
            );
          })
          .then(() => {
            return db.keyFetchTokenWithVerificationStatus(
              keyFetchTokenData.tokenId
            );
          })
          .then((token) => {
            assert.isNull(token.tokenVerificationId);
          });
      });

      it('should delete key fetch token', () => {
        return db
          .deleteKeyFetchToken(keyFetchTokenData.tokenId)
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on token delete'
            );
            return db
              .keyFetchToken(keyFetchTokenData.tokenVerificationId)
              .then(assert.fail, (err) => {
                assert.equal(err.errno, 116, 'err.errno is correct');
                assert.equal(err.code, 404, 'err.code is correct');
              });
          });
      });
    });

    describe('forgot password token handling', () => {
      let forgotPasswordTokenData;
      beforeEach(() => {
        forgotPasswordTokenData = makeMockForgotPasswordToken(accountData.uid);
        return db.createPasswordForgotToken(
          forgotPasswordTokenData.tokenId,
          forgotPasswordTokenData
        );
      });

      it('should have created password forgot token', () => {
        return db
          .passwordForgotToken(forgotPasswordTokenData.tokenId)
          .then((token) => {
            assert.deepEqual(
              token.tokenData,
              forgotPasswordTokenData.data,
              'token data matches'
            );
            assert.deepEqual(
              token.uid,
              accountData.uid,
              'token belongs to this account'
            );
            assert.equal(
              token.createdAt,
              forgotPasswordTokenData.createdAt,
              'createdAt same'
            );
            assert.deepEqual(
              token.passCode,
              forgotPasswordTokenData.passCode,
              'token passCode same'
            );
            assert.equal(
              token.tries,
              forgotPasswordTokenData.tries,
              'Tries is correct'
            );
            assert.equal(
              token.email,
              accountData.email,
              'token email same as account email'
            );
            assert.equal(
              token.verifierSetAt,
              accountData.verifierSetAt,
              'verifierSetAt is set correctly'
            );
          });
      });

      it('should update password forgot token tries', () => {
        forgotPasswordTokenData.tries = 9;
        return db
          .updatePasswordForgotToken(
            forgotPasswordTokenData.tokenId,
            forgotPasswordTokenData
          )
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'The returned object from the token update is empty'
            );
            return db.passwordForgotToken(forgotPasswordTokenData.tokenId);
          })
          .then((token) => {
            assert.equal(token.tries, 9, 'token now has had 9 tries');
          });
      });

      it('should delete password forgot token', () => {
        return db
          .deletePasswordForgotToken(forgotPasswordTokenData.tokenId)
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'The returned object from the token delete is empty'
            );
            return db
              .passwordForgotToken(forgotPasswordTokenData.tokenId)
              .then(assert.fail, (err) => {
                assert.equal(err.errno, 116, 'err.errno is correct');
                assert.equal(err.code, 404, 'err.code is correct');
              });
          });
      });
    });

    describe('change password token handling', () => {
      let changePasswordTokenData;
      beforeEach(() => {
        changePasswordTokenData = makeMockChangePasswordToken(accountData.uid);

        return db.createPasswordChangeToken(
          changePasswordTokenData.tokenId,
          changePasswordTokenData
        );
      });

      it('should have created password change token', () => {
        return db
          .passwordChangeToken(changePasswordTokenData.tokenId)
          .then((token) => {
            assert.equal(
              token.hasOwnProperty('tokenId'),
              false,
              'tokenId is not returned'
            );
            assert.deepEqual(
              token.tokenData,
              changePasswordTokenData.data,
              'token data matches'
            );
            assert.deepEqual(
              token.uid,
              accountData.uid,
              'token belongs to this account'
            );
            assert.equal(
              token.createdAt,
              changePasswordTokenData.createdAt,
              'createdAt is correct'
            );
            assert.equal(
              token.verifierSetAt,
              accountData.verifierSetAt,
              'verifierSetAt is set correctly'
            );
          });
      });

      it('should override change password token when creating with same uid', () => {
        const anotherChangePasswordTokenData = makeMockChangePasswordToken(
          accountData.uid
        );
        return db
          .createPasswordChangeToken(
            anotherChangePasswordTokenData.tokenId,
            anotherChangePasswordTokenData
          )
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on change password token creation'
            );

            // Fails to retrieve original change token since it was over written
            return db
              .passwordChangeToken(changePasswordTokenData.tokenId)
              .then(assert.fail, (err) => {
                assert.equal(err.errno, 116, 'err.errno is correct');
                assert.equal(err.code, 404, 'err.code is correct');
                return db.passwordChangeToken(
                  anotherChangePasswordTokenData.tokenId
                );
              });
          })
          .then((token) => {
            assert.deepEqual(
              token.tokenData,
              anotherChangePasswordTokenData.data,
              'token data matches'
            );
            assert.deepEqual(
              token.uid,
              accountData.uid,
              'token belongs to this account'
            );
            assert.equal(
              token.createdAt,
              anotherChangePasswordTokenData.createdAt,
              'createdAt is correct'
            );
            assert.equal(
              token.verifierSetAt,
              accountData.verifierSetAt,
              'verifierSetAt is set correctly'
            );
          });
      });

      it('should have deleted token', () => {
        return db
          .deletePasswordChangeToken(
            changePasswordTokenData.tokenId,
            changePasswordTokenData
          )
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on forgot password change deletion'
            );
            return db
              .passwordChangeToken(changePasswordTokenData.tokenId)
              .then(assert.fail, (err) => {
                assert.equal(err.errno, 116, 'err.errno is correct');
                assert.equal(err.code, 404, 'err.code is correct');
              });
          });
      });
    });

    it('should verify account email with legacy db.verifyEmail', () => {
      return db
        .emailRecord(accountData.emailBuffer)
        .then((emailRecord) => {
          assert.equal(
            emailRecord.emailVerified,
            false,
            'account should be emailVerified false'
          );
          assert.equal(
            emailRecord.emailVerified,
            0,
            'account should be emailVerified (0)'
          );
          return db.verifyEmail(emailRecord.uid, emailRecord.emailCode);
        })
        .then(function (result) {
          assert.deepEqual(
            result,
            {},
            'Returned an empty object email verification'
          );
          return db.accountEmails(accountData.uid);
        })
        .then(function (emails) {
          assert.lengthOf(emails, 1);
          assert.equal(!!emails[0].isVerified, true, 'email is verified');
          assert.notEqual(emails[0].verifiedAt, null);
          assert.isAbove(emails[0].verifiedAt, emails[0].createdAt);
          assert.equal(!!emails[0].isPrimary, true, 'email is primary');
          return db.account(accountData.uid);
        })
        .then(function (account) {
          assert(
            account.emailVerified,
            'account should now be emailVerified (truthy)'
          );
          assert.equal(
            account.emailVerified,
            1,
            'account should now be emailVerified (1)'
          );
          assert.isAbove(account.profileChangedAt, account.createdAt);
        });
    });

    it('should change account locale', () => {
      return db
        .account(accountData.uid)
        .then((account) => {
          assert.equal(account.locale, 'en_US', 'correct locale set');
          accountData.locale = 'en_NZ';
          return db.updateLocale(accountData.uid, accountData);
        })
        .then(function (result) {
          assert.deepEqual(
            result,
            {},
            'Returned an empty object on locale update'
          );
          return db.account(accountData.uid);
        })
        .then(function (account) {
          assert.equal(
            account.locale,
            'en_NZ',
            'account should now have new locale'
          );
        });
    });

    describe('account reset token handling', () => {
      let accountResetTokenData, forgotPasswordTokenData;
      beforeEach(() => {
        forgotPasswordTokenData = makeMockForgotPasswordToken(accountData.uid);
        accountResetTokenData = makeMockAccountResetToken(accountData.uid);
        return db
          .createPasswordForgotToken(
            forgotPasswordTokenData.tokenId,
            forgotPasswordTokenData
          )
          .then(function () {
            return db.forgotPasswordVerified(
              forgotPasswordTokenData.tokenId,
              accountResetTokenData
            );
          });
      });

      it('db.accountResetToken should create token', () => {
        return db
          .accountResetToken(accountResetTokenData.tokenId)
          .then((token) => {
            assert.isFalse(token.hasOwnProperty('tokenId'));
            assert.deepEqual(
              token.uid,
              accountData.uid,
              'token belongs to this account'
            );
            assert.deepEqual(
              token.tokenData,
              accountResetTokenData.data,
              'token data matches'
            );
            assert.equal(
              token.createdAt,
              accountResetTokenData.createdAt,
              'createdAt is correct'
            );
            assert(
              token.verifierSetAt,
              'verifierSetAt is set to a truthy value'
            );
          });
      });

      it('db.deleteAccountResetToken should delete token', () => {
        return db
          .deleteAccountResetToken(accountResetTokenData.tokenId)
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on account reset deletion'
            );
            return db
              .accountResetToken(accountResetTokenData.tokenId)
              .then(assert.fail, (err) => {
                assert.equal(err.errno, 116, 'err.errno is correct');
                assert.equal(err.code, 404, 'err.code is correct');
              });
          });
      });
    });

    describe('db.forgotPasswordVerified', () => {
      let forgotPasswordTokenData,
        anotherForgotPasswordTokenData,
        accountResetTokenData,
        anotherAccountResetTokenData;
      beforeEach(() => {
        forgotPasswordTokenData = makeMockForgotPasswordToken(accountData.uid);
        accountResetTokenData = makeMockAccountResetToken(
          accountData.uid,
          forgotPasswordTokenData.tokenId
        );
        anotherForgotPasswordTokenData = makeMockForgotPasswordToken(
          accountData.uid
        );
        anotherAccountResetTokenData = makeMockAccountResetToken(
          accountData.uid,
          anotherForgotPasswordTokenData.tokenId
        );

        return db.createPasswordForgotToken(
          anotherForgotPasswordTokenData.tokenId,
          anotherForgotPasswordTokenData
        );
      });

      it('should override accountResetToken when calling `db.forgotPasswordVerified`', () => {
        return db
          .forgotPasswordVerified(
            anotherForgotPasswordTokenData.tokenId,
            anotherAccountResetTokenData
          )
          .then(
            () => db.accountResetToken(anotherAccountResetTokenData.tokenId),
            assert.fail
          )
          .then((token) => {
            // check a couple of fields
            assert.deepEqual(
              token.uid,
              accountData.uid,
              'token belongs to this account'
            );
            assert.deepEqual(
              token.tokenData,
              anotherAccountResetTokenData.data,
              'token data matches'
            );
            assert.equal(
              token.createdAt,
              anotherAccountResetTokenData.createdAt,
              'createdAt is correct'
            );
            assert(
              token.verifierSetAt,
              'verifierSetAt is set to a truthy value'
            );

            return db.createPasswordForgotToken(
              forgotPasswordTokenData.tokenId,
              forgotPasswordTokenData
            );
          })
          .then(
            () =>
              db.forgotPasswordVerified(
                forgotPasswordTokenData.tokenId,
                forgotPasswordTokenData
              ),
            assert.fail
          )
          .then(() =>
            db.accountResetToken(anotherAccountResetTokenData.tokenId)
          )
          .then(assert.fail, (err) => {
            // throw away accountResetToken (shouldn't exist any longer)
            assert.equal(err.errno, 116, 'err.errno is correct');
            assert.equal(err.code, 404, 'err.code is correct');

            return db.passwordForgotToken(forgotPasswordTokenData.tokenId);
          })
          .then(assert.fail, (err) => {
            // throw away passwordForgotToken (shouldn't exist any longer)
            assert.equal(err.errno, 116, 'err.errno is correct');
            assert.equal(err.code, 404, 'err.code is correct');

            return db.deleteAccountResetToken(accountResetTokenData.tokenId);
          })
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on account reset deletion'
            );
            return db.accountResetToken(accountResetTokenData.tokenId);
          })
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'err.errno is correct');
            assert.equal(err.code, 404, 'err.code is correct');
          });
      });
    });

    describe('db.deviceFromTokenVerificationId', () => {
      let sessionTokenData;
      beforeEach(() => {
        sessionTokenData = makeMockSessionToken(accountData.uid);
        return db.createSessionToken(
          sessionTokenData.tokenId,
          sessionTokenData
        );
      });

      it('should fail for non-existing session', () => {
        return db
          .deviceFromTokenVerificationId(accountData.uid, hex16())
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
          });
      });

      it('should fail for session with no device', () => {
        return db
          .deviceFromTokenVerificationId(
            accountData.uid,
            sessionTokenData.tokenVerificationId
          )
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
          });
      });

      it('should return device', () => {
        const deviceData = makeMockDevice(sessionTokenData.tokenId);
        return db
          .createDevice(accountData.uid, deviceData.deviceId, deviceData)
          .then(() => {
            return db.deviceFromTokenVerificationId(
              accountData.uid,
              sessionTokenData.tokenVerificationId
            );
          })
          .then((sessionDeviceInfo) => {
            assert.deepEqual(
              sessionDeviceInfo.id,
              deviceData.deviceId,
              'We found our device id back'
            );
            assert.equal(
              sessionDeviceInfo.name,
              deviceData.name,
              'We found our device name back'
            );
          });
      });
    });

    describe('db.accountDevices', () => {
      let sessionDeviceInfo,
        oauthDeviceInfo,
        sessionTokenData,
        refreshTokenData;

      // A little helper function for finding a specific device record in a list.
      function matchById(field, value) {
        return (d) => d[field] && d[field].equals(value);
      }

      beforeEach(() => {
        sessionTokenData = makeMockSessionToken(accountData.uid);
        refreshTokenData = makeMockRefreshToken(accountData.uid);

        sessionDeviceInfo = makeMockDevice(sessionTokenData.tokenId);
        oauthDeviceInfo = makeMockOAuthDevice(refreshTokenData.tokenId);

        return db
          .createSessionToken(sessionTokenData.tokenId, sessionTokenData)
          .then(() =>
            db.createDevice(
              accountData.uid,
              sessionDeviceInfo.deviceId,
              sessionDeviceInfo
            )
          )
          .then((result) => {
            return assert.deepEqual(result, {}, 'returned empty object');
          })
          .then(() =>
            db.createDevice(
              accountData.uid,
              oauthDeviceInfo.deviceId,
              oauthDeviceInfo
            )
          )
          .then((result) => {
            return assert.deepEqual(result, {}, 'returned empty object');
          });
      });

      it('should have created devices', () => {
        return P.resolve()
          .then(() => {
            return db.device(sessionTokenData.uid, sessionDeviceInfo.deviceId);
          })
          .then((d) => {
            assert.deepEqual(d.uid, sessionTokenData.uid, 'uid');
            assert.deepEqual(d.id, sessionDeviceInfo.deviceId, 'id');
            assert.equal(d.name, sessionDeviceInfo.name, 'name');
            assert.equal(d.type, sessionDeviceInfo.type, 'type');
            assert.equal(d.createdAt, sessionDeviceInfo.createdAt, 'createdAt');
            assert.equal(
              d.callbackURL,
              sessionDeviceInfo.callbackURL,
              'callbackURL'
            );
            assert.equal(
              d.callbackPublicKey,
              sessionDeviceInfo.callbackPublicKey,
              'callbackPublicKey'
            );
            assert.equal(
              d.callbackAuthKey,
              sessionDeviceInfo.callbackAuthKey,
              'callbackAuthKey'
            );
            assert.equal(
              d.callbackIsExpired,
              sessionDeviceInfo.callbackIsExpired,
              'callbackIsExpired'
            );
            assert.deepEqual(
              d.availableCommands,
              sessionDeviceInfo.availableCommands,
              'availableCommands'
            );
          })
          .then(() => {
            return db.device(refreshTokenData.uid, oauthDeviceInfo.deviceId);
          })
          .then((d) => {
            assert.deepEqual(d.uid, refreshTokenData.uid, 'uid');
            assert.deepEqual(d.id, oauthDeviceInfo.deviceId, 'id');
            assert.equal(d.name, oauthDeviceInfo.name, 'name');
            assert.equal(d.type, oauthDeviceInfo.type, 'type');
            assert.equal(d.createdAt, oauthDeviceInfo.createdAt, 'createdAt');
            assert.equal(
              d.callbackURL,
              oauthDeviceInfo.callbackURL,
              'callbackURL'
            );
            assert.equal(
              d.callbackPublicKey,
              oauthDeviceInfo.callbackPublicKey,
              'callbackPublicKey'
            );
            assert.equal(
              d.callbackAuthKey,
              oauthDeviceInfo.callbackAuthKey,
              'callbackAuthKey'
            );
            assert.equal(
              d.callbackIsExpired,
              oauthDeviceInfo.callbackIsExpired,
              'callbackIsExpired'
            );
            assert.deepEqual(
              d.availableCommands,
              oauthDeviceInfo.availableCommands,
              'availableCommands'
            );
          });
      });

      it('should have linked one device to session token', () => {
        return db.sessionToken(sessionTokenData.tokenId).then((s) => {
          assert.deepEqual(s.deviceId, sessionDeviceInfo.deviceId, 'id');
          assert.deepEqual(s.uid, sessionTokenData.uid, 'uid');
          assert.equal(s.deviceName, sessionDeviceInfo.name, 'name');
          assert.equal(s.deviceType, sessionDeviceInfo.type, 'type');
          assert.equal(
            s.deviceCreatedAt,
            sessionDeviceInfo.createdAt,
            'createdAt'
          );
          assert.equal(
            s.deviceCallbackURL,
            sessionDeviceInfo.callbackURL,
            'callbackURL'
          );
          assert.equal(
            s.deviceCallbackPublicKey,
            sessionDeviceInfo.callbackPublicKey,
            'callbackPublicKey'
          );
          assert.equal(
            s.deviceCallbackAuthKey,
            sessionDeviceInfo.callbackAuthKey,
            'callbackAuthKey'
          );
          assert.equal(
            s.deviceCallbackIsExpired,
            sessionDeviceInfo.callbackIsExpired,
            'callbackIsExpired'
          );
          assert.deepEqual(
            s.deviceAvailableCommands,
            sessionDeviceInfo.availableCommands,
            'availableCommands'
          );
          assert.equal(
            !!s.mustVerify,
            !!sessionTokenData.mustVerify,
            'mustVerify is correct'
          );
          assert.deepEqual(
            s.tokenVerificationId,
            sessionTokenData.tokenVerificationId,
            'tokenVerificationId is correct'
          );
        });
      });

      it('should get all devices', () => {
        return db.accountDevices(accountData.uid).then((devices) => {
          assert.lengthOf(devices, 2);

          let device = devices.find(
            matchById('sessionTokenId', sessionTokenData.tokenId)
          );
          assert.deepEqual(
            device.sessionTokenId,
            sessionTokenData.tokenId,
            'sessionTokenId'
          );
          assert.isNull(device.refreshTokenId);
          assert.equal(device.name, sessionDeviceInfo.name, 'name');
          assert.deepEqual(device.id, sessionDeviceInfo.deviceId, 'id');
          assert.equal(
            device.createdAt,
            sessionDeviceInfo.createdAt,
            'createdAt'
          );
          assert.equal(device.type, sessionDeviceInfo.type, 'type');
          assert.equal(
            device.callbackURL,
            sessionDeviceInfo.callbackURL,
            'callbackURL'
          );
          assert.equal(
            device.callbackPublicKey,
            sessionDeviceInfo.callbackPublicKey,
            'callbackPublicKey'
          );
          assert.equal(
            device.callbackAuthKey,
            sessionDeviceInfo.callbackAuthKey,
            'callbackAuthKey'
          );
          assert.equal(
            device.callbackIsExpired,
            sessionDeviceInfo.callbackIsExpired,
            'callbackIsExpired'
          );
          assert.deepEqual(
            device.availableCommands,
            sessionDeviceInfo.availableCommands,
            'availableCommands'
          );
          assert.isAbove(device.lastAccessTime, 0);

          device = devices.find(
            matchById('refreshTokenId', refreshTokenData.tokenId)
          );
          assert.isNull(device.sessionTokenId);
          assert.deepEqual(
            device.refreshTokenId,
            refreshTokenData.tokenId,
            'refreshTokenId'
          );
          assert.equal(device.name, oauthDeviceInfo.name, 'name');
          assert.deepEqual(device.id, oauthDeviceInfo.deviceId, 'id');
          assert.equal(
            device.createdAt,
            oauthDeviceInfo.createdAt,
            'createdAt'
          );
          assert.equal(device.type, oauthDeviceInfo.type, 'type');
          assert.equal(
            device.callbackURL,
            oauthDeviceInfo.callbackURL,
            'callbackURL'
          );
          assert.equal(
            device.callbackPublicKey,
            oauthDeviceInfo.callbackPublicKey,
            'callbackPublicKey'
          );
          assert.equal(
            device.callbackAuthKey,
            oauthDeviceInfo.callbackAuthKey,
            'callbackAuthKey'
          );
          assert.equal(
            device.callbackIsExpired,
            oauthDeviceInfo.callbackIsExpired,
            'callbackIsExpired'
          );
          assert.deepEqual(
            device.availableCommands,
            oauthDeviceInfo.availableCommands,
            'availableCommands'
          );
          assert.isNull(device.lastAccessTime);
        });
      });

      it('should update device by sessionTokenId', () => {
        sessionDeviceInfo.name = 'New New Device';
        sessionDeviceInfo.type = 'desktop';
        sessionDeviceInfo.callbackURL = '';
        sessionDeviceInfo.callbackPublicKey = '';
        sessionDeviceInfo.callbackAuthKey = '';
        sessionDeviceInfo.callbackIsExpired = true;
        sessionDeviceInfo.availableCommands = {};

        const newSessionTokenData = makeMockSessionToken(accountData.uid);
        sessionDeviceInfo.sessionTokenId = newSessionTokenData.tokenId;

        return db
          .createSessionToken(newSessionTokenData.tokenId, newSessionTokenData)
          .then(() => {
            return db.updateDevice(
              accountData.uid,
              sessionDeviceInfo.deviceId,
              sessionDeviceInfo
            );
          })
          .then((result) => {
            assert.deepEqual(result, {}, 'returned empty object');
            return db.accountDevices(accountData.uid);
          })
          .then((devices) => {
            assert.lengthOf(devices, 2);
            const device = devices.find(
              matchById('sessionTokenId', newSessionTokenData.tokenId)
            );
            assert.ok(device, 'device found under new token id');
            assert.equal(device.name, 'New New Device', 'name updated');
            assert.equal(device.type, 'desktop', 'type unchanged');
            assert.equal(device.callbackURL, '', 'callbackURL unchanged');
            assert.equal(
              device.callbackPublicKey,
              '',
              'callbackPublicKey unchanged'
            );
            assert.equal(
              device.callbackAuthKey,
              '',
              'callbackAuthKey unchanged'
            );
            assert.equal(
              device.callbackIsExpired,
              true,
              'callbackIsExpired unchanged'
            );
            assert.deepEqual(
              device.availableCommands,
              {},
              'availableCommands updated'
            );
          });
      });

      it('should update device by refreshTokenId', () => {
        oauthDeviceInfo.name = 'New New Device';
        oauthDeviceInfo.type = 'desktop';
        oauthDeviceInfo.callbackURL = '';
        oauthDeviceInfo.callbackPublicKey = '';
        oauthDeviceInfo.callbackAuthKey = '';
        oauthDeviceInfo.callbackIsExpired = true;
        oauthDeviceInfo.availableCommands = {};

        const newRefreshTokenData = makeMockRefreshToken(accountData.uid);
        oauthDeviceInfo.refreshTokenId = newRefreshTokenData.tokenId;

        return db
          .updateDevice(
            accountData.uid,
            oauthDeviceInfo.deviceId,
            oauthDeviceInfo
          )
          .then((result) => {
            assert.deepEqual(result, {}, 'returned empty object');
            return db.accountDevices(accountData.uid);
          })
          .then((devices) => {
            assert.lengthOf(devices, 2);
            const device = devices.find(
              matchById('refreshTokenId', newRefreshTokenData.tokenId)
            );
            assert.ok(device, 'device found under new token id');
            assert.equal(device.name, 'New New Device', 'name updated');
            assert.equal(device.type, 'desktop', 'type unchanged');
            assert.equal(device.callbackURL, '', 'callbackURL unchanged');
            assert.equal(
              device.callbackPublicKey,
              '',
              'callbackPublicKey unchanged'
            );
            assert.equal(
              device.callbackAuthKey,
              '',
              'callbackAuthKey unchanged'
            );
            assert.equal(
              device.callbackIsExpired,
              true,
              'callbackIsExpired unchanged'
            );
            assert.deepEqual(
              device.availableCommands,
              {},
              'availableCommands updated'
            );
          });
      });

      it('should fail to return zombie session', () => {
        // zombie devices don't have an associated session
        sessionDeviceInfo.sessionTokenId = hex16();
        return db
          .updateDevice(
            accountData.uid,
            sessionDeviceInfo.deviceId,
            sessionDeviceInfo
          )
          .then((result) => {
            assert.deepEqual(result, {}, 'returned empty object');
            return db.accountDevices(accountData.uid);
          })
          .then((devices) => {
            assert.lengthOf(devices, 1);
            assert.isNull(devices[0].sessionTokenId);
            assert.deepEqual(
              devices[0].refreshTokenId,
              refreshTokenData.tokenId,
              'refreshTokenId'
            );
          });
      });

      it('should fail to add multiple devices to session', () => {
        const anotherDevice = makeMockDevice(sessionTokenData.tokenId);
        return db
          .createDevice(accountData.uid, anotherDevice.deviceId, anotherDevice)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 409, 'err.code');
            assert.equal(err.errno, 101, 'err.errno');
          });
      });

      it('should fail to add multiple devices to refreshToken', () => {
        const anotherDevice = makeMockOAuthDevice(refreshTokenData.tokenId);
        return db
          .createDevice(accountData.uid, anotherDevice.deviceId, anotherDevice)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 409, 'err.code');
            assert.equal(err.errno, 101, 'err.errno');
          });
      });

      it('can associate a device record with both sessionToken and refreshToken', () => {
        const anotherRefreshToken = makeMockRefreshToken(accountData.uid);
        sessionDeviceInfo.refreshTokenId = anotherRefreshToken.tokenId;
        return db
          .updateDevice(
            accountData.uid,
            sessionDeviceInfo.deviceId,
            sessionDeviceInfo
          )
          .then(() => {
            return db.accountDevices(accountData.uid);
          })
          .then((devices) => {
            assert.lengthOf(devices, 2);
            const comboDeviceInfo = devices.find(
              matchById('sessionTokenId', sessionTokenData.tokenId)
            );
            assert.ok(comboDeviceInfo, 'found device record');
            assert.deepEqual(
              comboDeviceInfo.refreshTokenId,
              anotherRefreshToken.tokenId
            );
          });
      });

      it('should fail to update non-existent device', () => {
        return db
          .updateDevice(accountData.uid, hex16(), sessionDeviceInfo)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
          });
      });

      it('availableCommands are not cleared if not specified', () => {
        const newDevice = Object.assign({}, sessionDeviceInfo);
        delete newDevice.availableCommands;
        return db
          .updateDevice(accountData.uid, sessionDeviceInfo.deviceId, newDevice)
          .then(() => {
            return db.device(accountData.uid, sessionDeviceInfo.deviceId);
          })
          .then((device) =>
            assert.deepEqual(device.availableCommands, {
              'https://identity.mozilla.com/cmd/display-uri': 'metadata-bundle',
            })
          );
      });

      it('availableCommands are overwritten on update', () => {
        const newDevice = Object.assign({}, sessionDeviceInfo, {
          availableCommands: {
            foo: 'bar',
            second: 'command',
          },
        });
        return db
          .updateDevice(accountData.uid, sessionDeviceInfo.deviceId, newDevice)
          .then(() => {
            return db.device(accountData.uid, sessionDeviceInfo.deviceId);
          })
          .then((device) =>
            assert.deepEqual(device.availableCommands, {
              foo: 'bar',
              second: 'command',
            })
          );
      });

      it('availableCommands can update metadata on an existing command', () => {
        const newDevice = Object.assign({}, sessionDeviceInfo, {
          availableCommands: {
            'https://identity.mozilla.com/cmd/display-uri': 'new-metadata',
          },
        });
        return db
          .updateDevice(accountData.uid, sessionDeviceInfo.deviceId, newDevice)
          .then(() => {
            return db.device(accountData.uid, sessionDeviceInfo.deviceId);
          })
          .then((device) =>
            assert.deepEqual(device.availableCommands, {
              'https://identity.mozilla.com/cmd/display-uri': 'new-metadata',
            })
          );
      });

      it('should fail to delete non-existent device', () => {
        return db
          .deleteDevice(accountData.uid, hex16())
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
          });
      });

      it('should correctly handle multiple devices with different availableCommands maps', () => {
        const sessionToken2 = makeMockSessionToken(accountData.uid);
        const sessionDeviceInfo2 = Object.assign(
          makeMockDevice(sessionToken2.tokenId),
          {
            availableCommands: {
              'https://identity.mozilla.com/cmd/display-uri':
                'device-two-metadata',
              'extra-command': 'extra-data',
            },
          }
        );
        const sessionToken3 = makeMockSessionToken(accountData.uid);
        const sessionDeviceInfo3 = Object.assign(
          makeMockDevice(sessionToken3.tokenId),
          {
            availableCommands: {},
          }
        );

        return db
          .createSessionToken(sessionToken2.tokenId, sessionToken2)
          .then(() =>
            db.createDevice(
              accountData.uid,
              sessionDeviceInfo2.deviceId,
              sessionDeviceInfo2
            )
          )
          .then(() =>
            db.createSessionToken(sessionToken3.tokenId, sessionToken3)
          )
          .then(() =>
            db.createDevice(
              accountData.uid,
              sessionDeviceInfo3.deviceId,
              sessionDeviceInfo3
            )
          )
          .then(() => db.accountDevices(accountData.uid))
          .then((devices) => {
            assert.lengthOf(devices, 4);

            const device1 = devices.find(
              matchById('sessionTokenId', sessionTokenData.tokenId)
            );
            assert.ok(device1, 'found first device');
            assert.deepEqual(
              device1.availableCommands,
              sessionDeviceInfo.availableCommands,
              'device1 availableCommands'
            );

            const device2 = devices.find(
              matchById('sessionTokenId', sessionToken2.tokenId)
            );
            assert.ok(device2, 'found second device');
            assert.deepEqual(
              device2.availableCommands,
              sessionDeviceInfo2.availableCommands,
              'device2 availableCommands'
            );

            const device3 = devices.find(
              matchById('sessionTokenId', sessionToken3.tokenId)
            );
            assert.ok(device3, 'found third device');
            assert.deepEqual(
              device3.availableCommands,
              sessionDeviceInfo3.availableCommands,
              'device3 availableCommands'
            );

            const device4 = devices.find(
              matchById('refreshTokenId', refreshTokenData.tokenId)
            );
            assert.ok(device4, 'found fourth device');
            assert.deepEqual(
              device4.availableCommands,
              oauthDeviceInfo.availableCommands,
              'device4 availableCommands'
            );
          });
      });

      it('should correctly handle multiple sessions with different availableCommands maps', () => {
        const sessionToken2 = makeMockSessionToken(accountData.uid);
        const sessionDeviceInfo2 = Object.assign(
          makeMockDevice(sessionToken2.tokenId),
          {
            availableCommands: {
              'https://identity.mozilla.com/cmd/display-uri':
                'device-two-metadata',
              'extra-command': 'extra-data',
            },
          }
        );
        const sessionToken3 = makeMockSessionToken(accountData.uid);

        return db
          .createSessionToken(sessionToken2.tokenId, sessionToken2)
          .then(() =>
            db.createDevice(
              accountData.uid,
              sessionDeviceInfo2.deviceId,
              sessionDeviceInfo2
            )
          )
          .then(() =>
            db.createSessionToken(sessionToken3.tokenId, sessionToken3)
          )
          .then(() => db.sessions(accountData.uid))
          .then((sessions) => {
            assert.lengthOf(sessions, 3);

            const session1 = sessions.find((s) =>
              s.tokenId.equals(sessionTokenData.tokenId)
            );
            assert.ok(session1, 'found first session');
            assert.deepEqual(
              session1.deviceAvailableCommands,
              sessionDeviceInfo.availableCommands,
              'session1 availableCommands'
            );

            const session2 = sessions.find((s) =>
              s.tokenId.equals(sessionToken2.tokenId)
            );
            assert.ok(session2, 'found second session');
            assert.deepEqual(
              session2.deviceAvailableCommands,
              sessionDeviceInfo2.availableCommands,
              'session2 availableCommands'
            );

            const session3 = sessions.find((s) =>
              s.tokenId.equals(sessionToken3.tokenId)
            );
            assert.ok(session3, 'found third session');
            assert.deepEqual(session3.deviceId, null, 'session3 deviceId');
            assert.deepEqual(
              session3.deviceAvailableCommands,
              null,
              'session3 availableCommands'
            );
          });
      });

      it('should delete session when device is deleted', () => {
        return db
          .deleteDevice(accountData.uid, sessionDeviceInfo.deviceId)
          .then((result) => {
            assert.deepEqual(result, {
              sessionTokenId: sessionTokenData.tokenId,
              refreshTokenId: null,
            });

            // Fetch all of the devices for the account
            return db.accountDevices(accountData.uid);
          })
          .then((devices) => assert.lengthOf(devices, 1))
          .then(() => db.sessionToken(sessionTokenData.tokenId))
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
          });
      });

      it('should return refreshTokenId when device is deleted, so that calling code can delete it', () => {
        return db
          .deleteDevice(accountData.uid, oauthDeviceInfo.deviceId)
          .then((result) => {
            assert.deepEqual(result, {
              sessionTokenId: null,
              refreshTokenId: refreshTokenData.tokenId,
            });

            // Fetch all of the devices for the account
            return db.accountDevices(accountData.uid);
          })
          .then((devices) => assert.lengthOf(devices, 1));
      });
    });

    describe('db.resetAccount', () => {
      let passwordForgotTokenData, sessionTokenData, sessionDeviceInfo;
      beforeEach(() => {
        sessionTokenData = makeMockSessionToken(accountData.uid, true);
        passwordForgotTokenData = makeMockForgotPasswordToken(accountData.uid);
        sessionDeviceInfo = makeMockDevice(sessionTokenData.tokenId);

        return db
          .createSessionToken(sessionTokenData.tokenId, sessionTokenData)
          .then(() =>
            db.createDevice(
              accountData.uid,
              sessionDeviceInfo.deviceId,
              sessionDeviceInfo
            )
          )
          .then(() =>
            db.createPasswordForgotToken(
              passwordForgotTokenData.tokenId,
              passwordForgotTokenData
            )
          );
      });

      it('should verify account upon forgot token creation', () => {
        return db
          .accountEmails(accountData.uid)
          .then((emails) => {
            // Account should be unverified
            assert.lengthOf(emails, 1);
            assert.equal(
              !!emails[0].isVerified,
              false,
              'email is not verified'
            );
            assert.equal(!!emails[0].isPrimary, true, 'email is primary');

            return db.forgotPasswordVerified(
              passwordForgotTokenData.tokenId,
              passwordForgotTokenData
            );
          })
          .then(() => db.accountEmails(accountData.uid))
          .then((emails) => {
            // Account should be verified
            assert.lengthOf(emails, 1);
            assert.equal(!!emails[0].isVerified, true, 'email is verified');
            assert.notEqual(emails[0].verifiedAt, null);
            assert.isAbove(emails[0].verifiedAt, emails[0].createdAt);
            assert.equal(!!emails[0].isPrimary, true, 'email is primary');
          });
      });

      it('should remove devices after account reset', () => {
        return db
          .accountDevices(accountData.uid)
          .then((devices) => {
            assert.lengthOf(devices, 1);
            return db.resetAccount(accountData.uid, accountData);
          })
          .then(() => db.accountDevices(accountData.uid))
          .then((devices) => {
            assert.lengthOf(devices, 0);
          });
      });

      it('should remove session after account reset', () => {
        return db
          .resetAccount(accountData.uid, accountData)
          .then(() => db.sessionToken(sessionTokenData.tokenId))
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
          });
      });

      it('should still retrieve account after account reset', () => {
        return db
          .account(accountData.uid)
          .then((account) => {
            assert.ok(account, 'account exists');
            accountData.verifierSetAt = now + 1;
            return db.resetAccount(accountData.uid, accountData);
          })
          .then(() => db.account(accountData.uid))
          .then((account) => {
            assert.ok(account, 'account exists');
            assert.equal(
              account.profileChangedAt,
              account.verifierSetAt,
              'profileChangedAt matches verifierSetAt'
            );
          });
      });

      it('should track keysChangedAt independently of verifierSetAt', async () => {
        const account1 = await db.account(accountData.uid);
        assert.equal(account1.verifierSetAt, account1.keysChangedAt);

        // eslint-disable-next-line require-atomic-updates
        accountData.verifierSetAt = now + 1;
        // eslint-disable-next-line require-atomic-updates
        accountData.keysHaveChanged = false;
        await db.resetAccount(accountData.uid, accountData);
        const account2 = await db.account(accountData.uid);
        assert.notEqual(account1.verifierSetAt, account2.verifierSetAt);
        assert.equal(account1.keysChangedAt, account2.keysChangedAt);

        // eslint-disable-next-line require-atomic-updates
        accountData.verifierSetAt = now + 2;
        // eslint-disable-next-line require-atomic-updates
        accountData.keysHaveChanged = true;
        await db.resetAccount(accountData.uid, accountData);
        const account3 = await db.account(accountData.uid);
        assert.notEqual(account2.verifierSetAt, account3.verifierSetAt);
        assert.notEqual(account2.keysChangedAt, account3.keysChangedAt);
        assert.equal(account3.verifierSetAt, now + 2);
        assert.equal(account3.keysChangedAt, now + 2);

        delete accountData.keysHaveChanged;
      });
    });

    describe('db.securityEvents', () => {
      let session1, session2, session3, uid1, uid2;
      const evA = 'account.login',
        evB = 'account.create',
        evC = 'account.reset';
      const addr1 = '127.0.0.1',
        addr2 = '::127.0.0.2';

      function insert(uid, addr, name, session) {
        return db.createSecurityEvent({
          uid: uid,
          ipAddr: addr,
          name: name,
          tokenId: session,
        });
      }

      beforeEach(() => {
        session1 = makeMockSessionToken(accountData.uid);
        session2 = makeMockSessionToken(accountData.uid);
        // Make session verified
        delete session2.tokenVerificationId;

        session3 = makeMockSessionToken(accountData.uid);

        uid1 = accountData.uid;
        uid2 = newUuid();

        return (
          P.all([
            db.createSessionToken(session1.tokenId, session1),
            db.createSessionToken(session2.tokenId, session2),
            db.createSessionToken(session3.tokenId, session3),
          ])
            // Don't parallelize these, the order of them matters
            // because they record timestamps in the db.
            .then(() => insert(uid1, addr1, evA, session2.tokenId).delay(10))
            .then(() => insert(uid1, addr1, evB, session1.tokenId).delay(10))
            .then(() => insert(uid1, addr1, evC).delay(10))
            .then(() => insert(uid1, addr2, evA, session3.tokenId).delay(10))
            .then(() => insert(uid2, addr1, evA, hex32()))
        );
      });

      it('should get security event', () => {
        return db
          .securityEvents({ id: uid1, ipAddr: addr1 })
          .then((results) => {
            assert.lengthOf(results, 3);
            // The most recent event is returned first.
            assert.equal(results[0].name, evC, 'correct event name');
            assert.equal(
              !!results[0].verified,
              true,
              'event without a session is already verified'
            );
            assert.isBelow(results[0].createdAt, Date.now());
            assert.equal(results[1].name, evB, 'correct event name');
            assert.equal(
              !!results[1].verified,
              false,
              'second session is not verified yet'
            );
            assert.isBelow(results[1].createdAt, results[0].createdAt);
            assert.equal(results[2].name, evA, 'correct event name');
            assert.equal(
              !!results[2].verified,
              true,
              'first session is already verified'
            );
            assert.isBelow(results[2].createdAt, results[1].createdAt);
          });
      });

      it('should get event after session verified', () => {
        return db
          .verifyTokens(session1.tokenVerificationId, { uid: uid1 })
          .then(() => db.securityEvents({ id: uid1, ipAddr: addr1 }))
          .then((results) => {
            assert.lengthOf(results, 3);
            assert.isTrue(!!results[0].verified);
            assert.isTrue(!!results[1].verified);
            assert.isTrue(!!results[2].verified);
          });
      });

      it('should get second address', () => {
        return db
          .securityEvents({ id: uid1, ipAddr: addr2 })
          .then((results) => {
            assert.lengthOf(results, 1);
            assert.equal(results[0].name, evA);
            assert.isFalse(!!results[0].verified);
          });
      });

      it('should get second addr after deleting unverified session', () => {
        return db
          .deleteSessionToken(session3.tokenId)
          .then(() => db.securityEvents({ id: uid1, ipAddr: addr2 }))
          .then((results) => {
            assert.lengthOf(results, 1);
            assert.equal(results[0].name, evA);
            assert.isFalse(!!results[0].verified);
          });
      });

      it('should get with IPv6', () => {
        return db
          .securityEvents({ id: uid1, ipAddr: '::' + addr1 })
          .then((results) => assert.lengthOf(results, 3));
      });

      it('should fail with unknown uid', () => {
        return db
          .securityEvents({ id: newUuid(), ipAddr: addr1 })
          .then((results) => assert.lengthOf(results, 0));
      });

      it('should delete events when account is deleted', () => {
        return db
          .deleteAccount(accountData.uid)
          .then(() => db.securityEvents({ id: uid1, ipAddr: addr1 }))
          .then((res) => {
            assert.lengthOf(res, 0);
          });
      });
    });

    describe('db.securityEventsByUid', () => {
      let session1, session2, session3, anotherAccountSession, uid, anotherUid;
      const evA = 'account.login',
        evB = 'account.create',
        evC = 'account.reset';
      const addr = '127.0.0.1';

      function insert(uid, addr, name, session) {
        return db.createSecurityEvent({
          uid: uid,
          ipAddr: addr,
          name: name,
          tokenId: session,
        });
      }

      beforeEach(() => {
        const anotherAccountData = createAccount();

        session1 = makeMockSessionToken(accountData.uid);
        session2 = makeMockSessionToken(accountData.uid);
        // Make session verified
        delete session2.tokenVerificationId;

        session3 = makeMockSessionToken(accountData.uid);
        anotherAccountSession = makeMockSessionToken(anotherAccountData.uid);

        uid = accountData.uid;
        anotherUid = anotherAccountData.uid;

        return (
          P.all([
            db.createSessionToken(session1.tokenId, session1),
            db.createSessionToken(session2.tokenId, session2),
            db.createSessionToken(session3.tokenId, session3),
            db.createSessionToken(
              anotherAccountSession.tokenId,
              anotherAccountSession
            ),
          ])
            // Don't parallelize these, the order of them matters
            // because they record timestamps in the db.
            .then(() => insert(uid, addr, evA, session2.tokenId).delay(10))
            .then(() => insert(uid, addr, evB, session1.tokenId).delay(10))
            .then(() => insert(uid, addr, evC).delay(10))
            .then(() =>
              insert(
                anotherUid,
                addr,
                evA,
                anotherAccountSession.tokenId
              ).delay(10)
            )

            // create an account in db with anotherAccountData
            .then(() =>
              db.createAccount(anotherAccountData.uid, anotherAccountData)
            )
        );
      });

      it('should get security event', () => {
        return db.securityEventsByUid(uid).then((results) => {
          assert.lengthOf(results, 3);
          // The most recent event is returned first.
          assert.equal(results[0].name, evC, 'correct event name');
          assert.equal(
            !!results[0].verified,
            true,
            'event without a session is already verified'
          );
          assert.isBelow(results[0].createdAt, Date.now());
          assert.equal(results[1].name, evB, 'correct event name');
          assert.equal(
            !!results[1].verified,
            false,
            'second session is not verified yet'
          );
          assert.isBelow(results[1].createdAt, results[0].createdAt);
          assert.equal(results[2].name, evA, 'correct event name');
          assert.equal(
            !!results[2].verified,
            true,
            'first session is already verified'
          );
          assert.isBelow(results[2].createdAt, results[1].createdAt);
        });
      });

      it('should get security event for another account', () => {
        return db.securityEventsByUid(anotherUid).then((results) => {
          assert.lengthOf(results, 1);
          assert.equal(results[0].name, evA, 'correct event name');
          assert.equal(
            results[0].verified,
            false,
            'this session is not verified'
          );
          assert.isBelow(results[0].createdAt, Date.now());
        });
      });

      it('should get event after session verified', () => {
        return db
          .verifyTokens(session1.tokenVerificationId, { uid })
          .then(() => db.securityEventsByUid(uid))
          .then((results) => {
            assert.lengthOf(results, 3);
            assert.isTrue(!!results[0].verified);
            assert.isTrue(!!results[1].verified);
            assert.isTrue(!!results[2].verified);
          });
      });

      it('should give no securityEvent with new unknown uid', () => {
        const unknownUid = newUuid();
        return db
          .securityEventsByUid(unknownUid)
          .then((results) => assert.lengthOf(results, 0));
      });

      it('should get no events when events are deleted', () => {
        return db
          .deleteSecurityEventsByUid(accountData.uid)
          .then((result) => assert.deepEqual(result, {}))
          .then(() => db.securityEventsByUid(uid))
          .then((result) => assert.lengthOf(result, 0));
      });
    });

    describe('db.deleteAccount', () => {
      let sessionTokenData;
      beforeEach(() => {
        sessionTokenData = makeMockSessionToken(accountData.uid);

        return db
          .createSessionToken(sessionTokenData.tokenId, sessionTokenData)
          .then(() => db.accountExists(accountData.emailBuffer))
          .then((exists) => {
            assert.ok(exists, 'account exists');
            return db.deleteAccount(accountData.uid);
          });
      });

      it('should have delete account', () => {
        return db
          .accountExists(accountData.emailBuffer)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
          });
      });

      it('should fail to verify session', () => {
        return db
          .verifyTokens(sessionTokenData.tokenVerificationId, accountData)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
          });
      });

      it('should fail to fetch session', () => {
        return db
          .sessionToken(sessionTokenData.tokenId)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
          });
      });
    });

    describe('reminders', () => {
      let accountData2, fetchQuery;
      beforeEach(() => {
        accountData2 = createAccount();
        return db.createAccount(accountData2.uid, accountData2);
      });

      it('create and delete', () => {
        fetchQuery = {
          type: 'second',
          reminderTime: 1,
          reminderTimeOutdated: 100,
          limit: 20,
        };

        return db
          .createVerificationReminder({ uid: accountData.uid, type: 'second' })
          .then(() => P.delay(20))
          .then(() => db.fetchReminders({}, fetchQuery))
          .then((result) => {
            assert.equal(result[0].type, 'second', 'correct type');
            assert.equal(
              result[0].uid.toString('hex'),
              accountData.uid.toString('hex'),
              'correct uid'
            );
            return db.fetchReminders({}, fetchQuery);
          })
          .then((result) => assert.lengthOf(result, 0));
      });

      it('multiple accounts', () => {
        fetchQuery = {
          type: 'first',
          reminderTime: 1,
          reminderTimeOutdated: 3000,
          limit: 20,
        };

        // create 'first' reminder for account one.
        return (
          db
            .createVerificationReminder({ uid: accountData.uid, type: 'first' })
            // create 'first' reminder for account two.
            .then(() =>
              db.createVerificationReminder({
                uid: accountData2.uid,
                type: 'first',
              })
            )
            .then(() => P.delay(20))
            .then(() => db.fetchReminders({}, fetchQuery))
            .then((result) => {
              assert.lengthOf(result, 2);
              assert.equal(result[0].type, 'first', 'correct type');
              assert.equal(result[1].type, 'first', 'correct type');
              return db.fetchReminders({}, fetchQuery);
            })
            .then((result) => assert.lengthOf(result, 0))
        );
      });

      it('multi fetch', () => {
        fetchQuery = {
          type: 'first',
          reminderTime: 1,
          reminderTimeOutdated: 100,
          limit: 20,
        };

        // create 'first' reminder for account one.
        return (
          db
            .createVerificationReminder({ uid: accountData.uid, type: 'first' })
            // create 'first' reminder for account two.
            .then(() =>
              db.createVerificationReminder({
                uid: accountData2.uid,
                type: 'first',
              })
            )
            .then(() => P.delay(20))
            .then(() =>
              P.all([
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
                db.fetchReminders({}, fetchQuery),
              ])
            )
            .then((results) => {
              let found = 0;
              results.forEach((result) => {
                if (result.length === 2) {
                  found++;
                }
              });

              assert.equal(found, 1, 'only one query has the result');
            })
        );
      });
    });

    describe('unblockCodes', () => {
      let uid1, code1, code2;
      beforeEach(() => {
        uid1 = newUuid();
        code1 = unblockCode();

        code2 = unblockCode();
        return P.all([
          db.createUnblockCode(uid1, code1),
          db.createUnblockCode(uid1, code2),
        ]);
      });

      it('should fail to consume unknown code', () => {
        return db
          .consumeUnblockCode(newUuid(), code1)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
          });
      });

      it('should fail to consume old unblock code', () => {
        return db.consumeUnblockCode(uid1, code1).then((code) => {
          assert.ok(code);
          return db.consumeUnblockCode(uid1, code2).then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
          });
        });
      });

      it('should consume unblock code', () => {
        return db.consumeUnblockCode(uid1, code1).then((code) => {
          assert.isAtMost(code.createdAt, Date.now());
        });
      });

      it('should fail to consume code twice', () => {
        return db.consumeUnblockCode(uid1, code1).then((code) => {
          assert.isAtMost(code.createdAt, Date.now());
          return db.consumeUnblockCode(uid1, code1).then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
          });
        });
      });

      it('should delete all code when successfully consumed code', () => {
        return db
          .consumeUnblockCode(uid1, 'NOTREAL')
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
            return db.consumeUnblockCode(uid1, code1);
          })
          .then((code) => {
            assert.isAtMost(code.createdAt, Date.now());
            return db.consumeUnblockCode(uid1, code2);
          }, assert.fail)
          .then(assert.fail, (err) => {
            assert.equal(err.code, 404, 'err.code');
            assert.equal(err.errno, 116, 'err.errno');
          });
      });
    });

    it('emailBounces', () => {
      const email = `${`${Math.random()}`.substr(2)}@example.com`;
      return db
        .createEmailBounce({
          email,
          bounceType: 'Permanent',
          bounceSubType: 'NoEmail',
        })
        .then(() =>
          db.createEmailBounce({
            email,
            bounceType: 'Transient',
            bounceSubType: 'General',
          })
        )
        .then(() => db.fetchEmailBounces(email))
        .then((bounces) => {
          assert.lengthOf(bounces, 2);
          assert.equal(bounces[0].email, email);
          assert.equal(bounces[0].bounceType, 2);
          assert.equal(bounces[0].bounceSubType, 2);
          assert.equal(bounces[1].email, email);
          assert.equal(bounces[1].bounceType, 1);
          assert.equal(bounces[1].bounceSubType, 3);
        });
    });

    describe('emails', () => {
      let secondEmail;
      beforeEach(() => {
        accountData = createAccount();
        accountData.emailVerified = true;
        secondEmail = createEmail({
          uid: accountData.uid,
        });

        return db
          .createAccount(accountData.uid, accountData)
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on account creation'
            );

            return db.createEmail(accountData.uid, secondEmail);
          })
          .then((result) =>
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on email creation'
            )
          );
      });

      it('should return only account email if no secondary email', () => {
        const anotherAccountData = createAccount();
        return db
          .createAccount(anotherAccountData.uid, anotherAccountData)
          .then(() => db.accountEmails(anotherAccountData.uid))
          .then((result) => {
            assert.lengthOf(result, 1);

            // Check first email is email from accounts table
            assert.equal(
              result[0].email,
              anotherAccountData.email,
              'matches account email'
            );
            assert.isTrue(!!result[0].isPrimary);
            assert.equal(
              !!result[0].isVerified,
              anotherAccountData.emailVerified,
              'matches account emailVerified'
            );
            assert.equal(
              result[0].verifiedAt,
              anotherAccountData.verifiedAt,
              'matches account verifiedAt'
            );
          });
      });

      it('should return secondary emails', () => {
        return db.accountEmails(accountData.uid).then((result) => {
          assert.lengthOf(result, 2);

          // Check first email is email from accounts table
          assert.equal(
            result[0].email,
            accountData.email,
            'matches account email'
          );
          assert.isTrue(!!result[0].isPrimary);
          assert.equal(
            !!result[0].isVerified,
            accountData.emailVerified,
            'matches account emailVerified'
          );
          assert.equal(
            result[0].verifiedAt,
            accountData.verifiedAt,
            'matches account verifiedAt'
          );

          // Check second email is from emails table
          assert.equal(
            result[1].email,
            secondEmail.email,
            'matches secondEmail email'
          );
          assert.isFalse(!!result[1].isPrimary);
          assert.equal(
            !!result[1].isVerified,
            secondEmail.isVerified,
            'matches secondEmail isVerified'
          );
          assert.equal(
            result[1].verifiedAt,
            secondEmail.verifiedAt,
            'matches secondEmail verifiedAt'
          );
        });
      });

      it('should get secondary email', () => {
        return db.getSecondaryEmail(secondEmail.email).then((result) => {
          assert.equal(
            result.email,
            secondEmail.email,
            'matches secondEmail email'
          );
          assert.isFalse(!!result.isPrimary);
          assert.equal(
            !!result.isVerified,
            secondEmail.isVerified,
            'matches secondEmail isVerified'
          );
        });
      });

      it('should verify secondary email', () => {
        return db
          .verifyEmail(secondEmail.uid, secondEmail.emailCode)
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on email verification'
            );
            return db.accountEmails(accountData.uid);
          })
          .then((result) => {
            assert.lengthOf(result, 2);

            // Check second email is from emails table and verified
            assert.equal(
              result[1].email,
              secondEmail.email,
              'matches secondEmail email'
            );
            assert.isFalse(!!result[1].isPrimary);
            assert.isTrue(!!result[1].isVerified);
            assert.notEqual(result[1].verifiedAt, null);
            assert.isAbove(result[1].verifiedAt, result[1].createdAt);
            return db.account(accountData.uid).then((account) => {
              assert.isAbove(account.profileChangedAt, account.createdAt);
            });
          });
      });

      it('should delete email', () => {
        return db
          .deleteEmail(secondEmail.uid, secondEmail.email)
          .then((result) => {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on email deletion'
            );

            // Get all emails and check to see if it has been removed
            return db.accountEmails(accountData.uid);
          })
          .then((result) => {
            // Verify that the email has been removed
            assert.lengthOf(result, 1);

            // Only email returned should be from users account
            assert.equal(
              result[0].email,
              accountData.email,
              'matches account email'
            );
            assert.isTrue(!!result[0].isPrimary);
            assert.equal(
              !!result[0].isVerified,
              accountData.emailVerified,
              'matches account emailVerified'
            );
            assert.equal(
              result[0].verifiedAt,
              accountData.verifiedAt,
              'matches account verifiedAt'
            );

            return db.account(accountData.uid).then((account) => {
              assert.isAbove(account.profileChangedAt, account.createdAt);
            });
          });
      });

      it('should free secondary email on account deletion', () => {
        let anotherAccountData;
        return db
          .verifyEmail(secondEmail.uid, secondEmail.emailCode)
          .then(() => db.deleteAccount(accountData.uid))
          .then(() => {
            anotherAccountData = createAccount();
            anotherAccountData.email = secondEmail.email;
            anotherAccountData.normalizedEmail = secondEmail.normalizedEmail;

            return db.createAccount(anotherAccountData.uid, anotherAccountData);
          })
          .then((result) => {
            assert.deepEqual(result, {}, 'successfully created an account');

            // Attempt to create secondary email address
            return db
              .createEmail(accountData.uid, secondEmail)
              .then(assert.fail, (err) =>
                assert.equal(err.errno, 101, 'Correct errno')
              );
          });
      });

      it('should fail to add secondary email that exists on account table', () => {
        const anotherEmail = createEmail({ email: accountData.email });
        return db
          .createEmail(accountData.uid, anotherEmail)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 101, 'should return duplicate entry errno');
            assert.equal(err.code, 409, 'should return duplicate entry code');
          });
      });

      it('should fail to add duplicate secondary email', () => {
        const anotherEmail = createEmail({ email: secondEmail.email });
        return db
          .createEmail(accountData.uid, anotherEmail)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 101, 'should return duplicate entry errno');
            assert.equal(err.code, 409, 'should return duplicate entry code');
          });
      });

      it('should fail to delete primary email', () => {
        return db
          .deleteEmail(accountData.uid, accountData.normalizedEmail)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 136, 'should return email delete errno');
            assert.equal(err.code, 400, 'should return email delete code');
          });
      });

      it('should fail to create account that used a secondary email as primary', () => {
        const anotherAccount = createAccount();
        anotherAccount.email = secondEmail.email;
        anotherAccount.normalizedEmail = secondEmail.normalizedEmail;
        return db
          .createAccount(anotherAccount.uid, anotherAccount)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 101, 'should return duplicate entry errno');
            assert.equal(err.code, 409, 'should return duplicate entry code');
          });
      });

      it('should fail to get non-existent secondary email', () => {
        return db
          .getSecondaryEmail('non-existent@email.com')
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'should return not found errno');
            assert.equal(err.code, 404, 'should return not found code');
          });
      });
    });

    describe('sign-in codes', () => {
      let SIGNIN_CODES, NOW, TIMESTAMPS, FLOW_IDS;

      beforeEach(() => {
        SIGNIN_CODES = [hex6(), hex6(), hex6()];
        NOW = Date.now();
        TIMESTAMPS = [NOW - 1, NOW - 2, NOW - config.signinCodesMaxAge - 1];
        FLOW_IDS = [hex32(), hex32(), hex32()];

        return P.all([
          db.createSigninCode(
            SIGNIN_CODES[0],
            accountData.uid,
            TIMESTAMPS[0],
            FLOW_IDS[0]
          ),
          db.createSigninCode(
            SIGNIN_CODES[1],
            accountData.uid,
            TIMESTAMPS[1],
            FLOW_IDS[1]
          ),
          db.createSigninCode(
            SIGNIN_CODES[2],
            accountData.uid,
            TIMESTAMPS[2],
            FLOW_IDS[2]
          ),
        ]).then((results) => {
          results.forEach((r) =>
            assert.deepEqual(
              r,
              {},
              'createSigninCode should return an empty object'
            )
          );
        });
      });

      it('should fail to create duplicate sign-in code', () => {
        return db
          .createSigninCode(SIGNIN_CODES[0], accountData.uid, TIMESTAMPS[0])
          .then(assert.fail, (err) => {
            assert(err, 'db.createSigninCode should reject with an error');
            assert.equal(
              err.code,
              409,
              'db.createSigninCode should reject with code 404'
            );
            assert.equal(
              err.errno,
              101,
              'db.createSigninCode should reject with errno 116'
            );
          });
      });

      it('should consume sign-in code', () => {
        return db.consumeSigninCode(SIGNIN_CODES[0]).then((result) => {
          assert.deepEqual(
            result,
            {
              email: accountData.email,
              flowId: FLOW_IDS[0],
            },
            'db.consumeSigninCode should return an email address and flowId for non-expired codes'
          );
        });
      });

      it('should fail consume sign-in code twice', () => {
        return db
          .consumeSigninCode(SIGNIN_CODES[0])
          .then(() => db.consumeSigninCode(SIGNIN_CODES[0]))
          .then(assert.fail, (err) => {
            assert(err, 'db.consumeSigninCode should reject with an error');
            assert.equal(
              err.code,
              404,
              'db.consumeSigninCode should reject with code 404'
            );
            assert.equal(
              err.errno,
              116,
              'db.consumeSigninCode should reject with errno 116'
            );
          });
      });

      it('should fail consume expired sign-in code', () => {
        return db
          .consumeSigninCode(SIGNIN_CODES[2])
          .then(assert.fail, (err) => {
            assert(err, 'db.consumeSigninCode should reject with an error');
            assert.equal(
              err.code,
              404,
              'db.consumeSigninCode should reject with code 404'
            );
            assert.equal(
              err.errno,
              116,
              'db.consumeSigninCode should reject with errno 116'
            );
          });
      });

      it('should fail to use sign-in code from deleted account', () => {
        return db.deleteAccount(accountData.uid).then(() => {
          return db
            .consumeSigninCode(SIGNIN_CODES[1])
            .then(assert.fail, (err) => {
              assert(err, 'db.consumeSigninCode should reject with an error');
              assert.equal(
                err.code,
                404,
                'db.consumeSigninCode should reject with code 404'
              );
              assert.equal(
                err.errno,
                116,
                'db.consumeSigninCode should reject with errno 116'
              );
            });
        });
      });
    });

    it('should keep account emails and emails in sync', () => {
      return P.all([
        db.accountEmails(accountData.uid),
        db.account(accountData.uid),
      ])
        .spread(function (emails, account) {
          assert.equal(
            emails[0].email,
            account.email,
            'correct email returned'
          );
          assert.equal(
            !!emails[0].isVerified,
            !!account.emailVerified,
            'correct email verification'
          );
          assert.equal(
            emails[0].verifiedAt,
            account.verifiedAt,
            'correct email verifiedAt'
          );
          assert.isTrue(!!emails[0].isPrimary);

          // Verify account email
          return db.verifyEmail(account.uid, account.emailCode);
        })
        .then(function (result) {
          assert.deepEqual(
            result,
            {},
            'returned empty response on verify email'
          );
          return P.all([
            db.accountEmails(accountData.uid),
            db.account(accountData.uid),
          ]);
        })
        .spread(function (emails, account) {
          assert.equal(
            emails[0].email,
            account.email,
            'correct email returned'
          );
          assert.equal(
            !!emails[0].isVerified,
            !!account.emailVerified,
            'correct email verification'
          );
          assert.isTrue(!!emails[0].isPrimary);
        });
    });

    describe('db.resetAccountTokens', () => {
      let passwordChangeToken, passwordForgotToken, accountResetToken;

      beforeEach(() => {
        accountData.emailVerified = true;
        passwordChangeToken = makeMockChangePasswordToken(accountData.uid);
        passwordForgotToken = makeMockForgotPasswordToken(accountData.uid);
        accountResetToken = makeMockAccountResetToken(
          accountData.uid,
          passwordForgotToken.tokenId
        );
      });

      it('should remove account reset tokens', () => {
        return db
          .createPasswordForgotToken(
            passwordForgotToken.tokenId,
            passwordForgotToken
          )
          .then(() => {
            // db.forgotPasswordVerified requires a passwordForgotToken to have been made
            return db
              .forgotPasswordVerified(
                passwordForgotToken.tokenId,
                accountResetToken
              )
              .then(() => {
                return db
                  .accountResetToken(passwordForgotToken.tokenId)
                  .then((res) =>
                    assert.deepEqual(
                      res.uid,
                      accountData.uid,
                      'token belongs to account'
                    )
                  );
              });
          })
          .then(() => db.resetAccountTokens(accountData.uid))
          .then(() => {
            return db
              .accountResetToken(passwordForgotToken.tokenId)
              .then(() =>
                assert.equal(
                  false,
                  'should not have return account reset token token'
                )
              )
              .catch((err) =>
                assert.equal(
                  err.errno,
                  116,
                  'did not find password change token'
                )
              );
          });
      });

      it('should remove password change tokens', () => {
        return db
          .createPasswordChangeToken(
            passwordChangeToken.tokenId,
            passwordChangeToken
          )
          .then(() => {
            return db
              .passwordChangeToken(passwordChangeToken.tokenId)
              .then((res) =>
                assert.deepEqual(
                  res.uid,
                  accountData.uid,
                  'token belongs to account'
                )
              );
          })
          .then(() => db.resetAccountTokens(accountData.uid))
          .then(() => {
            return db
              .passwordChangeToken(passwordChangeToken.tokenId)
              .then(() =>
                assert.equal(
                  false,
                  'should not have return password change token'
                )
              )
              .catch((err) =>
                assert.equal(
                  err.errno,
                  116,
                  'did not find password change token'
                )
              );
          });
      });

      it('should remove password forgot tokens', () => {
        return db
          .createPasswordForgotToken(
            passwordForgotToken.tokenId,
            passwordForgotToken
          )
          .then(() => {
            return db
              .passwordForgotToken(passwordForgotToken.tokenId)
              .then((res) =>
                assert.deepEqual(
                  res.uid,
                  accountData.uid,
                  'token belongs to account'
                )
              );
          })
          .then(() => db.resetAccountTokens(accountData.uid))
          .then(() => {
            return db
              .passwordForgotToken(passwordForgotToken.tokenId)
              .then(() =>
                assert.equal(
                  false,
                  'should not have return password forgot token'
                )
              )
              .catch((err) =>
                assert.equal(
                  err.errno,
                  116,
                  'did not find password forgot token'
                )
              );
          });
      });
    });

    describe('db.setPrimaryEmail', () => {
      let account, secondEmail;

      before(() => {
        account = createAccount();
        account.emailVerified = true;
        secondEmail = createEmail({
          uid: account.uid,
          isVerified: true,
          verifiedAt: Date.now() + 1000,
        });
        return db
          .createAccount(account.uid, account)
          .then(function () {
            return db.verifyEmail(account.uid, account.emailCode);
          })
          .then(function (result) {
            assert.deepEqual(
              result,
              {},
              'returned empty response on verify email'
            );
            return db.createEmail(account.uid, secondEmail);
          })
          .then(function (result) {
            assert.deepEqual(
              result,
              {},
              'Returned an empty object on email creation'
            );
            return db.accountEmails(account.uid);
          })
          .then(function (res) {
            assert.lengthOf(res, 2);
            assert.equal(
              res[0].email,
              account.email,
              'primary email is the address that was used to create account'
            );
            assert.deepEqual(
              res[0].emailCode,
              account.emailCode,
              'correct emailCode'
            );
            assert.isTrue(!!res[0].isVerified);
            assert.notEqual(res[0].verifiedAt, null);
            assert.isAbove(res[0].verifiedAt, res[0].createdAt);
            assert.isTrue(!!res[0].isPrimary);

            assert.equal(
              res[1].email,
              secondEmail.email,
              'primary email is the address that was used to create account'
            );
            assert.deepEqual(
              res[1].emailCode,
              secondEmail.emailCode,
              'correct emailCode'
            );
            assert.isTrue(!!res[1].isVerified);
            assert.notEqual(res[1].verifiedAt, null);
            assert.isAbove(res[1].verifiedAt, res[1].createdAt);
            assert.isFalse(!!res[1].isPrimary);
          });
      });

      it("should change a user's email", () => {
        let sessionTokenData;
        return db
          .setPrimaryEmail(account.uid, secondEmail.email)
          .then(function (res) {
            assert.deepEqual(
              res,
              {},
              'Returned an empty object on email change'
            );
            return db.accountEmails(account.uid);
          })
          .then(function (res) {
            assert.lengthOf(res, 2);

            assert.equal(
              res[0].email,
              secondEmail.email,
              'primary email is the secondary email address'
            );
            assert.deepEqual(
              res[0].emailCode,
              secondEmail.emailCode,
              'correct emailCode'
            );
            assert.equal(
              !!res[0].isVerified,
              secondEmail.isVerified,
              'correct verification set'
            );
            assert.equal(
              res[0].verifiedAt,
              secondEmail.verifiedAt,
              'correct verifiedAt set'
            );
            assert.isTrue(!!res[0].isPrimary);

            assert.equal(
              res[1].email,
              account.email,
              'should equal account email'
            );
            assert.deepEqual(
              res[1].emailCode,
              account.emailCode,
              'correct emailCode'
            );
            assert.equal(
              !!res[1].isVerified,
              account.emailVerified,
              'correct verification set'
            );
            assert.isFalse(!!res[1].isPrimary);

            // Verify correct email set in session
            sessionTokenData = makeMockSessionToken(account.uid);
            return db
              .createSessionToken(sessionTokenData.tokenId, sessionTokenData)
              .then(() => {
                return db.sessionToken(sessionTokenData.tokenId);
              });
          })
          .then((session) => {
            assert.equal(
              session.email,
              secondEmail.email,
              'should equal new primary email'
            );
            assert.deepEqual(
              session.emailCode,
              secondEmail.emailCode,
              'should equal new primary emailCode'
            );
            assert.deepEqual(
              session.uid,
              account.uid,
              'should equal account uid'
            );
            return P.all([
              db.accountRecord(secondEmail.email),
              db.accountRecord(account.email),
            ]);
          })
          .then((res) => {
            assert.deepEqual(
              res[0],
              res[1],
              'should return the same account record regardless of email used'
            );
            assert.deepEqual(
              res[0].primaryEmail,
              secondEmail.email,
              'primary email should be set to update email'
            );
            assert.ok(res[0].createdAt, 'should set createdAt');
            assert.deepEqual(
              res[0].createdAt,
              res[1].createdAt,
              'account records should have the same createdAt'
            );
            assert.isAtLeast(res[0].profileChangedAt, res[0].createdAt);
          });
      });

      it("shouldn't set primary email to email that is not owned by account", () => {
        const anotherAccount = createAccount();
        anotherAccount.emailVerified = true;
        const anotherEmail = createEmail({
          uid: anotherAccount.uid,
          isVerified: true,
        });
        return db
          .createAccount(anotherAccount.uid, anotherAccount)
          .then(() => {
            return db.createEmail(anotherAccount.uid, anotherEmail);
          })
          .then(() => {
            return db.setPrimaryEmail(account.uid, anotherEmail.email);
          })
          .catch((err) => {
            assert.equal(err.errno, 148, 'correct errno set');
          });
      });
    });

    describe('db.verifyTokenCode', () => {
      let account, anotherAccount, sessionToken, tokenVerificationCode, tokenId;
      before(() => {
        account = createAccount();
        account.emailVerified = true;
        return db.createAccount(account.uid, account);
      });

      it('should verify tokenVerificationCode', () => {
        tokenId = hex32();
        sessionToken = makeMockSessionToken(account.uid, false);
        tokenVerificationCode = sessionToken.tokenVerificationCode;
        return db
          .createSessionToken(tokenId, sessionToken)
          .then(() => {
            return db.sessionToken(tokenId);
          })
          .then((session) => {
            // Returns unverified session
            assert.equal(
              session.mustVerify,
              sessionToken.mustVerify,
              'mustVerify must match sessionToken'
            );
            assert.equal(
              session.tokenVerificationId.toString('hex'),
              sessionToken.tokenVerificationId.toString('hex'),
              'tokenVerificationId must match sessionToken'
            );

            // Verify the session
            return db.verifyTokenCode({ code: tokenVerificationCode }, account);
          })
          .then(() => {
            return db.sessionToken(tokenId);
          })
          .then((session) => {
            // Returns verified session
            assert.isFalse(!!session.mustVerify);
            assert.isNull(session.tokenVerificationId);
            assert.notOk(session.tokenVerificationCodeHash);
            assert.notOk(session.tokenVerificationCodeExpiresAt);
          });
      });

      it("shouldn't verify expired tokenVerificationCode", () => {
        tokenId = hex32();
        sessionToken = makeMockSessionToken(account.uid);
        sessionToken.tokenVerificationCodeExpiresAt = Date.now() - 2000000000;
        tokenVerificationCode = sessionToken.tokenVerificationCode;
        return db.createSessionToken(tokenId, sessionToken).then(() => {
          return db
            .verifyTokenCode({ code: tokenVerificationCode }, account)
            .then(
              () => {
                assert.fail('should not have verified expired token');
              },
              (err) => {
                assert.equal(err.errno, 137, 'correct errno, not found');
              }
            );
        });
      });

      it("shouldn't verify unknown tokenVerificationCode", () => {
        tokenId = hex32();
        sessionToken = makeMockSessionToken(account.uid);
        tokenVerificationCode = 'iamzinvalidz';
        return db.createSessionToken(tokenId, sessionToken).then(() => {
          return db
            .verifyTokenCode({ code: tokenVerificationCode }, account)
            .then(
              () => {
                assert.fail('should not have verified unknown token');
              },
              (err) => {
                assert.equal(err.errno, 116, 'correct errno, not found');
              }
            );
        });
      });

      it("shouldn't verify tokenVerificationCode and uid mismatch", () => {
        tokenId = hex32();
        sessionToken = makeMockSessionToken(account.uid);
        tokenVerificationCode = sessionToken.tokenVerificationCode;
        anotherAccount = createAccount();
        anotherAccount.emailVerified = true;
        return db
          .createAccount(anotherAccount.uid, anotherAccount)
          .then(() => {
            return db.createSessionToken(tokenId, sessionToken);
          })
          .then(() => {
            return db
              .verifyTokenCode({ code: tokenVerificationCode }, anotherAccount)
              .then(
                () => {
                  assert.fail('should not have verified unknown token');
                },
                (err) => {
                  assert.equal(err.errno, 116, 'correct errno, not found');
                }
              );
          });
      });
    });

    describe('Totp handling', () => {
      let sharedSecret, epoch;
      beforeEach(() => {
        sharedSecret = crypto.randomBytes(40).toString('hex');
        epoch = 0;
        return db
          .createTotpToken(accountData.uid, { sharedSecret, epoch })
          .then((result) => assert.ok(result, 'token created'));
      });

      it('should create totp token', () => {
        return db.totpToken(accountData.uid).then((token) => {
          assert.equal(
            token.sharedSecret,
            sharedSecret,
            'correct sharedSecret'
          );
          assert.equal(token.epoch, epoch, 'correct epoch');
          assert.isFalse(!!token.verified);
          assert.isTrue(!!token.enabled);
        });
      });

      it('should fail to get unknown totp token', () => {
        return db.totpToken(newUuid()).then(assert.fail, (err) => {
          assert.equal(err.errno, 116, 'correct errno, not found');
        });
      });

      it('should fail to create second token for same user', () => {
        return db
          .createTotpToken(accountData.uid, { sharedSecret, epoch })
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 101, 'correct errno, duplicate');
          });
      });

      it('should delete totp token', () => {
        return db.deleteTotpToken(accountData.uid).then((result) => {
          assert.ok(result);
          return db
            .totpToken(accountData.uid)
            .then(assert.fail, (err) => {
              assert.equal(err.errno, 116, 'correct errno, not found');

              return db.account(accountData.uid);
            })
            .then((account) => {
              assert.isAbove(account.profileChangedAt, account.createdAt);
            });
        });
      });

      it('should update totp token', () => {
        return db
          .updateTotpToken(accountData.uid, { verified: true, enabled: true })
          .then((result) => {
            assert.ok(result);
            return db
              .totpToken(accountData.uid)
              .then((token) => {
                assert.equal(
                  token.sharedSecret,
                  sharedSecret,
                  'correct sharedSecret'
                );
                assert.equal(token.epoch, epoch, 'correct epoch');
                assert.isTrue(!!token.verified);
                assert.isTrue(!!token.enabled);

                return db.account(accountData.uid);
              })
              .then((account) => {
                assert.isAbove(account.profileChangedAt, account.createdAt);
              });
          });
      });

      it('should fail to update unknown totp token', () => {
        return db
          .updateTotpToken(newUuid(), { verified: true, enabled: true })
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'correct errno, not found');
          });
      });

      it('should delete token when account deleted', () => {
        return db
          .deleteAccount(accountData.uid)
          .then(() => db.totpToken(accountData.uid))
          .then(
            () => assert.fail('should have deleted totp token'),
            (err) => {
              assert.equal(err.errno, 116, 'correct errno, not found');
            }
          );
      });
    });

    describe('db.verifyTokensWithMethod', () => {
      let account, sessionToken, tokenId;
      before(() => {
        account = createAccount();
        account.emailVerified = true;
        tokenId = hex32();
        sessionToken = makeMockSessionToken(account.uid, false);
        return db
          .createAccount(account.uid, account)
          .then(() => db.createSessionToken(tokenId, sessionToken))
          .then(() => db.sessionToken(tokenId))
          .then((session) => {
            // Returns unverified session
            assert.equal(
              session.tokenVerificationId.toString('hex'),
              sessionToken.tokenVerificationId.toString('hex'),
              'tokenVerificationId must match sessionToken'
            );
            assert.isNull(session.verificationMethod);
          });
      });

      it('should fail to verify with unknown sessionId', () => {
        const verifyOptions = {
          verificationMethod: 'totp-2fa',
        };
        return db
          .verifyTokensWithMethod(hex32(), verifyOptions)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'correct errno, not found');
          });
      });

      it('should update session verificationMethod', () => {
        const verifyOptions = {
          verificationMethod: 'totp-2fa',
        };
        return db
          .verifyTokens(sessionToken.tokenVerificationId, account)
          .then(() => {
            return db.sessionToken(tokenId);
          }, assert.fail)
          .then((token) => {
            assert.isFalse(!!token.mustVerify);
            assert.isNull(token.tokenVerificationId);
            assert.isNull(token.verificationMethod);
            return db.verifyTokensWithMethod(tokenId, verifyOptions);
          })
          .then(() => {
            return db.sessionToken(tokenId);
          }, assert.fail)
          .then((token) => {
            assert.isFalse(!!token.mustVerify);
            assert.isNull(token.tokenVerificationId);
            assert.equal(
              token.verificationMethod,
              2,
              'verificationMethod is set'
            );
          });
      });

      it('should fail to verify unknown verification method', () => {
        const verifyOptions = {
          verificationMethod: 'super-invalid-method',
        };
        return db
          .verifyTokensWithMethod(tokenId, verifyOptions)
          .then(assert.fail, (err) => {
            assert.equal(
              err.errno,
              138,
              'correct errno, invalid verification method'
            );
          });
      });

      it('should verify with verification method', () => {
        const verifyOptions = {
          verificationMethod: 'totp-2fa',
        };
        return db
          .verifyTokensWithMethod(tokenId, verifyOptions)
          .then((res) => {
            assert.ok(res);

            // Ensure session really has been verified and correct methods set
            return db.sessionToken(tokenId);
          })
          .then((session) => {
            assert.isNull(session.tokenVerificationId);
            assert.equal(
              session.verificationMethod,
              2,
              'verificationMethod set'
            );
            assert.ok(session.verifiedAt, 'verifiedAt set');
          });
      });
    });

    describe('recovery codes', () => {
      let account;
      beforeEach(() => {
        account = createAccount();
        account.emailVerified = true;
        return db.createAccount(account.uid, account);
      });

      it('should fail to generate for unknown user', () => {
        return db.replaceRecoveryCodes(hex16(), 2).then(assert.fail, (err) => {
          assert.equal(err.errno, 116, 'correct errno, not found');
        });
      });

      const codeLengthTest = [0, 4, 8];
      const codeTest = /^[a-zA-Z0-9]{0,20}$/;
      codeLengthTest.forEach((num) => {
        it('should generate ' + num + ' recovery codes', () => {
          return db.replaceRecoveryCodes(account.uid, num).then(
            (codes) => {
              assert.lengthOf(codes, num);
              codes.forEach((code) => {
                assert.match(code, codeTest);
              });
            },
            (err) => {
              assert.equal(err.errno, 116, 'correct errno, not found');
            }
          );
        });
      });

      it('should replace recovery codes', () => {
        let firstCodes;
        return db
          .replaceRecoveryCodes(account.uid, 2)
          .then((codes) => {
            firstCodes = codes;
            assert.lengthOf(firstCodes, 2);

            return db.replaceRecoveryCodes(account.uid, 3);
          })
          .then((codes) => {
            assert.lengthOf(codes, 3);
            assert.notDeepEqual(codes, firstCodes, 'codes are different');
          });
      });

      it('should remove codes when account deleted', () => {
        let recoveryCodes;
        return db
          .replaceRecoveryCodes(account.uid, 2)
          .then((codes) => {
            recoveryCodes = codes;
            return db.deleteAccount(account.uid);
          })
          .then((result) =>
            db.consumeRecoveryCode(account.uid, recoveryCodes[0])
          )
          .then(
            () => assert.fail('should have removed codes'),
            (err) => {
              assert.equal(err.errno, 116, 'correct errno, not found');
            }
          );
      });

      describe('should consume recovery codes', function () {
        // Consuming recovery codes is more time intensive since the scrypt hashes need
        // to be compared. Let set timeout higher than 2s default.
        this.timeout(12000);

        let recoveryCodes;
        beforeEach(() => {
          return db.replaceRecoveryCodes(account.uid, 2).then((codes) => {
            recoveryCodes = codes;
            assert.lengthOf(recoveryCodes, 2);
          });
        });

        it('should fail to consume recovery code with unknown uid', () => {
          return db
            .consumeRecoveryCode(hex16(), 'recoverycodez')
            .then(assert.fail, (err) => {
              assert.equal(err.errno, 116, 'correct errno, not found');
            });
        });

        it('should fail to consume recovery code with unknown code', () => {
          return db.replaceRecoveryCodes(account.uid, 3).then(() => {
            return db
              .consumeRecoveryCode(account.uid, 'notvalidcode')
              .then(assert.fail, (err) => {
                assert.equal(
                  err.errno,
                  116,
                  'correct errno, unknown recovery code'
                );
              });
          });
        });

        it('should fail to consume code twice', () => {
          return db
            .consumeRecoveryCode(account.uid, recoveryCodes[0])
            .then((result) => {
              assert.equal(
                result.remaining,
                1,
                'correct number of remaining codes'
              );

              // Should fail to consume code twice
              return db
                .consumeRecoveryCode(account.uid, recoveryCodes[0])
                .then(assert.fail, (err) => {
                  assert.equal(
                    err.errno,
                    116,
                    'correct errno, unknown recovery code'
                  );
                });
            });
        });

        it('should consume code', () => {
          return db
            .consumeRecoveryCode(account.uid, recoveryCodes[0])
            .then((result) => {
              assert.equal(
                result.remaining,
                1,
                'correct number of remaining codes'
              );

              return db
                .consumeRecoveryCode(account.uid, recoveryCodes[1])
                .then((result) => {
                  assert.equal(
                    result.remaining,
                    0,
                    'correct number of remaining codes'
                  );
                });
            });
        });
      });
    });

    describe('account recovery key', () => {
      let account, data;
      beforeEach(() => {
        account = createAccount();
        return db
          .createAccount(account.uid, account)
          .then(() => {
            data = createRecoveryData();
            // Create a valid recovery key
            return db.createRecoveryKey(account.uid, data);
          })
          .then((res) => {
            assert.ok(res, 'empty response');
          });
      });

      it('should fail to create for unknown user', () => {
        return db
          .createRecoveryKey('12312312312', data)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'not found');
          });
      });

      it('should fail to create multiple keys', () => {
        data = createRecoveryData();
        return db
          .createRecoveryKey(account.uid, data)
          .then(assert.fail, (err) => {
            assert.equal(err.errno, 101, 'record exists');
          });
      });

      it('should get account recovery key', () => {
        const options = {
          id: account.uid,
          recoveryKeyId: data.recoveryKeyId,
        };
        return db.getRecoveryKey(options).then((res) => {
          assert.equal(
            res.recoveryData,
            data.recoveryData,
            'recovery data set'
          );
          const recoveryKeyIdHash = util.createHash(data.recoveryKeyId);
          assert.equal(
            res.recoveryKeyIdHash.toString('hex'),
            recoveryKeyIdHash.toString('hex'),
            'recoveryKeyId set'
          );
          assert.ok(res.createdAt);
          assert.equal(res.enabled, true);
          assert.equal(res.verifiedAt, undefined);
        });
      });

      it('should fail to get key for incorrect user', () => {
        const options = {
          id: 'unknown',
          recoveryKeyId: '123',
        };
        return db.getRecoveryKey(options).then(assert.fail, (err) => {
          assert.equal(err.errno, 116, 'not found');
        });
      });

      it('should fail to get non-existent key', () => {
        account = createAccount();
        return db.createAccount(account.uid, account).then(() => {
          const options = {
            id: account.uid,
            recoveryKeyId: 'unknown',
          };
          return db.getRecoveryKey(options).then(assert.fail, (err) => {
            assert.equal(err.errno, 116, 'not found');
          });
        });
      });

      it('should fail to get key with invalid recoveryKeyId', () => {
        const options = {
          id: account.uid,
          recoveryKeyId: 'incorrect recoveryKeyId',
        };
        return db.getRecoveryKey(options).then(assert.fail, (err) => {
          assert.equal(err.errno, 159, 'incorrect recoveryKeyId');
        });
      });

      it('should return true if recovery key exists', () => {
        return db.recoveryKeyExists(account.uid).then((res) => {
          assert.isTrue(res.exists);
        });
      });

      it("should return false if recovery key doesn't exist", () => {
        account = createAccount();
        return db.createAccount(account.uid, account).then(() => {
          return db.recoveryKeyExists(account.uid).then((res) => {
            assert.isFalse(res.exists);
          });
        });
      });

      it('should throw when checking for recovery key on non-existent user', () => {
        return db.recoveryKeyExists('nonexistent').then((res) => {
          assert.isFalse(res.exists);
        });
      });

      it('should remove recovery key when account deleted', () => {
        const options = {
          id: account.uid,
          recoveryKeyId: data.recoveryKeyId,
        };
        return db
          .deleteAccount(account.uid)
          .then(() => db.getRecoveryKey(options))
          .then(
            () => assert.fail('should have deleted recovery key'),
            (err) => {
              assert.equal(err.errno, 116, 'correct errno, not found');
            }
          );
      });

      it('should remove recovery key when account password is reset', () => {
        const options = {
          id: account.uid,
          recoveryKeyId: data.recoveryKeyId,
        };
        return db
          .resetAccount(account.uid, account)
          .then(() => db.getRecoveryKey(options))
          .then(
            () => assert.fail('should have deleted recovery key'),
            (err) => {
              assert.equal(err.errno, 116, 'correct errno, not found');
            }
          );
      });

      it('should create disabled key and then verify it', async () => {
        account = createAccount();
        await db.createAccount(account.uid, account);
        data = createRecoveryData();
        data.enabled = false;
        await db.createRecoveryKey(account.uid, data);

        let res = await db.getRecoveryKey({
          id: account.uid,
          recoveryKeyId: data.recoveryKeyId,
        });
        assert.ok(res.createdAt);
        assert.equal(res.enabled, false);
        assert.equal(res.verifiedAt, undefined);

        const updatedKey = Object.assign({}, data, {
          verifiedAt: Date.now(),
          enabled: true,
        });
        await db.updateRecoveryKey(account.uid, updatedKey);

        res = await db.getRecoveryKey({
          id: account.uid,
          recoveryKeyId: data.recoveryKeyId,
        });
        assert.ok(res.createdAt);
        assert.equal(res.enabled, true);
        assert.equal(res.verifiedAt, updatedKey.verifiedAt);
      });

      it('should error if verifying unknown key', async () => {
        account = createAccount();
        await db.createAccount(account.uid, account);

        data = Object.assign({}, createRecoveryData(), {
          verifiedAt: Date.now(),
          enabled: true,
        });

        try {
          await db.updateRecoveryKey(account.uid, data);
          assert.fail('should have failed');
        } catch (err) {
          assert.equal(err.errno, 116, 'Not found error');
        }
      });
    });

    after(() => db.close());
  });
};
