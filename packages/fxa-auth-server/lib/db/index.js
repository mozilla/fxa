/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const crypto = require('crypto');
const error = require('../error');
const random = require('../crypto/random');
const { StatsD } = require('hot-shots');
const { normalizeEmail } = require('fxa-shared').email.helpers;
const { Container } = require('typedi');
const {
  mergeDevicesAndSessionTokens,
  mergeDeviceAndSessionToken,
  mergeCachedSessionTokens,
  filterExpiredTokens,
} = require('fxa-shared/connected-services');
const { setupAuthDatabase } = require('fxa-shared/db');
const {
  Account,
  AccountResetToken: RawAccountResetToken,
  BaseToken,
  Device,
  Email,
  EmailBounce,
  KeyFetchToken: RawKeyFetchToken,
  PasswordChangeToken: RawPasswordChangeToken,
  PasswordForgotToken: RawPasswordForgotToken,
  LinkedAccount,
  SessionToken: RawSessionToken,
  RecoveryKey,
  TotpToken,
  SecurityEvent,
} = require('fxa-shared/db/models/auth');
const { base32 } = require('../crypto/random');

function resolveMetrics() {
  if (Container.has(StatsD)) {
    return Container.get(StatsD);
  }
}

module.exports = (config, log, Token, UnblockCode = null) => {
  const scrypt = require('../crypto/scrypt')(log, config);
  const features = require('../features')(config);
  const {
    SessionToken,
    KeyFetchToken,
    AccountResetToken,
    PasswordForgotToken,
    PasswordChangeToken,
  } = Token;
  const MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE =
    config.tokenLifetimes.sessionTokenWithoutDevice;
  const { enabled: TOKEN_PRUNING_ENABLED, maxAge: TOKEN_PRUNING_MAX_AGE } =
    config.tokenPruning;

  function DB(options) {
    this.redis =
      options.redis ||
      require('../redis')(
        { ...config.redis, ...config.redis.sessionTokens },
        log
      );
  }

  DB.connect = async function (config, redis) {
    // Establish database connection and bind instance to Model using Knex
    const knex = setupAuthDatabase(
      config.database?.mysql?.auth,
      log,
      resolveMetrics()
    );
    if (['debug', 'verbose', 'trace'].includes(config.log?.level)) {
      knex.on('query', (data) => {
        console.dir(data);
      });
    }
    return new DB({ redis });
  };

  DB.prototype.close = async function () {
    if (this.redis) {
      await this.redis.close();
    }
  };

  DB.prototype.ping = async function () {
    await Account.query().limit(1);
    return true;
  };

  // CREATE

  DB.prototype.createAccount = async function (data) {
    const { uid, email } = data;
    log.trace('DB.createAccount', { uid, email });
    data.verifierSetAt = data.verifierSetAt ?? Date.now(); // allow 0 to indicate no-password-set
    data.createdAt = Date.now();
    data.normalizedEmail = normalizeEmail(data.email);
    data.primaryEmail = {
      email,
      emailCode: data.emailCode,
      normalizeEmail: data.normalizedEmail,
      isVerified: data.emailVerified,
    };
    try {
      await Account.create(data);
      return data;
    } catch (err) {
      if (isRecordAlreadyExistsError(err)) {
        throw error.accountExists(data.email);
      }
      throw err;
    }
  };

  DB.prototype.createSessionToken = async function (authToken) {
    const { uid } = authToken;

    log.trace('DB.createSessionToken', { uid });

    const sessionToken = await SessionToken.create(authToken);

    const { id } = sessionToken;

    // Ensure there are no clashes with zombie tokens left behind in Redis
    try {
      await this.deleteSessionTokenFromRedis(uid, id);
    } catch (unusedErr) {
      // Ignore errors deleting the token.
    }
    await RawSessionToken.create(sessionToken);

    return sessionToken;
  };

  DB.prototype.createKeyFetchToken = async function (authToken) {
    log.trace('DB.createKeyFetchToken', { uid: authToken && authToken.uid });
    const keyFetchToken = await KeyFetchToken.create(authToken);
    await RawKeyFetchToken.create(keyFetchToken);
    return keyFetchToken;
  };

  DB.prototype.createPasswordForgotToken = async function (emailRecord) {
    log.trace('DB.createPasswordForgotToken', {
      uid: emailRecord && emailRecord.uid,
    });
    const passwordForgotToken = await PasswordForgotToken.create(emailRecord);
    await RawPasswordForgotToken.create(passwordForgotToken);
    return passwordForgotToken;
  };

  DB.prototype.createPasswordChangeToken = async function (data) {
    log.trace('DB.createPasswordChangeToken', { uid: data.uid });
    const passwordChangeToken = await PasswordChangeToken.create(data);
    await RawPasswordChangeToken.create(passwordChangeToken);
    return passwordChangeToken;
  };

  // READ

  DB.prototype.checkPassword = async function (uid, verifyHash) {
    log.trace('DB.checkPassword', { uid, verifyHash });
    const result = await Account.checkPassword(uid, verifyHash);

    if (result.v1) {
      resolveMetrics()?.increment('check.password.v1.success');
    }
    if (result.v2) {
      resolveMetrics()?.increment('check.password.v2.success');
    }

    return result;
  };

  DB.prototype.accountExists = async function (email) {
    log.trace('DB.accountExists', { email: email });
    // TODO this could be optimized with a new query
    const account = await Account.findByPrimaryEmail(email);
    return !!account;
  };

  DB.prototype.sessions = async function (uid) {
    log.trace('DB.sessions', { uid });
    const getMysqlSessionTokens = async () => {
      const { sessionTokens, expiredSessionTokens } = filterExpiredTokens(
        await RawSessionToken.findByUid(uid),
        MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE
      );

      if (expiredSessionTokens.length === 0) {
        return sessionTokens;
      }

      // Prune session tokens
      try {
        await this.pruneSessionTokens(uid, expiredSessionTokens);
      } catch (unusedErr) {
        // Ignore errors
      }
      return sessionTokens;
    };
    const promises = [getMysqlSessionTokens()];

    if (this.redis) {
      promises.push(this.redis.getSessionTokens(uid));
    }

    const [mysqlSessionTokens, redisSessionTokens = {}] = await Promise.all(
      promises
    );

    // for each db session token, if there is a matching redis token
    // overwrite the properties of the db token with the redis token values
    const lastAccessTimeEnabled = features.isLastAccessTimeEnabledForUser(uid);

    const sessions = mergeCachedSessionTokens(
      mysqlSessionTokens,
      redisSessionTokens,
      lastAccessTimeEnabled
    );
    log.debug('db.sessions.count', {
      lastAccessTimeEnabled,
      mysql: mysqlSessionTokens.length,
      redis: redisSessionTokens.length,
    });
    return sessions;
  };

  DB.prototype.keyFetchToken = async function (id) {
    log.trace('DB.keyFetchToken', { id });
    const data = await RawKeyFetchToken.findByTokenId(id);
    if (!data) {
      throw error.invalidToken('The authentication token could not be found');
    }
    return KeyFetchToken.fromId(id, data);
  };

  DB.prototype.keyFetchTokenWithVerificationStatus = async function (id) {
    log.trace('DB.keyFetchTokenWithVerificationStatus', { id });
    const data = await RawKeyFetchToken.findByTokenId(id, true);
    if (!data) {
      throw error.invalidToken('The authentication token could not be found');
    }
    return KeyFetchToken.fromId(id, data);
  };

  DB.prototype.accountResetToken = async function (id) {
    log.trace('DB.accountResetToken', { id });
    const data = await RawAccountResetToken.findByTokenId(id);
    if (!data) {
      throw error.invalidToken('The authentication token could not be found');
    }
    return AccountResetToken.fromHex(data.tokenData, data);
  };

  DB.prototype.passwordForgotToken = async function (id) {
    log.trace('DB.passwordForgotToken', { id });
    const data = await RawPasswordForgotToken.findByTokenId(id);
    if (!data) {
      throw error.invalidToken('The authentication token could not be found');
    }
    return PasswordForgotToken.fromHex(data.tokenData, data);
  };

  DB.prototype.passwordChangeToken = async function (id) {
    log.trace('DB.passwordChangeToken', { id });
    const data = await RawPasswordChangeToken.findByTokenId(id);
    if (!data) {
      throw error.invalidToken('The authentication token could not be found');
    }
    return PasswordChangeToken.fromHex(data.tokenData, data);
  };

  DB.prototype.accountRecord = async function (email, options) {
    log.trace('DB.accountRecord', { email });
    const account = await Account.findByPrimaryEmail(email, options);
    if (!account) {
      throw error.unknownAccount(email);
    }
    return account;
  };
  // Legacy alias
  // TODO delete me
  DB.prototype.emailRecord = DB.prototype.accountRecord;

  DB.prototype.account = async function (uid) {
    log.trace('DB.account', { uid });
    const account = await Account.findByUid(uid, { include: ['emails'] });
    if (!account) {
      throw error.unknownAccount();
    }
    return account;
  };

  DB.prototype.listAllUnverifiedAccounts = async function () {
    log.trace('DB.listAllUnverifiedAccounts');
    return await Account.listAllUnverified({ include: ['emails'] });
  };

  DB.prototype.getEmailUnverifiedAccounts = async function (options) {
    log.trace('DB.getEmailUnverifiedAccounts');
    return await Account.getEmailUnverifiedAccounts(options);
  };

  DB.prototype.devices = async function (uid) {
    log.trace('DB.devices', { uid });

    if (!uid) {
      throw error.unknownAccount();
    }

    const promises = [Device.findByUid(uid)];

    if (this.redis) {
      promises.push(this.redis.getSessionTokens(uid));
    }

    try {
      const [devices, redisSessionTokens = {}] = await Promise.all(promises);
      const lastAccessTimeEnabled =
        features.isLastAccessTimeEnabledForUser(uid);
      return mergeDevicesAndSessionTokens(
        devices,
        redisSessionTokens,
        lastAccessTimeEnabled
      );
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.unknownAccount();
      }
      throw err;
    }
  };

  DB.prototype.sessionToken = async function (id) {
    log.trace('DB.sessionToken', { id });
    const data = await RawSessionToken.findByTokenId(id);
    if (!data) {
      throw error.invalidToken('The authentication token could not be found');
    }
    return SessionToken.fromHex(data.tokenData, data);
  };

  DB.prototype.accountEmails = async function (uid) {
    log.trace('DB.accountEmails', { uid });
    return Email.findByUid(uid);
  };

  DB.prototype.device = async function (uid, deviceId) {
    log.trace('DB.device', { uid: uid, id: deviceId });

    const promises = [Device.findByPrimaryKey(uid, deviceId)];

    if (this.redis) {
      promises.push(this.redis.getSessionTokens(uid));
    }
    const [device, redisSessionTokens = {}] = await Promise.all(promises);
    if (!device) {
      throw error.unknownDevice();
    }
    const lastAccessTimeEnabled = features.isLastAccessTimeEnabledForUser(uid);
    const token = redisSessionTokens[device.sessionTokenId];
    return mergeDeviceAndSessionToken(device, token, lastAccessTimeEnabled);
  };

  DB.prototype.getSecondaryEmail = async function (email) {
    log.trace('DB.getSecondaryEmail', { email });
    const emailRecord = await Email.findByEmail(email);
    if (!emailRecord) {
      throw error.unknownSecondaryEmail();
    }
    return emailRecord;
  };

  DB.prototype.getLinkedAccounts = async function (uid) {
    log.trace('DB.getLinkedAccounts', { uid });
    return LinkedAccount.findByUid(uid);
  };

  DB.prototype.createLinkedAccount = async function (uid, id, provider) {
    log.trace('DB.createLinkedAccount', { uid, id, provider });
    return LinkedAccount.createLinkedAccount(uid, id, provider);
  };

  DB.prototype.deleteLinkedAccount = async function (uid, provider) {
    log.trace('DB.deleteLinkedAccount', { uid, provider });
    return LinkedAccount.deleteLinkedAccount(uid, provider);
  };

  DB.prototype.getLinkedAccount = async function (id, provider) {
    log.trace('DB.getLinkedAccount', { id, provider });
    return LinkedAccount.findByLinkedAccount(id, provider);
  };

  DB.prototype.totpToken = async function (uid) {
    log.trace('DB.totpToken', { uid });
    const totp = await TotpToken.findByUid(uid);
    if (!totp) {
      throw error.totpTokenNotFound();
    }
    return totp;
  };

  DB.prototype.getRecoveryKey = async function (uid, recoveryKeyId) {
    log.trace('DB.getRecoveryKey', { uid });
    const data = await RecoveryKey.findByUid(uid);
    if (!data) {
      throw error.recoveryKeyNotFound();
    }
    const idHash = crypto
      .createHash('sha256')
      .update(Buffer.from(recoveryKeyId, 'hex'))
      .digest();
    if (
      !crypto.timingSafeEqual(
        idHash,
        Buffer.from(data.recoveryKeyIdHash, 'hex')
      )
    ) {
      throw error.recoveryKeyInvalid();
    }
    return data;
  };

  DB.prototype.recoveryKeyExists = async function (uid) {
    log.trace('DB.recoveryKeyExists', { uid });
    return {
      exists: await RecoveryKey.exists(uid),
    };
  };

  DB.prototype.emailBounces = async function (email) {
    log.trace('DB.emailBounces', { email });
    return EmailBounce.findByEmail(email);
  };

  DB.prototype.deviceFromTokenVerificationId = async function (
    uid,
    tokenVerificationId
  ) {
    log.trace('DB.deviceFromTokenVerificationId', { uid, tokenVerificationId });
    const device = await Device.findByUidAndTokenVerificationId(
      uid,
      tokenVerificationId
    );
    if (!device) {
      throw error.unknownDevice();
    }
    return device;
  };

  // UPDATE

  DB.prototype.setPrimaryEmail = async function (uid, email) {
    log.trace('DB.setPrimaryEmail', { email });
    try {
      return await Account.setPrimaryEmail(uid, email);
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.unknownAccount(email);
      }
      throw err;
    }
  };

  DB.prototype.updatePasswordForgotToken = async function (token) {
    log.trace('DB.udatePasswordForgotToken', { uid: token && token.uid });
    const { id } = token;
    return RawPasswordForgotToken.update(id, token.tries);
  };

  /**
   * Update cached session-token data, such as timestamps
   * and device info.  This is a comparatively cheap call that
   * only writes to redis, not the underlying DB, and hence
   * can be safely used in frequently-called routes.
   *
   * To do a more expensive write that flushes to the underlying
   * DB, use updateSessionToken instead.
   */
  DB.prototype.touchSessionToken = async function (
    token,
    geo,
    onlyUpdateLastAccessTime = false
  ) {
    const { id, uid } = token;

    log.trace('DB.touchSessionToken', { id, uid });

    if (!this.redis || !features.isLastAccessTimeEnabledForUser(uid)) {
      return;
    }

    let t;
    if (onlyUpdateLastAccessTime) {
      t = {
        lastAccessTime: token.lastAccessTime,
        id,
      };
    } else {
      let location;
      if (geo && geo.location) {
        location = {
          city: geo.location.city,
          country: geo.location.country,
          countryCode: geo.location.countryCode,
          state: geo.location.state,
          stateCode: geo.location.stateCode,
        };
      }

      t = {
        lastAccessTime: token.lastAccessTime,
        location,
        uaBrowser: token.uaBrowser,
        uaBrowserVersion: token.uaBrowserVersion,
        uaDeviceType: token.uaDeviceType,
        uaFormFactor: token.uaFormFactor,
        uaOS: token.uaOS,
        uaOSVersion: token.uaOSVersion,
        id,
      };
    }

    return this.redis.touchSessionToken(uid, t);
  };

  /**
   * Persist updated session-token data to the database.
   * This is a comparatively expensive call that writes through
   * to the underlying DB and hence should not be used in
   * frequently-called routes.
   *
   * To do a cheaper write of transient metadata that only hits
   * redis, use touchSessionToken instead.
   */
  DB.prototype.updateSessionToken = async function (sessionToken, geo) {
    const { id, uid, lastAccessTime, lastAccessTimeEnabled } = sessionToken;

    // Just for connection pool issue investigation. Make sure the last access time is set to something realistic.
    log.debug('DB.updateSessionToken', {
      id,
      uid,
      lastAccessTime,
      lastAccessTimeEnabled,
    });

    await this.touchSessionToken(sessionToken, geo);
    await RawSessionToken.update({ id, ...sessionToken });
  };

  DB.prototype.pruneSessionTokens = async function (uid, sessionTokens) {
    log.debug('DB.pruneSessionTokens', {
      uid,
      tokenCount: sessionTokens.length,
    });

    if (
      !this.redis ||
      !TOKEN_PRUNING_ENABLED ||
      !features.isLastAccessTimeEnabledForUser(uid)
    ) {
      return;
    }

    const tokenIds = sessionTokens
      .filter((token) => token.createdAt <= Date.now() - TOKEN_PRUNING_MAX_AGE)
      .map((token) => token.id);

    if (tokenIds.length === 0) {
      return;
    }

    return this.redis.pruneSessionTokens(uid, tokenIds);
  };

  DB.prototype.createDevice = async function (uid, deviceInfo) {
    log.trace('DB.createDevice', { uid: uid, id: deviceInfo.id });
    const sessionTokenId = deviceInfo.sessionTokenId;
    const refreshTokenId = deviceInfo.refreshTokenId;

    const id = await random.hex(16);
    deviceInfo.id = id;
    deviceInfo.createdAt = Date.now();

    try {
      await Device.create({
        ...deviceInfo,
        sessionTokenId,
        refreshTokenId,
        uid,
      });
    } catch (err) {
      if (isRecordAlreadyExistsError(err)) {
        const devices = await this.devices(uid);
        // It's possible (but extraordinarily improbable) that we generated
        // a duplicate device id, so check the devices for this account. If
        // we find a duplicate, retry with a new id. If we don't find one,
        // the problem was caused by the unique sessionToken or
        // refreshToken constraint so return an appropriate error.
        let conflictingDeviceId;

        const isDuplicateDeviceId = devices.reduce((is, device) => {
          if (is || device.id === deviceInfo.id) {
            return true;
          }

          if (
            (sessionTokenId && device.sessionTokenId === sessionTokenId) ||
            (deviceInfo.refreshTokenId &&
              device.refreshTokenId === deviceInfo.refreshTokenId)
          ) {
            conflictingDeviceId = device.id;
          }
        }, false);

        if (isDuplicateDeviceId) {
          return this.createDevice(uid, deviceInfo);
        }

        throw error.deviceSessionConflict(conflictingDeviceId);
      }
      throw err;
    }
    deviceInfo.pushEndpointExpired = false;
    return deviceInfo;
  };

  DB.prototype.updateDevice = async function (uid, deviceInfo) {
    const sessionTokenId = deviceInfo.sessionTokenId;
    try {
      await Device.update({
        uid,
        callbackIsExpired: deviceInfo.pushEndpointExpired,
        ...deviceInfo,
      });
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.unknownDevice();
      }
      if (isRecordAlreadyExistsError(err)) {
        // Identify the conflicting device in the error response,
        // to save a server round-trip for the client.
        const devices = await this.devices(uid);
        let conflictingDeviceId;
        devices.some((device) => {
          if (device.sessionTokenId === sessionTokenId) {
            conflictingDeviceId = device.id;
            return true;
          }
        });
        throw error.deviceSessionConflict(conflictingDeviceId);
      }
      throw err;
    }
    return deviceInfo;
  };

  // DELETE

  DB.prototype.deleteAccount = async function (authToken) {
    const { uid } = authToken;

    log.trace('DB.deleteAccount', { uid });
    if (this.redis) {
      await this.redis.del(uid);
    }
    return Account.delete(uid);
  };

  DB.prototype.deleteSessionToken = async function (sessionToken) {
    const { id, uid } = sessionToken;

    log.trace('DB.deleteSessionToken', { id, uid });

    await this.deleteSessionTokenFromRedis(uid, id);
    return RawSessionToken.delete(id);
  };

  DB.prototype.deleteKeyFetchToken = async function (keyFetchToken) {
    const { id, uid } = keyFetchToken;
    log.trace('DB.deleteKeyFetchToken', { id, uid });
    return RawKeyFetchToken.delete(id);
  };

  DB.prototype.deleteAccountResetToken = async function (accountResetToken) {
    const { id, uid } = accountResetToken;
    log.trace('DB.deleteAccountResetToken', { id, uid });
    return RawAccountResetToken.delete(id);
  };

  DB.prototype.deletePasswordForgotToken = async function (
    passwordForgotToken
  ) {
    const { id, uid } = passwordForgotToken;
    log.trace('DB.deletePasswordForgotToken', { id, uid });
    return RawPasswordForgotToken.delete(id);
  };

  DB.prototype.deletePasswordChangeToken = async function (
    passwordChangeToken
  ) {
    const { id, uid } = passwordChangeToken;
    log.trace('DB.deletePasswordChangeToken', { id, uid });
    return RawPasswordChangeToken.delete(id);
  };

  DB.prototype.deleteDevice = async function (uid, deviceId) {
    log.trace('DB.deleteDevice', { uid, id: deviceId });

    try {
      const result = await Device.delete(uid, deviceId);
      await this.deleteSessionTokenFromRedis(uid, result.sessionTokenId);
      return result;
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.unknownDevice();
      }
      throw err;
    }
  };

  // BATCH

  DB.prototype.resetAccount = async function (
    accountResetToken,
    data,
    keepSessions
  ) {
    const { uid } = accountResetToken;

    log.trace('DB.resetAccount', { uid });
    if (this.redis && keepSessions !== true) {
      await this.redis.del(uid);
    }
    data.verifierSetAt = Date.now();

    if (data.verifyHashVersion2 != null) {
      resolveMetrics()?.increment('reset.account.v2');
    } else {
      resolveMetrics()?.increment('reset.account.v1');
    }

    return Account.reset({ uid, ...data });
  };

  DB.prototype.verifyEmail = async function (account, emailCode) {
    const { uid } = account;
    log.trace('DB.verifyEmail', { uid, emailCode });
    await Account.verifyEmail(uid, emailCode);
  };

  DB.prototype.verifyTokens = async function (
    tokenVerificationId,
    accountData
  ) {
    log.trace('DB.verifyTokens', { tokenVerificationId });
    try {
      await BaseToken.verifyToken(accountData.uid, tokenVerificationId);
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.invalidVerificationCode();
      }
      throw err;
    }
  };

  DB.prototype.verifyTokensWithMethod = async function (
    tokenId,
    verificationMethod
  ) {
    log.trace('DB.verifyTokensWithMethod', { tokenId, verificationMethod });
    await RawSessionToken.verify(tokenId, verificationMethod);
  };

  DB.prototype.forgotPasswordVerified = async function (passwordForgotToken) {
    const { id, uid } = passwordForgotToken;
    log.trace('DB.forgotPasswordVerified', { uid });
    const accountResetToken = await AccountResetToken.create({ uid });
    await RawPasswordForgotToken.verify(id, accountResetToken);
    return accountResetToken;
  };

  DB.prototype.createPassword = async function (
    uid,
    authSalt,
    clientSalt,
    verifyHash,
    verifyHashVersion2,
    wrapWrapKb,
    wrapWrapKbVersion2,
    verifierVersion
  ) {
    log.trace('DB.createPassword', { uid });
    if (clientSalt && verifyHashVersion2 && wrapWrapKbVersion2) {
      resolveMetrics()?.increment('create.password.v2');
    }
    return Account.createPassword(
      uid,
      authSalt,
      clientSalt,
      verifyHash,
      verifyHashVersion2,
      wrapWrapKb,
      wrapWrapKbVersion2,
      verifierVersion
    );
  };

  DB.prototype.updateLocale = async function (uid, locale) {
    log.trace('DB.updateLocale', { uid, locale });
    return Account.updateLocale(uid, locale);
  };

  DB.prototype.securityEvent = async function (event) {
    log.trace('DB.securityEvent', {
      securityEvent: event,
    });
    await SecurityEvent.create({
      ...event,
      ipHmacKey: config.securityHistory.ipHmacKey,
    });
  };

  DB.prototype.securityEvents = async function (params) {
    log.trace('DB.securityEvents', {
      params: params,
    });
    const { uid, ipAddr } = params;
    return SecurityEvent.findByUidAndIP(
      uid,
      ipAddr,
      config.securityHistory.ipHmacKey
    );
  };

  DB.prototype.securityEventsByUid = async function (params) {
    log.trace('DB.securityEventsByUid', {
      params: params,
    });
    const { uid } = params;
    return SecurityEvent.findByUid(uid);
  };

  DB.prototype.deleteSecurityEvents = async function (params) {
    log.trace('DB.deleteSecurityEvents', {
      params: params,
    });
    const { uid } = params;
    await SecurityEvent.delete(uid);
  };

  DB.prototype.createUnblockCode = async function (uid) {
    if (!UnblockCode) {
      return Promise.reject(new Error('Unblock has not been configured'));
    }
    log.trace('DB.createUnblockCode', { uid });
    const code = await UnblockCode();
    try {
      await Account.createUnblockCode(uid, code);
      return code;
    } catch (err) {
      // duplicates should be super rare, but it's feasible that a
      // uid already has an existing unblockCode. Just try again.
      if (isRecordAlreadyExistsError(err)) {
        log.error('DB.createUnblockCode.duplicate', {
          err: err,
          uid: uid,
        });
        return this.createUnblockCode(uid);
      }
      throw err;
    }
  };

  DB.prototype.consumeUnblockCode = async function (uid, code) {
    log.trace('DB.consumeUnblockCode', { uid });
    try {
      return await Account.consumeUnblockCode(uid, code);
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.invalidUnblockCode();
      }
      throw err;
    }
  };

  DB.prototype.createEmailBounce = async function (bounceData) {
    log.trace('DB.createEmailBounce', {
      bounceData: bounceData,
    });
    await EmailBounce.create(bounceData);
  };

  DB.prototype.createEmail = async function (uid, emailData) {
    log.trace('DB.createEmail', {
      email: emailData.email,
      uid,
    });

    try {
      await Account.createEmail({ uid, ...emailData });
    } catch (err) {
      if (isEmailAlreadyExistsError(err)) {
        throw error.emailExists();
      }
      throw err;
    }
  };

  DB.prototype.deleteEmail = async function (uid, email) {
    log.trace('DB.deleteEmail', { uid });

    try {
      return await Account.deleteEmail(uid, email);
    } catch (err) {
      if (isEmailDeletePrimaryError(err)) {
        throw error.cannotDeletePrimaryEmail();
      }
      throw err;
    }
  };

  DB.prototype.createSigninCode = async function (uid, flowId) {
    log.trace('DB.createSigninCode');

    const code = await random.hex(config.signinCodeSize);
    try {
      await Account.createSigninCode(uid, code, flowId);
    } catch (err) {
      if (isRecordAlreadyExistsError(err)) {
        log.warn('DB.createSigninCode.duplicate');
        return this.createSigninCode(uid);
      }
      throw err;
    }
    return code;
  };

  DB.prototype.consumeSigninCode = async function (code) {
    log.trace('DB.consumeSigninCode', { code });
    try {
      return await Account.consumeSigninCode(code);
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.invalidSigninCode();
      }

      throw err;
    }
  };

  DB.prototype.resetAccountTokens = async function (uid) {
    log.trace('DB.resetAccountTokens', { uid });

    await Account.resetTokens(uid);
  };

  DB.prototype.createTotpToken = async function (uid, sharedSecret, epoch) {
    log.trace('DB.createTotpToken', { uid });

    try {
      await TotpToken.create({
        uid,
        sharedSecret,
        epoch,
      });
    } catch (err) {
      if (isRecordAlreadyExistsError(err)) {
        throw error.totpTokenAlreadyExists();
      }
      throw err;
    }
  };

  DB.prototype.deleteTotpToken = async function (uid) {
    log.trace('DB.deleteTotpToken', { uid });

    try {
      return await TotpToken.delete(uid);
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.totpTokenNotFound();
      }
      throw err;
    }
  };

  DB.prototype.updateTotpToken = async function (uid, data) {
    log.trace('DB.updateTotpToken', { uid, data });

    try {
      await TotpToken.update(uid, data.verified, data.enabled);
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.totpTokenNotFound();
      }
      throw err;
    }
  };

  DB.prototype.replaceRecoveryCodes = async function (uid, count) {
    log.trace('DB.replaceRecoveryCodes', { uid });
    const codes = await this.createRecoveryCodes(uid, count);
    await this.updateRecoveryCodes(uid, codes);
    return codes;
  };

  DB.prototype.createRecoveryCodes = async function (uid, count) {
    log.trace('DB.createRecoveryCodes', { uid });
    const getCode = base32(config.totp.recoveryCodes.length);
    const codes = await Promise.all(
      Array.from({ length: count }, async () => {
        return (await getCode()).toLowerCase();
      })
    );
    return codes;
  };

  DB.prototype.updateRecoveryCodes = async function (uid, codes) {
    log.trace('DB.updateRecoveryCodes', { uid, codes });

    // Convert codes into hashes
    const hashes = await Promise.all(
      codes.map(async (code) => {
        // eslint-disable-next-line fxa/async-crypto-random
        const salt = crypto.randomBytes(32);
        const hash = Buffer.from(
          await scrypt.hash(Buffer.from(code), salt, 65536, 8, 1, 32),
          'hex'
        );
        return {
          salt,
          hash,
        };
      })
    );
    await Account.replaceRecoveryCodes(uid, hashes);
  };

  DB.prototype.consumeRecoveryCode = async function (uid, code) {
    log.trace('DB.consumeRecoveryCode', { uid });
    const codeBuffer = Buffer.from(code.toLowerCase());
    const codeChecker = async (hash, salt) => {
      return crypto.timingSafeEqual(
        hash,
        Buffer.from(await scrypt.hash(codeBuffer, salt, 65536, 8, 1, 32), 'hex')
      );
    };
    try {
      const remaining = await Account.consumeRecoveryCode(uid, codeChecker);
      return { remaining };
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.recoveryCodeNotFound();
      }
      throw err;
    }
  };

  DB.prototype.createRecoveryKey = async function (
    uid,
    recoveryKeyId,
    recoveryData,
    enabled
  ) {
    log.trace('DB.createRecoveryKey', { uid });

    try {
      await RecoveryKey.create({ uid, recoveryKeyId, recoveryData, enabled });
    } catch (err) {
      if (isRecordAlreadyExistsError(err)) {
        throw error.recoveryKeyExists();
      }
      throw err;
    }
  };

  DB.prototype.deleteRecoveryKey = async function (uid) {
    log.trace('DB.deleteRecoveryKey', { uid });

    return RecoveryKey.delete(uid);
  };

  DB.prototype.updateRecoveryKey = async function (
    uid,
    recoveryKeyId,
    enabled
  ) {
    log.trace('DB.updateRecoveryKey', { uid });

    return RecoveryKey.update({ uid, recoveryKeyId, enabled });
  };

  DB.prototype.getRecoveryKeyHint = async function (uid) {
    log.trace('DB.getRecoveryKeyHint', { uid });
    const data = await RecoveryKey.findByUid(uid);
    if (!data) {
      throw error.recoveryKeyNotFound();
    }
    return { hint: await RecoveryKey.findHintByUid(uid) };
  };

  DB.prototype.updateRecoveryKeyHint = async function (uid, hint) {
    log.trace('DB.updateRecoveryKeyHint', { uid, hint });

    return RecoveryKey.updateRecoveryKeyHint(uid, hint);
  };

  DB.prototype.deleteSessionTokenFromRedis = async function (uid, id) {
    if (!this.redis) {
      return;
    }

    return this.redis.pruneSessionTokens(uid, [id]);
  };

  return DB;
};

// Note that these errno's were defined in the fxa-auth-db-mysql repo
// and don't necessarily match the errnos in this repo...

function isRecordAlreadyExistsError(err) {
  return err.statusCode === 409 && err.errno === 101;
}

function isNotFoundError(err) {
  return err.statusCode === 404 && err.errno === 116;
}

function isEmailAlreadyExistsError(err) {
  return err.statusCode === 409 && err.errno === 101;
}

function isEmailDeletePrimaryError(err) {
  return err.statusCode === 400 && err.errno === 136;
}
