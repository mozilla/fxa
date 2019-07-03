/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const P = require('bluebird');
const extend = require('util')._extend;
const ip = require('ip');
const dbUtil = require('./util');
const config = require('../../config');

// our data stores
var accounts = {};
var uidByNormalizedEmail = {};
var sessionTokens = {};
var keyFetchTokens = {};
var unverifiedTokens = {};
var accountResetTokens = {};
var passwordChangeTokens = {};
var passwordForgotTokens = {};
var reminders = {};
var securityEvents = {};
var unblockCodes = {};
var emailBounces = {};
var emails = {};
var signinCodes = {};
const totpTokens = {};
const recoveryCodes = {};
const recoveryKeys = {};
const devicesByRefreshTokenId = {};
const accountSubscriptions = {};

var DEVICE_FIELDS = [
  'sessionTokenId',
  'refreshTokenId',
  'name',
  'type',
  'createdAt',
  'callbackURL',
  'callbackPublicKey',
  'callbackAuthKey',
  'callbackIsExpired',
  'availableCommands',
];

const SESSION_DEVICE_FIELDS = [
  'uaBrowser',
  'uaBrowserVersion',
  'uaOS',
  'uaOSVersion',
  'uaDeviceType',
  'uaFormFactor',
  'lastAccessTime',
];

const RECOVERY_CODE_LENGTH = config.recoveryCodes.length;
const SECURITY_EVENTS_LIMIT = 100;

module.exports = function(log, error) {
  function Memory(db) {}

  function getAccountByUid(uid) {
    if (!uid) {
      return P.reject(error.notFound());
    }
    uid = uid.toString('hex');
    if (accounts[uid]) {
      return P.resolve(accounts[uid]);
    }
    return P.reject(error.notFound());
  }

  function filterAccount(account) {
    var item = extend({}, account);
    delete item.verifyHash;

    item.profileChangedAt =
      item.profileChangedAt || item.verifierSetAt || item.createdAt;
    item.keysChangedAt =
      item.keysChangedAt || item.verifierSetAt || item.createdAt;

    return P.resolve(item);
  }

  // CREATE
  Memory.prototype.createAccount = function(uid, data) {
    uid = uid.toString('hex');

    data.devices = {};

    if (accounts[uid] || emails[data.normalizedEmail]) {
      return P.reject(error.duplicate());
    }

    if (uidByNormalizedEmail[data.normalizedEmail]) {
      return P.reject(error.duplicate());
    }

    accounts[uid.toString('hex')] = data;
    uidByNormalizedEmail[data.normalizedEmail] = uid;

    emails[data.normalizedEmail] = {
      createdAt: data.createdAt,
      email: data.email,
      emailCode: data.emailCode,
      normalizedEmail: data.normalizedEmail,
      isPrimary: true,
      isVerified: data.emailVerified,
      uid: uid,
    };

    return P.resolve({});
  };

  Memory.prototype.createSessionToken = function(tokenId, sessionToken) {
    sessionToken.id = tokenId;
    tokenId = tokenId.toString('hex');

    if (sessionTokens[tokenId]) {
      return P.reject(error.duplicate());
    }

    sessionTokens[tokenId] = {
      data: sessionToken.data,
      uid: sessionToken.uid,
      createdAt: sessionToken.createdAt,
      uaBrowser: sessionToken.uaBrowser,
      uaBrowserVersion: sessionToken.uaBrowserVersion,
      uaOS: sessionToken.uaOS,
      uaOSVersion: sessionToken.uaOSVersion,
      uaDeviceType: sessionToken.uaDeviceType,
      uaFormFactor: sessionToken.uaFormFactor,
      lastAccessTime: sessionToken.createdAt,
      mustVerify: !!sessionToken.mustVerify,
    };

    if (sessionToken.tokenVerificationId) {
      const tokenVerificationCodeHash = sessionToken.tokenVerificationCode
        ? dbUtil.createHash(sessionToken.tokenVerificationCode)
        : null;
      unverifiedTokens[tokenId] = {
        mustVerify: !!sessionToken.mustVerify,
        tokenVerificationId: sessionToken.tokenVerificationId,
        tokenVerificationCodeHash: tokenVerificationCodeHash,
        tokenVerificationCodeExpiresAt:
          sessionToken.tokenVerificationCodeExpiresAt,
        uid: sessionToken.uid,
      };
    }

    return P.resolve({});
  };

  Memory.prototype.createKeyFetchToken = function(tokenId, keyFetchToken) {
    tokenId = tokenId.toString('hex');

    if (keyFetchTokens[tokenId]) {
      return P.reject(error.duplicate());
    }

    keyFetchTokens[tokenId] = {
      authKey: keyFetchToken.authKey,
      uid: keyFetchToken.uid,
      keyBundle: keyFetchToken.keyBundle,
      createdAt: keyFetchToken.createdAt,
    };

    if (keyFetchToken.tokenVerificationId) {
      unverifiedTokens[tokenId] = {
        tokenVerificationId: keyFetchToken.tokenVerificationId,
        uid: keyFetchToken.uid,
      };
    }

    return P.resolve({});
  };

  Memory.prototype.createPasswordForgotToken = function(
    tokenId,
    passwordForgotToken
  ) {
    tokenId = tokenId.toString('hex');

    if (passwordForgotTokens[tokenId]) {
      return P.reject(error.duplicate());
    }

    // Delete any passwordForgotTokens for this uid (since we're only
    // allowed one at a time).
    deleteByUid(passwordForgotToken.uid.toString('hex'), passwordForgotTokens);

    passwordForgotTokens[tokenId] = {
      tokenData: passwordForgotToken.data,
      uid: passwordForgotToken.uid,
      passCode: passwordForgotToken.passCode,
      tries: passwordForgotToken.tries,
      createdAt: passwordForgotToken.createdAt,
    };

    return P.resolve({});
  };

  Memory.prototype.createPasswordChangeToken = function(
    tokenId,
    passwordChangeToken
  ) {
    tokenId = tokenId.toString('hex');

    if (passwordChangeTokens[tokenId]) {
      return P.reject(error.duplicate());
    }

    // Delete any passwordChangeTokens for this uid (since we're only
    // allowed one at a time).
    deleteByUid(passwordChangeToken.uid.toString('hex'), passwordChangeTokens);

    passwordChangeTokens[tokenId] = {
      tokenData: passwordChangeToken.data,
      uid: passwordChangeToken.uid,
      createdAt: passwordChangeToken.createdAt,
    };

    return P.resolve({});
  };

  Memory.prototype.createDevice = function(uid, deviceId, deviceInfo) {
    return getAccountByUid(uid).then(function(account) {
      var deviceKey = deviceId.toString('hex');
      if (account.devices[deviceKey]) {
        throw error.duplicate();
      }
      var device = {
        uid: uid,
        id: deviceId,
        createdAt: Date.now(),
        availableCommands: {},
      };
      deviceInfo.callbackIsExpired = false; // mimic the db behavior assigning a default false value
      account.devices[deviceKey] = updateDeviceRecord(
        device,
        deviceInfo,
        deviceKey
      );
      return {};
    });
  };

  function updateDeviceRecord(device, deviceInfo, deviceKey) {
    // Prevent multiple device records from linking to the same sessionToken.
    let session;
    const sessionKey = (deviceInfo.sessionTokenId || '').toString('hex');
    if (sessionKey) {
      session = sessionTokens[sessionKey];
      if (session && session.deviceKey && session.deviceKey !== deviceKey) {
        throw error.duplicate();
      }
    }

    // Prevent multiple device records from linking to the same refreshToken.
    const refreshTokenId = (deviceInfo.refreshTokenId || '').toString('hex');
    if (refreshTokenId) {
      const existingDevice = devicesByRefreshTokenId[refreshTokenId];
      if (existingDevice && existingDevice !== deviceKey) {
        throw error.duplicate();
      }
      devicesByRefreshTokenId[refreshTokenId] = deviceKey;
    }

    DEVICE_FIELDS.forEach(function(key) {
      var field = deviceInfo[key];
      if (field === undefined || field === null) {
        if (device[key] === undefined) {
          device[key] = null;
        }
        return;
      }
      device[key] = field;
    });

    if (session) {
      SESSION_DEVICE_FIELDS.forEach(function(key) {
        device[key] = session[key];
      });
      session.deviceKey = deviceKey;
    } else {
      SESSION_DEVICE_FIELDS.forEach(function(key) {
        device[key] = null;
      });
    }

    return device;
  }

  Memory.prototype.updateDevice = function(uid, deviceId, deviceInfo) {
    return getAccountByUid(uid).then(function(account) {
      var deviceKey = deviceId.toString('hex');
      if (!account.devices[deviceKey]) {
        throw error.notFound();
      }
      var device = account.devices[deviceKey];
      // If changing sessionTokenId, the old token loses its device record.
      if (device.sessionTokenId) {
        if (deviceInfo.sessionTokenId) {
          var oldSessionKey = device.sessionTokenId.toString('hex');
          if (oldSessionKey !== deviceInfo.sessionTokenId.toString('hex')) {
            var oldSession = sessionTokens[oldSessionKey];
            if (oldSession) {
              oldSession.deviceKey = null;
            }
          }
        } else {
          deviceInfo.sessionTokenId = device.sessionTokenId;
        }
      }
      // If changing refreshTokenId, the old token loses its device record.
      if (device.refreshTokenId) {
        if (deviceInfo.refreshTokenId) {
          const oldRefreshTokenId = device.refreshTokenId.toString('hex');
          if (oldRefreshTokenId !== deviceInfo.refreshTokenId.toString('hex')) {
            delete devicesByRefreshTokenId[oldRefreshTokenId];
          }
        } else {
          deviceInfo.refreshTokenId = device.refreshTokenId;
        }
      }
      account.devices[deviceKey] = updateDeviceRecord(
        device,
        deviceInfo,
        deviceKey
      );
      return {};
    });
  };

  // DELETE

  // The lazy way
  // uid is a hex string (not a buffer)
  function deleteByUid(uid, collection) {
    Object.keys(collection).forEach(function(key) {
      var item = collection[key];

      if (!item.uid) {
        throw new Error('No "uid" property in collection item');
      }

      if (item.uid.toString('hex') === uid) {
        delete collection[key];
      }
    });
  }

  Memory.prototype.deleteSessionToken = function(tokenId) {
    tokenId = tokenId.toString('hex');
    var sessionToken = sessionTokens[tokenId];

    return P.resolve()
      .then(function() {
        if (sessionToken) {
          return getAccountByUid(sessionToken.uid).then(function(account) {
            var devices = account.devices;

            Object.keys(devices).forEach(function(key) {
              var sessionTokenId = devices[key].sessionTokenId;

              if (
                sessionTokenId &&
                sessionTokenId.toString('hex') === tokenId
              ) {
                delete devices[key];
              }
            });
          });
        }
      })
      .then(function() {
        delete unverifiedTokens[tokenId];
        delete sessionTokens[tokenId];

        return {};
      });
  };

  Memory.prototype.deleteKeyFetchToken = function(tokenId) {
    tokenId = tokenId.toString('hex');

    delete unverifiedTokens[tokenId];
    delete keyFetchTokens[tokenId];

    return P.resolve({});
  };

  Memory.prototype.verifyTokens = function(tokenVerificationId, accountData) {
    tokenVerificationId = tokenVerificationId.toString('hex');
    var uid = accountData.uid.toString('hex');

    var tokenCount = Object.keys(unverifiedTokens).reduce(function(
      count,
      tokenId
    ) {
      var t = unverifiedTokens[tokenId];
      if (
        t.tokenVerificationId.toString('hex') !== tokenVerificationId ||
        t.uid.toString('hex') !== uid
      ) {
        return count;
      }

      // update securityEvents table
      (securityEvents[uid] || []).forEach(function(ev) {
        if (ev.tokenId && ev.tokenId.toString('hex') === tokenId) {
          ev.verified = true;
        }
      });

      delete unverifiedTokens[tokenId];
      return count + 1;
    },
    0);

    if (tokenCount === 0) {
      return P.reject(error.notFound());
    }

    return P.resolve({});
  };

  Memory.prototype.verifyTokenCode = function(tokenData, accountData) {
    const tokenVerificationCodeHash = dbUtil.createHash(tokenData.code);

    let token = undefined;
    Object.keys(unverifiedTokens).some(t => {
      const tempToken = unverifiedTokens[t];
      if (
        tempToken.tokenVerificationCodeHash &&
        tempToken.tokenVerificationCodeHash.toString('hex') ===
          tokenVerificationCodeHash.toString('hex')
      ) {
        token = tempToken;
        return true;
      }
    });

    if (token && token.tokenVerificationCodeExpiresAt <= Date.now()) {
      return P.reject(error.expiredTokenVerificationCode());
    }

    if (!token) {
      return P.reject(error.notFound());
    }

    return this.verifyTokens(token.tokenVerificationId, accountData);
  };

  Memory.prototype.deleteAccountResetToken = function(tokenId) {
    delete accountResetTokens[tokenId.toString('hex')];
    return P.resolve({});
  };

  Memory.prototype.deletePasswordForgotToken = function(tokenId) {
    delete passwordForgotTokens[tokenId.toString('hex')];
    return P.resolve({});
  };

  Memory.prototype.deletePasswordChangeToken = function(tokenId) {
    delete passwordChangeTokens[tokenId.toString('hex')];
    return P.resolve({});
  };

  Memory.prototype.deleteDevice = function(uid, deviceId) {
    const deviceKey = deviceId.toString('hex');
    let sessionTokenId, refreshTokenId;

    return getAccountByUid(uid)
      .then(account => {
        if (!account.devices[deviceKey]) {
          throw error.notFound();
        }

        const device = account.devices[deviceKey];
        sessionTokenId = device.sessionTokenId;
        refreshTokenId = device.refreshTokenId;

        delete account.devices[deviceKey];

        if (sessionTokenId) {
          return Memory.prototype.deleteSessionToken(sessionTokenId);
        }
      })
      .then(() => ({ sessionTokenId, refreshTokenId }));
  };

  // READ

  Memory.prototype.accountExists = function(email) {
    email = email.toString('utf8').toLowerCase();
    if (uidByNormalizedEmail[email]) {
      return P.resolve({});
    }
    return P.reject(error.notFound());
  };

  Memory.prototype.checkPassword = function(uid, hash) {
    return getAccountByUid(uid).then(
      function(account) {
        if (
          account.verifyHash.toString('hex') === hash.verifyHash.toString('hex')
        ) {
          return P.resolve({ uid: uid });
        } else {
          return P.reject(error.incorrectPassword());
        }
      },
      function() {
        return P.reject(error.incorrectPassword());
      }
    );
  };

  Memory.prototype.accountDevices = function(uid) {
    return getAccountByUid(uid).then(
      function(account) {
        return Object.keys(account.devices)
          .map(function(deviceKey) {
            var device = Object.assign({}, account.devices[deviceKey]);
            var sessionKey = (device.sessionTokenId || '').toString('hex');
            var session = sessionTokens[sessionKey];
            if (session) {
              SESSION_DEVICE_FIELDS.forEach(function(key) {
                device[key] = session[key];
              });
              return device;
            }
            if (device.refreshTokenId) {
              device.sessionTokenId = null;
              return device;
            }
          })
          .filter(function(device) {
            return !!device;
          });
      },
      function(err) {
        return [];
      }
    );
  };

  Memory.prototype.device = function(uid, deviceId) {
    return this.accountDevices(uid)
      .then(devices => devices.find(d => d.id.equals(deviceId)))
      .then(device => {
        if (!device) {
          throw error.notFound();
        }
        return device;
      });
  };

  Memory.prototype.deviceFromTokenVerificationId = function(
    uid,
    tokenVerificationId
  ) {
    var tokenIds = Object.keys(unverifiedTokens);
    var sessionTokenId;
    for (var i = 0; i < tokenIds.length; i++) {
      var unverifiedToken = unverifiedTokens[tokenIds[i]];
      if (
        unverifiedToken.tokenVerificationId.equals(tokenVerificationId) &&
        unverifiedToken.uid.equals(uid)
      ) {
        sessionTokenId = tokenIds[i];
        break;
      }
    }
    if (!sessionTokenId) {
      return P.reject(error.notFound());
    }
    return this.accountDevices(uid).then(function(devices) {
      var device = devices.filter(function(d) {
        return (
          d.sessionTokenId &&
          d.sessionTokenId.toString('hex') === sessionTokenId
        );
      })[0];
      if (!device) {
        throw error.notFound();
      }
      return P.resolve({
        id: device.id,
        name: device.name,
        type: device.type,
        createdAt: device.createdAt,
        callbackURL: device.callbackURL,
        callbackPublicKey: device.callbackPublicKey,
        callbackAuthKey: device.callbackAuthKey,
        callbackIsExpired: device.callbackIsExpired,
        availableCommands: device.availableCommands,
      });
    });
  };

  Memory.prototype.sessionToken = function(id) {
    id = id.toString('hex');

    if (!sessionTokens[id]) {
      return P.reject(error.notFound());
    }

    var item = {};

    item.tokenData = sessionTokens[id].data;
    item.uid = sessionTokens[id].uid;
    item.createdAt = sessionTokens[id].createdAt;
    item.uaBrowser = sessionTokens[id].uaBrowser || null;
    item.uaBrowserVersion = sessionTokens[id].uaBrowserVersion || null;
    item.uaOS = sessionTokens[id].uaOS || null;
    item.uaOSVersion = sessionTokens[id].uaOSVersion || null;
    item.uaDeviceType = sessionTokens[id].uaDeviceType || null;
    item.uaFormFactor = sessionTokens[id].uaFormFactor || null;
    item.lastAccessTime = sessionTokens[id].lastAccessTime;
    item.authAt = sessionTokens[id].authAt || sessionTokens[id].createdAt;
    item.verificationMethod = sessionTokens[id].verificationMethod || null;
    item.verifiedAt = sessionTokens[id].verifiedAt || null;
    item.mustVerify = !!sessionTokens[id].mustVerify;

    var accountId = sessionTokens[id].uid.toString('hex');
    var account = accounts[accountId];

    item.verifierSetAt = account.verifierSetAt;
    item.profileChangedAt =
      account.profileChangedAt || account.verifierSetAt || account.createdAt;
    item.keysChangedAt =
      account.keysChangedAt || account.verifierSetAt || account.createdAt;
    item.locale = account.locale;
    item.accountCreatedAt = account.createdAt;

    if (unverifiedTokens[id]) {
      if (!item.mustVerify) {
        item.mustVerify = unverifiedTokens[id].mustVerify;
      }

      item.tokenVerificationId = unverifiedTokens[id].tokenVerificationId;
      item.tokenVerificationCodeHash =
        unverifiedTokens[id].tokenVerificationCodeHash;
      item.tokenVerificationCodeExpiresAt =
        unverifiedTokens[id].tokenVerificationCodeExpiresAt;
    } else {
      item.tokenVerificationId = null;
      item.tokenVerificationCodeHash = null;
      item.tokenVerificationCodeExpiresAt = null;
    }

    return P.all([
      this.accountEmails(accountId),
      this.accountDevices(item.uid),
    ]).spread((emails, devices) => {
      // Set the primary email on the sessionToken, which
      // could be different from the email on the account object
      emails.some(email => {
        if (email.isPrimary) {
          item.emailVerified = email.isVerified;
          item.email = email.email;
          item.emailCode = email.emailCode;
          return true;
        }
      });

      const device = devices.filter(d => {
        return (
          d.sessionTokenId &&
          d.sessionTokenId.toString('hex') === id.toString('hex')
        );
      })[0];

      if (device) {
        item.deviceId = device.id;
        item.deviceName = device.name;
        item.deviceType = device.type;
        item.deviceCreatedAt = device.createdAt;
        item.deviceCallbackURL = device.callbackURL;
        item.deviceCallbackPublicKey = device.callbackPublicKey;
        item.deviceCallbackAuthKey = device.callbackAuthKey;
        item.deviceCallbackIsExpired = device.callbackIsExpired;
        item.deviceAvailableCommands = device.availableCommands;
      }

      return item;
    });
  };

  // account():
  //
  // Takes:
  //   - uid - a Buffer()
  //
  // Returns:
  //   - the account if found
  //   - throws 'notFound' if not found
  Memory.prototype.account = function(uid) {
    return getAccountByUid(uid).then(function(account) {
      return filterAccount(account);
    });
  };

  // emailRecord():
  //
  // Takes:
  //   - email - a string of hex encoded characters
  //
  // Returns:
  //   - the account if found
  //   - throws 'notFound' if not found
  Memory.prototype.emailRecord = function(email) {
    email = email.toString('utf8').toLowerCase();
    return getAccountByUid(uidByNormalizedEmail[email])
      .then(function(account) {
        return filterAccount(account);
      })
      .then(account => {
        delete account.locale;
        return account;
      });
  };

  Memory.prototype.sessions = function(uid) {
    return this.accountDevices(uid).then(function(devices) {
      var hexUid = uid.toString('hex');
      var sessions = Object.keys(sessionTokens)
        .filter(function(key) {
          return sessionTokens[key].uid.toString('hex') === hexUid;
        })
        .map(function(key) {
          var sessionToken = sessionTokens[key];

          var deviceInfo = devices.find(function(device) {
            return (
              device.sessionTokenId &&
              device.sessionTokenId.toString('hex') === key
            );
          });

          if (!deviceInfo) {
            deviceInfo = {};
          }

          var session = {
            tokenId: Buffer.from(key, 'hex'),
            uid: sessionToken.uid,
            createdAt: sessionToken.createdAt,
            uaBrowser: sessionToken.uaBrowser || null,
            uaBrowserVersion: sessionToken.uaBrowserVersion || null,
            uaOS: sessionToken.uaOS || null,
            uaOSVersion: sessionToken.uaOSVersion || null,
            uaDeviceType: sessionToken.uaDeviceType || null,
            uaFormFactor: sessionToken.uaFormFactor || null,
            lastAccessTime: sessionToken.lastAccessTime,
            authAt: sessionToken.authAt || sessionToken.createdAt,
            // device information
            deviceId: deviceInfo.id || null,
            deviceName: deviceInfo.name || null,
            deviceType: deviceInfo.type || null,
            deviceCreatedAt: deviceInfo.createdAt || null,
            deviceCallbackURL: deviceInfo.callbackURL || null,
            deviceCallbackPublicKey: deviceInfo.callbackPublicKey || null,
            deviceCallbackAuthKey: deviceInfo.callbackAuthKey || null,
            deviceCallbackIsExpired:
              deviceInfo.callbackIsExpired !== undefined
                ? deviceInfo.callbackIsExpired
                : null,
            deviceAvailableCommands: deviceInfo.availableCommands || null,
          };

          return session;
        });

      return sessions;
    });
  };

  Memory.prototype.keyFetchToken = function(id) {
    id = id.toString('hex');

    if (!keyFetchTokens[id]) {
      return P.reject(error.notFound());
    }

    var item = {};

    var token = keyFetchTokens[id];
    item.authKey = token.authKey;
    item.uid = token.uid;
    item.keyBundle = token.keyBundle;
    item.createdAt = token.createdAt;

    var accountId = token.uid.toString('hex');
    var account = accounts[accountId];
    item.emailVerified = account.emailVerified;
    item.verifierSetAt = account.verifierSetAt;

    return P.resolve(item);
  };

  Memory.prototype.keyFetchTokenWithVerificationStatus = function(tokenId) {
    tokenId = tokenId.toString('hex');

    return this.keyFetchToken(tokenId).then(function(keyFetchToken) {
      keyFetchToken.tokenVerificationId = unverifiedTokens[tokenId]
        ? unverifiedTokens[tokenId].tokenVerificationId
        : null;
      return keyFetchToken;
    });
  };

  Memory.prototype.passwordForgotToken = function(id) {
    id = id.toString('hex');

    if (!passwordForgotTokens[id]) {
      return P.reject(error.notFound());
    }

    var item = {};

    var token = passwordForgotTokens[id];
    item.tokenData = token.tokenData;
    item.uid = token.uid;
    item.passCode = token.passCode;
    item.tries = token.tries;
    item.createdAt = token.createdAt;

    var accountId = token.uid.toString('hex');
    var account = accounts[accountId];
    item.email = account.email;
    item.verifierSetAt = account.verifierSetAt;

    return P.resolve(item);
  };

  Memory.prototype.passwordChangeToken = function(id) {
    id = id.toString('hex');

    if (!passwordChangeTokens[id]) {
      return P.reject(error.notFound());
    }

    var item = {};

    var token = passwordChangeTokens[id];
    item.tokenData = token.tokenData;
    item.uid = token.uid;
    item.createdAt = token.createdAt;

    var accountId = token.uid.toString('hex');
    var account = accounts[accountId];
    item.verifierSetAt = account.verifierSetAt;

    return P.resolve(item);
  };

  Memory.prototype.accountResetToken = function(id) {
    id = id.toString('hex');

    if (!accountResetTokens[id]) {
      return P.reject(error.notFound());
    }

    var item = {};

    var token = accountResetTokens[id];
    item.tokenData = token.tokenData;
    item.uid = token.uid;
    item.createdAt = token.createdAt;

    var accountId = token.uid.toString('hex');
    var account = accounts[accountId];
    item.verifierSetAt = account.verifierSetAt;

    return P.resolve(item);
  };

  // BATCH
  Memory.prototype.verifyEmail = function(uid, emailCode) {
    return getAccountByUid(uid).then(
      function(account) {
        // Check to see if the `emailCode` passed belongs to the account table
        // or the email table. Verify the correct email that belongs to the code.
        if (!emailCode) {
          emailCode = account.emailCode;
        }

        if (account.emailCode.toString('hex') === emailCode.toString('hex')) {
          account.emailVerified = 1;
        }

        // Check to see if emailCode belongs to emails table,
        // if so, verify it.
        Object.keys(emails).some(function(key) {
          var emailRecord = emails[key];

          // Ignore records that don't belong to this user
          if (uid.toString('hex') !== emailRecord.uid.toString('hex')) {
            return false;
          }

          // Verify email record if it matches emailCode
          if (
            emailRecord.emailCode.toString('hex') === emailCode.toString('hex')
          ) {
            emailRecord.isVerified = 1;
            account.profileChangedAt = Date.now();
            return true;
          }

          return false;
        });

        return {};
      },
      function() {
        return {};
      }
    );
  };

  Memory.prototype.forgotPasswordVerified = function(
    tokenId,
    accountResetToken
  ) {
    return P.all([
      this.deletePasswordForgotToken(tokenId),
      createAccountResetToken(),
      this.verifyEmail(accountResetToken.uid),
    ]);

    function createAccountResetToken() {
      var tokenId = accountResetToken.tokenId.toString('hex');

      // Delete any accountResetTokens for this uid (since we're only
      // allowed one at a time).
      deleteByUid(accountResetToken.uid.toString('hex'), accountResetTokens);

      accountResetTokens[tokenId] = {
        tokenData: accountResetToken.data,
        uid: accountResetToken.uid,
        createdAt: accountResetToken.createdAt,
      };

      return P.resolve({});
    }
  };

  Memory.prototype.resetAccount = function(uid, data) {
    return getAccountByUid(uid).then(function(account) {
      uid = uid.toString('hex');
      deleteByUid(uid, sessionTokens);
      deleteByUid(uid, keyFetchTokens);
      deleteByUid(uid, accountResetTokens);
      deleteByUid(uid, passwordChangeTokens);
      deleteByUid(uid, passwordForgotTokens);
      deleteByUid(uid, unverifiedTokens);

      account.verifyHash = data.verifyHash;
      account.authSalt = data.authSalt;
      account.wrapWrapKb = data.wrapWrapKb;
      account.verifierSetAt = data.verifierSetAt;
      account.verifierVersion = data.verifierVersion;
      account.profileChangedAt = data.verifierSetAt;
      account.devices = {};
      return [];
    });
  };

  Memory.prototype.deleteAccount = function(uid) {
    return getAccountByUid(uid).then(function(account) {
      uid = uid.toString('hex');
      deleteByUid(uid, sessionTokens);
      deleteByUid(uid, keyFetchTokens);
      deleteByUid(uid, accountResetTokens);
      deleteByUid(uid, passwordChangeTokens);
      deleteByUid(uid, passwordForgotTokens);
      deleteByUid(uid, unverifiedTokens);
      deleteByUid(uid, emails);
      deleteByUid(uid, signinCodes);

      delete uidByNormalizedEmail[account.normalizedEmail];
      delete accounts[uid];
      delete totpTokens[uid];
      delete recoveryCodes[uid];
      delete recoveryKeys[uid];
      delete securityEvents[uid];

      return [];
    });
  };

  Memory.prototype.updateLocale = function(uid, data) {
    return getAccountByUid(uid).then(function(account) {
      account.locale = data.locale;
      return {};
    });
  };

  // UPDATE

  Memory.prototype.updatePasswordForgotToken = function(id, data) {
    var token = passwordForgotTokens[id.toString('hex')];
    if (!token) {
      return P.reject(error.notFound());
    }
    token.tries = data.tries;
    return P.resolve({});
  };

  Memory.prototype.updateSessionToken = function(id, data) {
    const hexId = id.toString('hex');
    const token = sessionTokens[hexId];
    if (!token) {
      return P.reject(error.notFound());
    }
    Object.assign(token, data);
    if (data.mustVerify && unverifiedTokens[hexId]) {
      unverifiedTokens[hexId].mustVerify = true;
    }
    return P.resolve({});
  };

  // VERIFICATION REMINDERS

  Memory.prototype.createVerificationReminder = function(body) {
    if (!body || !body.uid || !body.type) {
      throw error.wrap(new Error('"uid", "type" are required'));
    }

    var reminderData = {
      uid: body.uid,
      type: body.type,
      createdAt: Date.now(),
    };
    reminders[
      reminderData.uid.toString('hex') + reminderData.type
    ] = reminderData;

    return P.resolve({});
  };

  Memory.prototype.fetchReminders = function(body, query) {
    if (!query || !query.reminderTime || !query.type || !query.limit) {
      throw error.wrap(
        new Error('fetchReminders - reminderTime, limit or type missing')
      );
    }

    var self = this;
    var result = Object.keys(reminders)
      .map(function(key) {
        return reminders[key];
      })
      .filter(function(item) {
        return (
          item.type === query.type &&
          Date.now() - item.createdAt > query.reminderTime
        );
      })
      .slice(0, query.limit);

    result.forEach(function(reminder) {
      self.deleteReminder({
        uid: reminder.uid,
        type: reminder.type,
      });
    });

    return P.resolve(result);
  };

  Memory.prototype.deleteReminder = function(body) {
    if (!body || !body.uid || !body.type) {
      throw error.wrap(new Error('"uid", "type" are required'));
    }

    delete reminders[body.uid.toString('hex') + body.type];

    return P.resolve({});
  };

  Memory.prototype.createSecurityEvent = function(data) {
    var addr = data.ipAddr;
    if (ip.isV4Format(addr)) {
      addr = '::' + addr;
    }

    var verified =
      !data.tokenId || !unverifiedTokens[data.tokenId.toString('hex')];

    var event = {
      createdAt: Date.now(),
      ipAddr: addr,
      name: data.name,
      uid: data.uid,
      tokenId: data.tokenId,
      verified: verified,
    };
    var key = event.uid.toString('hex');

    var events = securityEvents[key] || (securityEvents[key] = []);
    events.push(event);

    return P.resolve({});
  };

  Memory.prototype.securityEvents = function(where) {
    var key = where.id.toString('hex');
    var events = securityEvents[key] || [];
    var addr = where.ipAddr;
    if (ip.isV4Format(addr)) {
      addr = '::' + addr;
    }

    return P.resolve(
      events
        .filter(function(ev) {
          return ev.uid.toString('hex') === key && ip.isEqual(ev.ipAddr, addr);
        })
        .map(function(ev) {
          return {
            name: ev.name,
            createdAt: ev.createdAt,
            verified: ev.verified,
          };
        })
        .reverse()
    );
  };

  Memory.prototype.securityEventsByUid = function(uid) {
    if (!uid) {
      return P.reject(error.notFound());
    }
    uid = uid.toString('hex');
    const events = securityEvents[uid] || [];

    function filterEvents(events, eventsLimit, uid) {
      const filteredEvents = [];

      for (let i = 0; i < events.length; i++) {
        if (filteredEvents.length === eventsLimit) {
          break;
        }

        if (events[i].uid.toString('hex') === uid) {
          filteredEvents.push(events[i]);
        }
      }
      return filteredEvents;
    }

    const filteredSecurityEvents = filterEvents(
      events,
      SECURITY_EVENTS_LIMIT,
      uid
    );
    return P.resolve(
      filteredSecurityEvents
        .map(ev => {
          return {
            name: ev.name,
            createdAt: ev.createdAt,
            verified: ev.verified,
          };
        })
        .reverse()
    );
  };

  Memory.prototype.deleteSecurityEventsByUid = function(uid) {
    if (!uid) {
      return P.reject(error.notFound());
    }
    uid = uid.toString('hex');

    delete securityEvents[uid];
    return P.resolve({});
  };

  Memory.prototype.createUnblockCode = function(uid, code) {
    uid = uid.toString('hex');
    var row = unblockCodes[uid] || (unblockCodes[uid] = {});
    row[code] = Date.now();

    return P.resolve({});
  };

  Memory.prototype.consumeUnblockCode = function(uid, code) {
    var row = unblockCodes[uid.toString('hex')];
    if (!row || !row[code]) {
      return P.reject(error.notFound());
    }
    var timestamp = row[code];
    // Delete all codes for that uid
    unblockCodes[uid.toString('hex')] = null;

    return P.resolve({ createdAt: timestamp });
  };

  Memory.prototype.createEmailBounce = function(data) {
    const row = emailBounces[data.email] || (emailBounces[data.email] = []);
    const bounce = extend({}, data);
    bounce.createdAt = Date.now();
    bounce.bounceType = dbUtil.mapEmailBounceType(bounce.bounceType);
    bounce.bounceSubType = dbUtil.mapEmailBounceSubType(bounce.bounceSubType);
    row.unshift(bounce);
    return P.resolve({});
  };

  Memory.prototype.fetchEmailBounces = function(email) {
    return P.resolve(emailBounces[email] || []);
  };

  Memory.prototype.createEmail = function(uid, data) {
    // Check to see if this email exists
    var emailExistsInAccounts = Object.keys(accounts).some(function(uid) {
      if (accounts[uid].normalizedEmail === data.normalizedEmail) {
        return true;
      }
    });

    if (emailExistsInAccounts || emails[data.normalizedEmail]) {
      return P.reject(error.duplicate());
    }

    // Add new email
    data.isPrimary = false; // New emails can not be set to primary on creation
    data.uid = uid;
    emails[data.normalizedEmail] = data;

    return P.resolve({});
  };

  Memory.prototype.getSecondaryEmail = function(email) {
    const normalizedEmail = email.toLowerCase();

    if (emails[normalizedEmail]) {
      return P.resolve(emails[normalizedEmail]);
    } else {
      return P.reject(error.notFound());
    }
  };

  Memory.prototype.accountRecord = function(email) {
    const normalizedEmail = email.toLowerCase();

    if (!emails[normalizedEmail]) {
      return P.reject(error.notFound());
    }

    const uid = emails[normalizedEmail].uid;
    return P.all([this.accountEmails(uid), getAccountByUid(uid)]).spread(
      (emails, account) => {
        Object.keys(emails).some(key => {
          var emailRecord = emails[key];
          if (
            emailRecord.uid.toString('hex') === uid.toString('hex') &&
            emailRecord.isPrimary
          ) {
            account.primaryEmail = emailRecord.normalizedEmail;
          }
        });

        return account;
      }
    );
  };

  Memory.prototype.accountEmails = function(uid) {
    const userEmails = [];

    Object.keys(emails).forEach(function(key) {
      var emailRecord = emails[key];
      if (emailRecord.uid.toString('hex') === uid.toString('hex')) {
        userEmails.push(emailRecord);
      }
    });

    // Sort emails so that primary email is first
    userEmails.sort((a, b) => {
      return b.isPrimary - a.isPrimary;
    });

    return P.resolve(userEmails);
  };

  Memory.prototype.setPrimaryEmail = function(uid, email) {
    if (!emails[email]) {
      return P.reject(error.notFound());
    }

    Object.keys(emails).forEach(function(key) {
      var emailRecord = emails[key];
      if (
        emailRecord.uid.toString('hex') === uid.toString('hex') &&
        emailRecord.isPrimary
      ) {
        emailRecord.isPrimary = false;
      }
    });

    emails[email].isPrimary = true;

    return getAccountByUid(uid).then(account => {
      account.profileChangedAt = Date.now();
      return P.resolve({});
    });
  };

  Memory.prototype.deleteEmail = function(uid, email) {
    var emailRecord = emails[email];

    if (
      emailRecord &&
      emailRecord.uid.toString('hex') === uid.toString('hex') &&
      emailRecord.isPrimary === false
    ) {
      delete emails[email];
    }

    if (emailRecord && emailRecord.isPrimary === true) {
      return P.reject(error.cannotDeletePrimaryEmail());
    }

    // No email record found, see if email is in accounts table
    if (!emailRecord) {
      var isPrimary = Object.keys(accounts).some(function(key) {
        var account = accounts[key];
        if (account.normalizedEmail === email) {
          return true;
        }
      });

      if (isPrimary) {
        return P.reject(error.cannotDeletePrimaryEmail());
      }
    }

    return getAccountByUid(uid).then(account => {
      account.profileChangedAt = Date.now();
      return P.resolve({});
    });
  };

  Memory.prototype.createSigninCode = (code, uid, createdAt, flowId) => {
    code = code.toString('hex');

    if (signinCodes[code]) {
      return P.reject(error.duplicate());
    }

    signinCodes[code] = { uid, createdAt, flowId };

    return P.resolve({});
  };

  Memory.prototype.consumeSigninCode = code => {
    const newerThan = Date.now() - config.signinCodesMaxAge;
    code = code.toString('hex');

    if (!signinCodes[code] || signinCodes[code].createdAt <= newerThan) {
      return P.reject(error.notFound());
    }

    const email = accounts[signinCodes[code].uid.toString('hex')].email;
    const flowId = signinCodes[code].flowId;
    delete signinCodes[code];

    return P.resolve({ email, flowId });
  };

  Memory.prototype.resetAccountTokens = uid => {
    uid = uid.toString('hex');
    deleteByUid(uid, accountResetTokens);
    deleteByUid(uid, passwordChangeTokens);
    deleteByUid(uid, passwordForgotTokens);
    return P.resolve({});
  };

  Memory.prototype.createTotpToken = (uid, data) => {
    uid = uid.toString('hex');

    const totpToken = totpTokens[uid];

    if (totpToken) {
      return P.reject(error.duplicate());
    }

    totpTokens[uid] = {
      sharedSecret: data.sharedSecret,
      epoch: data.epoch || 0,
      verified: false,
      enabled: true,
    };

    return Promise.resolve({});
  };

  Memory.prototype.updateTotpToken = (uid, token) => {
    uid = uid.toString('hex');

    const totpToken = totpTokens[uid];

    if (!totpToken) {
      return P.reject(error.notFound());
    }

    // Currently, users can only update the verified and enable flags.
    // Updating shared secret and epoch will break clients.
    totpToken.verified = token.verified;
    totpToken.enabled = token.enabled;

    return getAccountByUid(uid).then(account => {
      account.profileChangedAt = Date.now();
      return Promise.resolve({});
    });
  };

  Memory.prototype.totpToken = uid => {
    uid = uid.toString('hex');

    const totpToken = totpTokens[uid];

    if (!totpToken) {
      return P.reject(error.notFound());
    }

    return Promise.resolve(totpToken);
  };

  Memory.prototype.deleteTotpToken = function(uid) {
    uid = uid.toString('hex');

    delete totpTokens[uid];

    return getAccountByUid(uid).then(account => {
      account.profileChangedAt = Date.now();
      return Promise.resolve({});
    });
  };

  Memory.prototype.verifyTokensWithMethod = function(tokenId, data) {
    tokenId = tokenId.toString('hex');
    let session, verificationMethod;

    return Promise.resolve()
      .then(() => {
        verificationMethod = dbUtil.mapVerificationMethodType(
          data.verificationMethod
        );

        if (!verificationMethod) {
          throw error.invalidVerificationMethod();
        }

        return this.sessionToken(tokenId).then(result => {
          session = result;
          // Verify the session token, if unverified
          if (session.tokenVerificationId) {
            return this.verifyTokens(session.tokenVerificationId, {
              uid: session.uid,
            });
          }
        });
      })
      .then(() => {
        // Set the verification method
        sessionTokens[tokenId].verificationMethod = verificationMethod;
        sessionTokens[tokenId].verifiedAt = Date.now();
        return Promise.resolve({});
      });
  };

  Memory.prototype.replaceRecoveryCodes = function(uid, count) {
    uid = uid.toString('hex');
    let codes = [];
    return getAccountByUid(uid)
      .then(() => {
        return dbUtil.generateRecoveryCodes(count, RECOVERY_CODE_LENGTH);
      })
      .then(result => {
        codes = result;
        return codes.map(code => dbUtil.createHashScrypt(code));
      })
      .all()
      .then(hashes => {
        recoveryCodes[uid] = hashes.map(value => {
          return {
            codeHash: value.hash,
            salt: value.salt,
          };
        });
        return codes;
      });
  };

  Memory.prototype.consumeRecoveryCode = function(uid, code) {
    uid = uid.toString('hex');
    return getAccountByUid(uid).then(() => {
      const codes = recoveryCodes[uid];

      if (!codes) {
        throw error.notFound();
      }

      const hashes = codes.map((item, index) => {
        return dbUtil
          .compareHashScrypt(code, item.codeHash, item.salt)
          .then(equals => {
            return { index, equals };
          });
      });

      // Filter to only matching hashes
      return P.filter(hashes, item => item.equals).then(result => {
        if (result.length === 0) {
          throw error.notFound();
        }

        codes.splice(result[0].index, 1);

        return { remaining: codes.length };
      });
    });
  };

  Memory.prototype.createRecoveryKey = function(uid, data) {
    uid = uid.toString('hex');
    return getAccountByUid(uid).then(() => {
      if (recoveryKeys[uid]) {
        return P.reject(error.duplicate());
      }

      recoveryKeys[uid] = {
        uid,
        recoveryKeyIdHash: dbUtil
          .createHash(data.recoveryKeyId)
          .toString('hex'),
        recoveryData: data.recoveryData,
      };

      return {};
    });
  };

  Memory.prototype.getRecoveryKey = function(options) {
    const uid = options.id.toString('hex');
    const recoveryKeyIdHash = dbUtil
      .createHash(options.recoveryKeyId)
      .toString('hex');
    return getAccountByUid(uid).then(() => {
      const recoveryKey = recoveryKeys[uid];

      if (!recoveryKey) {
        return P.reject(error.notFound());
      }

      if (recoveryKey.recoveryKeyIdHash !== recoveryKeyIdHash) {
        return P.reject(error.recoveryKeyInvalid());
      }

      return recoveryKey;
    });
  };

  Memory.prototype.recoveryKeyExists = function(uid) {
    uid = uid.toString('hex');
    let exists = true;
    return getAccountByUid(uid)
      .then(() => {
        const recoveryKey = recoveryKeys[uid];

        if (!recoveryKey) {
          exists = false;
        }

        return { exists };
      })
      .catch(err => {
        // To match the mysql implementation, we return false when the
        // user does not exist.
        if (err.errno === error.notFound().errno) {
          exists = false;
          return { exists };
        }

        throw err;
      });
  };

  Memory.prototype.deleteRecoveryKey = function(options) {
    const uid = options.id.toString('hex');
    return getAccountByUid(uid).then(() => {
      delete recoveryKeys[uid];

      return {};
    });
  };

  Memory.prototype.createAccountSubscription = async function(
    uid,
    subscriptionId,
    productName,
    createdAt
  ) {
    // Ensure user account exists
    uid = uid.toString('hex');
    await getAccountByUid(uid);

    const key = [uid, subscriptionId, productName].join('|');
    if (accountSubscriptions[key]) {
      throw error.duplicate();
    }
    const existingSubs = Object.values(accountSubscriptions).map(
      s => s.subscriptionId
    );
    if (existingSubs.includes(subscriptionId)) {
      throw error.duplicate();
    }
    accountSubscriptions[key] = {
      uid,
      subscriptionId,
      productName,
      createdAt,
      cancelledAt: null,
    };
    return {};
  };

  Memory.prototype.getAccountSubscription = async function(
    uid,
    subscriptionId
  ) {
    // Ensure user account exists
    uid = uid.toString('hex');
    await getAccountByUid(uid);

    const subscription = Object.values(accountSubscriptions).filter(
      s => s.uid === uid && s.subscriptionId === subscriptionId
    )[0];

    if (!subscription) {
      throw error.notFound();
    }

    return subscription;
  };

  Memory.prototype.fetchAccountSubscriptions = async function(uid) {
    // Ensure user account exists
    uid = uid.toString('hex');
    await getAccountByUid(uid);

    return Object.values(accountSubscriptions).filter(s => s.uid === uid);
  };

  Memory.prototype.deleteAccountSubscription = async function(
    uid,
    subscriptionId
  ) {
    // Ensure user account exists
    uid = uid.toString('hex');
    await getAccountByUid(uid);
    const toDelete = Object.entries(accountSubscriptions)
      .filter(
        ([key, s]) => s.uid === uid && s.subscriptionId === subscriptionId
      )
      .map(([key, s]) => key);
    toDelete.forEach(key => delete accountSubscriptions[key]);
    return {};
  };

  Memory.prototype.cancelAccountSubscription = async function(
    uid,
    subscriptionId,
    cancelledAt
  ) {
    uid = uid.toString('hex');

    // Ensure user account exists
    await getAccountByUid(uid);

    const cancelled = Object.values(accountSubscriptions).some(subscription => {
      if (
        subscription.uid === uid &&
        subscription.subscriptionId === subscriptionId &&
        !subscription.cancelledAt
      ) {
        subscription.cancelledAt = cancelledAt;
        return true;
      }

      return false;
    });

    if (!cancelled) {
      throw error.notFound();
    }

    return {};
  };

  Memory.prototype.reactivateAccountSubscription = async function(
    uid,
    subscriptionId,
  ) {
    uid = uid.toString('hex');

    // Ensure user account exists
    await getAccountByUid(uid);

    const reactivated = Object.values(accountSubscriptions).some(subscription => {
      if (
        subscription.uid === uid &&
        subscription.subscriptionId === subscriptionId &&
        subscription.cancelledAt > 0
      ) {
        subscription.cancelledAt = null;
        return true;
      }

      return false;
    });

    if (!reactivated) {
      throw error.notFound();
    }

    return {};
  };

  // UTILITY FUNCTIONS

  Memory.prototype.ping = function() {
    return P.resolve({});
  };

  Memory.prototype.close = function() {
    return P.resolve({});
  };

  Memory.connect = function(options) {
    return P.resolve(new Memory());
  };

  return Memory;
};
