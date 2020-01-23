/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('./error');
const Pool = require('./pool');
const random = require('./crypto/random');

module.exports = (config, log, Token, UnblockCode = null) => {
  const features = require('./features')(config);
  const SafeUrl = require('./safe-url')(log);
  const {
    SessionToken,
    KeyFetchToken,
    AccountResetToken,
    PasswordForgotToken,
    PasswordChangeToken,
  } = Token;
  const MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE =
    config.tokenLifetimes.sessionTokenWithoutDevice;
  const {
    enabled: TOKEN_PRUNING_ENABLED,
    maxAge: TOKEN_PRUNING_MAX_AGE,
  } = config.tokenPruning;

  const SAFE_URLS = {};

  async function setAccountEmails(account) {
    account.emails = await this.accountEmails(account.uid);

    // Set primary email on account object
    account.emails.forEach(item => {
      item.isVerified = !!item.isVerified;
      item.isPrimary = !!item.isPrimary;

      if (item.isPrimary) {
        account.primaryEmail = item;
      }
    });

    return account;
  }

  function DB(options) {
    let pooleeOptions = {};
    if (config && config.db && config.db.poolee) {
      pooleeOptions = config.db.poolee;
    }

    this.pool = new Pool(options.url, pooleeOptions);
    this.redis =
      options.redis ||
      require('./redis')(
        { ...config.redis, ...config.redis.sessionTokens },
        log
      );
  }

  DB.connect = async function(options) {
    return new DB(options);
  };

  DB.prototype.close = async function() {
    const promises = [this.pool.close()];
    if (this.redis) {
      promises.push(this.redis.close());
    }
    return Promise.all(promises);
  };

  SAFE_URLS.ping = new SafeUrl('/__heartbeat__', 'db.ping');
  DB.prototype.ping = async function() {
    return this.pool.get(SAFE_URLS.ping);
  };

  // CREATE

  SAFE_URLS.createAccount = new SafeUrl('/account/:uid', 'db.createAccount');
  DB.prototype.createAccount = async function(data) {
    const { uid, email } = data;
    log.trace('DB.createAccount', { uid, email });
    data.createdAt = data.verifierSetAt = Date.now();
    data.normalizedEmail = data.email.toLowerCase();
    try {
      await this.pool.put(SAFE_URLS.createAccount, { uid }, data);
      return data;
    } catch (err) {
      if (isRecordAlreadyExistsError(err)) {
        throw error.accountExists(data.email);
      }
      throw err;
    }
  };

  SAFE_URLS.createSessionToken = new SafeUrl(
    '/sessionToken/:id',
    'db.createSessionToken'
  );
  DB.prototype.createSessionToken = async function(authToken) {
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

    await this.pool.put(
      SAFE_URLS.createSessionToken,
      { id },
      Object.assign(
        {
          // Marshall from this repo's id property to the db's tokenId
          tokenId: id,
        },
        sessionToken
      )
    );
    return sessionToken;
  };

  SAFE_URLS.createKeyFetchToken = new SafeUrl(
    '/keyFetchToken/:id',
    'db.createKeyFetchToken'
  );
  DB.prototype.createKeyFetchToken = async function(authToken) {
    log.trace('DB.createKeyFetchToken', { uid: authToken && authToken.uid });
    const keyFetchToken = await KeyFetchToken.create(authToken);
    const { id } = keyFetchToken;
    await this.pool.put(
      SAFE_URLS.createKeyFetchToken,
      { id },
      {
        tokenId: keyFetchToken.id,
        authKey: keyFetchToken.authKey,
        uid: keyFetchToken.uid,
        keyBundle: keyFetchToken.keyBundle,
        createdAt: keyFetchToken.createdAt,
        tokenVerificationId: keyFetchToken.tokenVerificationId,
      }
    );
    return keyFetchToken;
  };

  SAFE_URLS.createPasswordForgotToken = new SafeUrl(
    '/passwordForgotToken/:id',
    'db.createPasswordForgotToken'
  );
  DB.prototype.createPasswordForgotToken = async function(emailRecord) {
    log.trace('DB.createPasswordForgotToken', {
      uid: emailRecord && emailRecord.uid,
    });
    const passwordForgotToken = await PasswordForgotToken.create(emailRecord);
    const { id } = passwordForgotToken;
    await this.pool.put(
      SAFE_URLS.createPasswordForgotToken,
      { id },
      {
        tokenId: passwordForgotToken.id,
        data: passwordForgotToken.data,
        uid: passwordForgotToken.uid,
        passCode: passwordForgotToken.passCode,
        createdAt: passwordForgotToken.createdAt,
        tries: passwordForgotToken.tries,
      }
    );
    return passwordForgotToken;
  };

  SAFE_URLS.createPasswordChangeToken = new SafeUrl(
    '/passwordChangeToken/:id',
    'db.createPasswordChangeToken'
  );
  DB.prototype.createPasswordChangeToken = async function(data) {
    log.trace('DB.createPasswordChangeToken', { uid: data.uid });
    const passwordChangeToken = await PasswordChangeToken.create(data);
    const { id } = passwordChangeToken;
    await this.pool.put(
      SAFE_URLS.createPasswordChangeToken,
      { id },
      {
        tokenId: passwordChangeToken.id,
        data: passwordChangeToken.data,
        uid: passwordChangeToken.uid,
        createdAt: passwordChangeToken.createdAt,
      }
    );
    return passwordChangeToken;
  };

  // READ

  SAFE_URLS.checkPassword = new SafeUrl(
    '/account/:uid/checkPassword',
    'db.checkPassword'
  );
  DB.prototype.checkPassword = async function(uid, verifyHash) {
    log.trace('DB.checkPassword', { uid, verifyHash });
    try {
      await this.pool.post(
        SAFE_URLS.checkPassword,
        { uid },
        {
          verifyHash: verifyHash,
        }
      );
      return true;
    } catch (err) {
      if (isIncorrectPasswordError(err)) {
        return false;
      }
      throw err;
    }
  };

  DB.prototype.accountExists = async function(email) {
    log.trace('DB.accountExists', { email: email });
    try {
      await this.accountRecord(email);
      return true;
    } catch (err) {
      if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
        return false;
      }
      throw err;
    }
  };

  SAFE_URLS.sessions = new SafeUrl('/account/:uid/sessions', 'db.sessions');
  DB.prototype.sessions = async function(uid) {
    log.trace('DB.sessions', { uid });
    const getMysqlSessionTokens = async () => {
      let sessionTokens = await this.pool.get(SAFE_URLS.sessions, { uid });
      if (!MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE) {
        return sessionTokens;
      }

      const expiredSessionTokens = [];

      // Filter out any expired sessions
      sessionTokens = sessionTokens.filter(sessionToken => {
        if (sessionToken.deviceId) {
          return true;
        }

        if (
          sessionToken.createdAt >
          Date.now() - MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE
        ) {
          return true;
        }

        expiredSessionTokens.push(
          Object.assign({}, sessionToken, { id: sessionToken.tokenId })
        );
        return false;
      });

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
    const sessions = mysqlSessionTokens.map(sessionToken => {
      const id = sessionToken.tokenId;
      const redisToken = redisSessionTokens[id];
      const mergedToken = Object.assign({}, sessionToken, redisToken, {
        // Map from the db's tokenId property to this repo's id property
        id,
      });
      delete mergedToken.tokenId;
      // Don't return potentially-stale lastAccessTime
      if (!lastAccessTimeEnabled) {
        mergedToken.lastAccessTime = null;
      }
      return mergedToken;
    });
    log.info('db.sessions.count', {
      mysql: mysqlSessionTokens.length,
      redis: redisSessionTokens.length,
    });
    return sessions;
  };

  SAFE_URLS.keyFetchToken = new SafeUrl(
    '/keyFetchToken/:id',
    'db.keyFetchToken'
  );
  DB.prototype.keyFetchToken = async function(id) {
    log.trace('DB.keyFetchToken', { id });
    let data;
    try {
      data = await this.pool.get(SAFE_URLS.keyFetchToken, { id });
    } catch (err) {
      throw wrapTokenNotFoundError(err);
    }
    return KeyFetchToken.fromId(id, data);
  };

  SAFE_URLS.keyFetchTokenWithVerificationStatus = new SafeUrl(
    '/keyFetchToken/:id/verified',
    'db.keyFetchTokenWithVerificationStatus'
  );
  DB.prototype.keyFetchTokenWithVerificationStatus = async function(id) {
    log.trace('DB.keyFetchTokenWithVerificationStatus', { id });
    let data;
    try {
      data = await this.pool.get(
        SAFE_URLS.keyFetchTokenWithVerificationStatus,
        { id }
      );
    } catch (err) {
      throw wrapTokenNotFoundError(err);
    }
    return KeyFetchToken.fromId(id, data);
  };

  SAFE_URLS.accountResetToken = new SafeUrl(
    '/accountResetToken/:id',
    'db.accountResetToken'
  );
  DB.prototype.accountResetToken = async function(id) {
    log.trace('DB.accountResetToken', { id });
    let data;
    try {
      data = await this.pool.get(SAFE_URLS.accountResetToken, { id });
    } catch (err) {
      throw wrapTokenNotFoundError(err);
    }
    return AccountResetToken.fromHex(data.tokenData, data);
  };

  SAFE_URLS.passwordForgotToken = new SafeUrl(
    '/passwordForgotToken/:id',
    'db.passwordForgotToken'
  );
  DB.prototype.passwordForgotToken = async function(id) {
    let data;
    log.trace('DB.passwordForgotToken', { id });
    try {
      data = await this.pool.get(SAFE_URLS.passwordForgotToken, { id });
    } catch (err) {
      throw wrapTokenNotFoundError(err);
    }
    return PasswordForgotToken.fromHex(data.tokenData, data);
  };

  SAFE_URLS.passwordChangeToken = new SafeUrl(
    '/passwordChangeToken/:id',
    'db.passwordChangeToken'
  );
  DB.prototype.passwordChangeToken = async function(id) {
    log.trace('DB.passwordChangeToken', { id });
    let data;
    try {
      data = await this.pool.get(SAFE_URLS.passwordChangeToken, { id });
    } catch (err) {
      throw wrapTokenNotFoundError(err);
    }
    return PasswordChangeToken.fromHex(data.tokenData, data);
  };

  /**
   * This route intended for internal use only. Please use `accountRecord`
   * for all other uses.
   */
  SAFE_URLS.emailRecord = new SafeUrl('/emailRecord/:email', 'db.emailRecord');
  DB.prototype.emailRecord = async function(email) {
    log.trace('DB.emailRecord', { email });
    let body;
    try {
      body = await this.pool.get(SAFE_URLS.emailRecord, {
        email: hexEncode(email),
      });
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.unknownAccount(email);
      }
      throw err;
    }
    return setAccountEmails.call(this, body);
  };

  SAFE_URLS.accountRecord = new SafeUrl(
    '/email/:email/account',
    'db.accountRecord'
  );
  DB.prototype.accountRecord = async function(email) {
    log.trace('DB.accountRecord', { email });
    let body;
    try {
      body = await this.pool.get(SAFE_URLS.accountRecord, {
        email: hexEncode(email),
      });
    } catch (err) {
      if (isNotFoundError(err)) {
        // There is a possibility that this email exists on the account table (ex. deleted from emails table)
        // Lets check before throwing account not found.
        return this.emailRecord(email);
      }
      throw err;
    }
    return setAccountEmails.call(this, body);
  };

  SAFE_URLS.setPrimaryEmail = new SafeUrl(
    '/email/:email/account/:uid',
    'db.setPrimaryEmail'
  );
  DB.prototype.setPrimaryEmail = async function(uid, email) {
    log.trace('DB.setPrimaryEmail', { email });
    try {
      return await this.pool.post(SAFE_URLS.setPrimaryEmail, {
        email: hexEncode(email),
        uid,
      });
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.unknownAccount(email);
      }
      throw err;
    }
  };

  SAFE_URLS.account = new SafeUrl('/account/:uid', 'db.account');
  DB.prototype.account = async function(uid) {
    log.trace('DB.account', { uid });
    let body;
    try {
      body = await this.pool.get(SAFE_URLS.account, { uid });
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.unknownAccount();
      }
      throw err;
    }
    body.emailVerified = !!body.emailVerified;
    return setAccountEmails.call(this, body);
  };

  SAFE_URLS.devices = new SafeUrl('/account/:uid/devices', 'db.devices');
  DB.prototype.devices = async function(uid) {
    log.trace('DB.devices', { uid });

    if (!uid) {
      throw error.unknownAccount();
    }

    const promises = [this.pool.get(SAFE_URLS.devices, { uid })];

    if (this.redis) {
      promises.push(this.redis.getSessionTokens(uid));
    }

    try {
      const [devices, redisSessionTokens = {}] = await Promise.all(promises);
      const lastAccessTimeEnabled = features.isLastAccessTimeEnabledForUser(
        uid
      );
      return devices.map(device => {
        return mergeDeviceInfoFromRedis(
          device,
          redisSessionTokens,
          lastAccessTimeEnabled
        );
      });
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.unknownAccount();
      }
      throw err;
    }
  };

  SAFE_URLS.sessionToken = new SafeUrl('/sessionToken/:id', 'db.sessionToken');
  DB.prototype.sessionToken = async function(id) {
    log.trace('DB.sessionToken', { id });
    let data;
    try {
      data = await this.pool.get(SAFE_URLS.sessionToken, { id });
    } catch (err) {
      throw wrapTokenNotFoundError(err);
    }
    return SessionToken.fromHex(data.tokenData, data);
  };

  // UPDATE

  SAFE_URLS.updatePasswordForgotToken = new SafeUrl(
    '/passwordForgotToken/:id/update',
    'db.updatePasswordForgotToken'
  );
  DB.prototype.updatePasswordForgotToken = async function(token) {
    log.trace('DB.udatePasswordForgotToken', { uid: token && token.uid });
    const { id } = token;
    return this.pool.post(
      SAFE_URLS.updatePasswordForgotToken,
      { id },
      {
        tries: token.tries,
      }
    );
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
  DB.prototype.touchSessionToken = async function(token, geo) {
    const { id, uid } = token;

    log.trace('DB.touchSessionToken', { id, uid });

    if (!this.redis || !features.isLastAccessTimeEnabledForUser(uid)) {
      return;
    }

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

    const t = {
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

    return this.redis.touchSessionToken(uid, t);
  };

  /**
   * Persist updated session-token data to the database.
   * This is a comparatively expensive call that writes through
   * to the underlying DB and hence should not be used in
   * frequently-called routes.
   *
   * To do a cheaper write of transient metadata that only hits
   * redis, use touchSessionToken isntead.
   */
  SAFE_URLS.updateSessionToken = new SafeUrl(
    '/sessionToken/:id/update',
    'db.updateSessionToken'
  );
  DB.prototype.updateSessionToken = async function(sessionToken, geo) {
    const { id, uid } = sessionToken;

    log.trace('DB.updateSessionToken', { id, uid });

    await this.touchSessionToken(sessionToken, geo);
    return this.pool.post(
      SAFE_URLS.updateSessionToken,
      { id },
      {
        authAt: sessionToken.authAt,
        uaBrowser: sessionToken.uaBrowser,
        uaBrowserVersion: sessionToken.uaBrowserVersion,
        uaOS: sessionToken.uaOS,
        uaOSVersion: sessionToken.uaOSVersion,
        uaDeviceType: sessionToken.uaDeviceType,
        uaFormFactor: sessionToken.uaFormFactor,
        mustVerify: sessionToken.mustVerify,
        lastAccessTime: sessionToken.lastAccessTime,
      }
    );
  };

  DB.prototype.pruneSessionTokens = async function(uid, sessionTokens) {
    log.trace('DB.pruneSessionTokens', {
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
      .filter(token => token.createdAt <= Date.now() - TOKEN_PRUNING_MAX_AGE)
      .map(token => token.id);

    if (tokenIds.length === 0) {
      return;
    }

    return this.redis.pruneSessionTokens(uid, tokenIds);
  };

  SAFE_URLS.device = new SafeUrl('/account/:uid/device/:deviceId', 'db.device');
  DB.prototype.device = async function(uid, deviceId) {
    log.trace('DB.device', { uid: uid, id: deviceId });

    const promises = [this.pool.get(SAFE_URLS.device, { uid, deviceId })];

    if (this.redis) {
      promises.push(this.redis.getSessionTokens(uid));
    }
    try {
      const [device, redisSessionTokens = {}] = await Promise.all(promises);
      const lastAccessTimeEnabled = features.isLastAccessTimeEnabledForUser(
        uid
      );
      return mergeDeviceInfoFromRedis(
        device,
        redisSessionTokens,
        lastAccessTimeEnabled
      );
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.unknownDevice();
      }
      throw err;
    }
  };

  SAFE_URLS.createDevice = new SafeUrl(
    '/account/:uid/device/:id',
    'db.createDevice'
  );
  DB.prototype.createDevice = async function(uid, deviceInfo) {
    log.trace('DB.createDevice', { uid: uid, id: deviceInfo.id });
    const sessionTokenId = deviceInfo.sessionTokenId;
    const refreshTokenId = deviceInfo.refreshTokenId;

    const id = await random.hex(16);
    deviceInfo.id = id;
    deviceInfo.createdAt = Date.now();

    try {
      await this.pool.put(
        SAFE_URLS.createDevice,
        { uid, id },
        {
          sessionTokenId,
          refreshTokenId,
          createdAt: deviceInfo.createdAt,
          name: deviceInfo.name,
          type: deviceInfo.type,
          callbackURL: deviceInfo.pushCallback,
          callbackPublicKey: deviceInfo.pushPublicKey,
          callbackAuthKey: deviceInfo.pushAuthKey,
          availableCommands: deviceInfo.availableCommands,
        }
      );
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

  SAFE_URLS.updateDevice = new SafeUrl(
    '/account/:uid/device/:id/update',
    'db.updateDevice'
  );
  DB.prototype.updateDevice = async function(uid, deviceInfo) {
    const { id } = deviceInfo;
    const sessionTokenId = deviceInfo.sessionTokenId;
    const refreshTokenId = deviceInfo.refreshTokenId;

    log.trace('DB.updateDevice', { uid, id });
    try {
      await this.pool.post(
        SAFE_URLS.updateDevice,
        { uid, id },
        {
          sessionTokenId,
          refreshTokenId,
          name: deviceInfo.name,
          type: deviceInfo.type,
          callbackURL: deviceInfo.pushCallback,
          callbackPublicKey: deviceInfo.pushPublicKey,
          callbackAuthKey: deviceInfo.pushAuthKey,
          callbackIsExpired: !!deviceInfo.pushEndpointExpired,
          availableCommands: deviceInfo.availableCommands,
        }
      );
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.unknownDevice();
      }
      if (isRecordAlreadyExistsError(err)) {
        // Identify the conflicting device in the error response,
        // to save a server round-trip for the client.
        const devices = await this.devices(uid);
        let conflictingDeviceId;
        devices.some(device => {
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

  SAFE_URLS.deleteAccount = new SafeUrl('/account/:uid', 'db.deleteAccount');
  DB.prototype.deleteAccount = async function(authToken) {
    const { uid } = authToken;

    log.trace('DB.deleteAccount', { uid });
    if (this.redis) {
      await this.redis.del(uid);
    }
    return this.pool.del(SAFE_URLS.deleteAccount, { uid });
  };

  SAFE_URLS.deleteSessionToken = new SafeUrl(
    '/sessionToken/:id',
    'db.deleteSessionToken'
  );
  DB.prototype.deleteSessionToken = async function(sessionToken) {
    const { id, uid } = sessionToken;

    log.trace('DB.deleteSessionToken', { id, uid });

    await this.deleteSessionTokenFromRedis(uid, id);
    return this.pool.del(SAFE_URLS.deleteSessionToken, { id });
  };

  SAFE_URLS.deleteKeyFetchToken = new SafeUrl(
    '/keyFetchToken/:id',
    'db.deleteKeyFetchToken'
  );
  DB.prototype.deleteKeyFetchToken = async function(keyFetchToken) {
    const { id, uid } = keyFetchToken;
    log.trace('DB.deleteKeyFetchToken', { id, uid });
    return this.pool.del(SAFE_URLS.deleteKeyFetchToken, { id });
  };

  SAFE_URLS.deleteAccountResetToken = new SafeUrl(
    '/accountResetToken/:id',
    'db.deleteAccountResetToken'
  );
  DB.prototype.deleteAccountResetToken = async function(accountResetToken) {
    const { id, uid } = accountResetToken;
    log.trace('DB.deleteAccountResetToken', { id, uid });
    return this.pool.del(SAFE_URLS.deleteAccountResetToken, { id });
  };

  SAFE_URLS.deletePasswordForgotToken = new SafeUrl(
    '/passwordForgotToken/:id',
    'db.deletePasswordForgotToken'
  );
  DB.prototype.deletePasswordForgotToken = async function(passwordForgotToken) {
    const { id, uid } = passwordForgotToken;
    log.trace('DB.deletePasswordForgotToken', { id, uid });
    return this.pool.del(SAFE_URLS.deletePasswordForgotToken, { id });
  };

  SAFE_URLS.deletePasswordChangeToken = new SafeUrl(
    '/passwordChangeToken/:id',
    'db.deletePasswordChangeToken'
  );
  DB.prototype.deletePasswordChangeToken = async function(passwordChangeToken) {
    const { id, uid } = passwordChangeToken;
    log.trace('DB.deletePasswordChangeToken', { id, uid });
    return this.pool.del(SAFE_URLS.deletePasswordChangeToken, { id });
  };

  SAFE_URLS.deleteDevice = new SafeUrl(
    '/account/:uid/device/:deviceId',
    'db.deleteDevice'
  );
  DB.prototype.deleteDevice = async function(uid, deviceId) {
    log.trace('DB.deleteDevice', { uid, id: deviceId });

    try {
      const result = await this.pool.del(SAFE_URLS.deleteDevice, {
        uid,
        deviceId,
      });
      await this.deleteSessionTokenFromRedis(uid, result.sessionTokenId);
      return result;
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.unknownDevice();
      }
      throw err;
    }
  };

  SAFE_URLS.deviceFromTokenVerificationId = new SafeUrl(
    '/account/:uid/tokens/:tokenVerificationId/device',
    'db.deviceFromTokenVerificationId'
  );
  DB.prototype.deviceFromTokenVerificationId = async function(
    uid,
    tokenVerificationId
  ) {
    log.trace('DB.deviceFromTokenVerificationId', { uid, tokenVerificationId });
    try {
      return await this.pool.get(SAFE_URLS.deviceFromTokenVerificationId, {
        uid,
        tokenVerificationId,
      });
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.unknownDevice();
      }
      throw err;
    }
  };

  // BATCH

  SAFE_URLS.resetAccount = new SafeUrl(
    '/account/:uid/reset',
    'db.resetAccount'
  );
  DB.prototype.resetAccount = async function(accountResetToken, data) {
    const { uid } = accountResetToken;

    log.trace('DB.resetAccount', { uid });
    if (this.redis) {
      await this.redis.del(uid);
    }
    data.verifierSetAt = Date.now();
    return this.pool.post(SAFE_URLS.resetAccount, { uid }, data);
  };

  SAFE_URLS.verifyEmail = new SafeUrl(
    '/account/:uid/verifyEmail/:emailCode',
    'db.verifyEmail'
  );
  DB.prototype.verifyEmail = async function(account, emailCode) {
    const { uid } = account;
    log.trace('DB.verifyEmail', { uid, emailCode });
    return this.pool.post(SAFE_URLS.verifyEmail, { uid, emailCode });
  };

  SAFE_URLS.verifyTokens = new SafeUrl(
    '/tokens/:tokenVerificationId/verify',
    'db.verifyTokens'
  );
  DB.prototype.verifyTokens = async function(tokenVerificationId, accountData) {
    log.trace('DB.verifyTokens', { tokenVerificationId });
    try {
      return await this.pool.post(
        SAFE_URLS.verifyTokens,
        { tokenVerificationId },
        { uid: accountData.uid }
      );
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.invalidVerificationCode();
      }
      throw err;
    }
  };

  SAFE_URLS.verifyTokensWithMethod = new SafeUrl(
    '/tokens/:tokenId/verifyWithMethod',
    'db.verifyTokensWithMethod'
  );
  DB.prototype.verifyTokensWithMethod = async function(
    tokenId,
    verificationMethod
  ) {
    log.trace('DB.verifyTokensWithMethod', { tokenId, verificationMethod });
    return this.pool.post(
      SAFE_URLS.verifyTokensWithMethod,
      { tokenId },
      { verificationMethod }
    );
  };

  SAFE_URLS.verifyTokenCode = new SafeUrl(
    '/tokens/:code/verifyCode',
    'db.verifyTokenCode'
  );
  DB.prototype.verifyTokenCode = async function(code, accountData) {
    log.trace('DB.verifyTokenCode', { code });
    try {
      return await this.pool.post(
        SAFE_URLS.verifyTokenCode,
        { code },
        { uid: accountData.uid }
      );
    } catch (err) {
      if (isExpiredTokenVerificationCodeError(err)) {
        throw error.expiredTokenVerficationCode();
      } else if (isNotFoundError(err)) {
        throw error.invalidTokenVerficationCode();
      }
      throw err;
    }
  };

  SAFE_URLS.forgotPasswordVerified = new SafeUrl(
    '/passwordForgotToken/:id/verified',
    'db.forgotPasswordVerified'
  );
  DB.prototype.forgotPasswordVerified = async function(passwordForgotToken) {
    const { id, uid } = passwordForgotToken;
    log.trace('DB.forgotPasswordVerified', { uid });
    const accountResetToken = await AccountResetToken.create({ uid });
    await this.pool.post(
      SAFE_URLS.forgotPasswordVerified,
      { id },
      {
        tokenId: accountResetToken.id,
        data: accountResetToken.data,
        uid: accountResetToken.uid,
        createdAt: accountResetToken.createdAt,
      }
    );
    return accountResetToken;
  };

  SAFE_URLS.updateLocale = new SafeUrl(
    '/account/:uid/locale',
    'db.updateLocale'
  );
  DB.prototype.updateLocale = async function(uid, locale) {
    log.trace('DB.updateLocale', { uid, locale });
    return this.pool.post(SAFE_URLS.updateLocale, { uid }, { locale: locale });
  };

  SAFE_URLS.securityEvent = new SafeUrl('/securityEvents', 'db.securityEvent');
  DB.prototype.securityEvent = async function(event) {
    log.trace('DB.securityEvent', {
      securityEvent: event,
    });

    return this.pool.post(SAFE_URLS.securityEvent, undefined, event);
  };

  SAFE_URLS.securityEvents = new SafeUrl(
    '/securityEvents/:uid/ip/:ipAddr',
    'db.securityEvents'
  );
  DB.prototype.securityEvents = async function(params) {
    log.trace('DB.securityEvents', {
      params: params,
    });
    const { ipAddr, uid } = params;
    return this.pool.get(SAFE_URLS.securityEvents, { ipAddr, uid });
  };

  SAFE_URLS.securityEventsByUid = new SafeUrl(
    '/securityEvents/:uid',
    'db.securityEventsByUid'
  );
  DB.prototype.securityEventsByUid = async function(params) {
    log.trace('DB.securityEventsByUid', {
      params: params,
    });
    const { uid } = params;
    return this.pool.get(SAFE_URLS.securityEventsByUid, { uid });
  };

  SAFE_URLS.deleteSecurityEvents = new SafeUrl(
    '/securityEvents/:uid',
    'db.deleteSecurityEventsByUid'
  );
  DB.prototype.deleteSecurityEvents = async function(params) {
    log.trace('DB.deleteSecurityEvents', {
      params: params,
    });
    const { uid } = params;
    return this.pool.del(SAFE_URLS.deleteSecurityEvents, { uid });
  };

  SAFE_URLS.createUnblockCode = new SafeUrl(
    '/account/:uid/unblock/:unblock',
    'db.createUnblockCode'
  );
  DB.prototype.createUnblockCode = async function(uid) {
    if (!UnblockCode) {
      return Promise.reject(new Error('Unblock has not been configured'));
    }
    log.trace('DB.createUnblockCode', { uid });
    const unblock = await UnblockCode();
    try {
      await this.pool.put(SAFE_URLS.createUnblockCode, { uid, unblock });
      return unblock;
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

  SAFE_URLS.consumeUnblockCode = new SafeUrl(
    '/account/:uid/unblock/:code',
    'db.consumeUnblockCode'
  );
  DB.prototype.consumeUnblockCode = async function(uid, code) {
    log.trace('DB.consumeUnblockCode', { uid });
    try {
      return await this.pool.del(SAFE_URLS.consumeUnblockCode, { uid, code });
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.invalidUnblockCode();
      }
      throw err;
    }
  };

  SAFE_URLS.createEmailBounce = new SafeUrl(
    '/emailBounces',
    'db.createEmailBounce'
  );
  DB.prototype.createEmailBounce = async function(bounceData) {
    log.trace('DB.createEmailBounce', {
      bouceData: bounceData,
    });

    return this.pool.post(SAFE_URLS.createEmailBounce, undefined, bounceData);
  };

  SAFE_URLS.emailBounces = new SafeUrl(
    '/emailBounces/:email',
    'db.emailBounces'
  );
  DB.prototype.emailBounces = async function(email) {
    log.trace('DB.emailBounces', { email });

    return this.pool.get(SAFE_URLS.emailBounces, {
      email: hexEncode(email),
    });
  };

  SAFE_URLS.accountEmails = new SafeUrl(
    '/account/:uid/emails',
    'db.accountEmails'
  );
  DB.prototype.accountEmails = async function(uid) {
    log.trace('DB.accountEmails', { uid });

    return this.pool.get(SAFE_URLS.accountEmails, { uid });
  };

  SAFE_URLS.getSecondaryEmail = new SafeUrl(
    '/email/:email',
    'db.getSecondaryEmail'
  );
  DB.prototype.getSecondaryEmail = async function(email) {
    log.trace('DB.getSecondaryEmail', { email });

    try {
      return await this.pool.get(SAFE_URLS.getSecondaryEmail, {
        email: hexEncode(email),
      });
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.unknownSecondaryEmail();
      }
      throw err;
    }
  };

  SAFE_URLS.createEmail = new SafeUrl('/account/:uid/emails', 'db.createEmail');
  DB.prototype.createEmail = async function(uid, emailData) {
    log.trace('DB.createEmail', {
      email: emailData.email,
      uid,
    });

    try {
      return await this.pool.post(SAFE_URLS.createEmail, { uid }, emailData);
    } catch (err) {
      if (isEmailAlreadyExistsError(err)) {
        throw error.emailExists();
      }
      throw err;
    }
  };

  SAFE_URLS.deleteEmail = new SafeUrl(
    '/account/:uid/emails/:email',
    'db.deleteEmail'
  );
  DB.prototype.deleteEmail = async function(uid, email) {
    log.trace('DB.deleteEmail', { uid });

    try {
      return await this.pool.del(SAFE_URLS.deleteEmail, {
        uid,
        email: hexEncode(email),
      });
    } catch (err) {
      if (isEmailDeletePrimaryError(err)) {
        throw error.cannotDeletePrimaryEmail();
      }
      throw err;
    }
  };

  SAFE_URLS.createSigninCode = new SafeUrl(
    '/signinCodes/:code',
    'db.createSigninCode'
  );
  DB.prototype.createSigninCode = async function(uid, flowId) {
    log.trace('DB.createSigninCode');

    const code = await random.hex(config.signinCodeSize);
    const data = { uid, createdAt: Date.now(), flowId };
    try {
      await this.pool.put(SAFE_URLS.createSigninCode, { code }, data);
    } catch (err) {
      if (isRecordAlreadyExistsError(err)) {
        log.warn('DB.createSigninCode.duplicate');
        return this.createSigninCode(uid);
      }
      throw err;
    }
    return code;
  };

  SAFE_URLS.consumeSigninCode = new SafeUrl(
    '/signinCodes/:code/consume',
    'db.consumeSigninCode'
  );
  DB.prototype.consumeSigninCode = async function(code) {
    log.trace('DB.consumeSigninCode', { code });

    try {
      return await this.pool.post(SAFE_URLS.consumeSigninCode, { code });
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.invalidSigninCode();
      }

      throw err;
    }
  };

  SAFE_URLS.resetAccountTokens = new SafeUrl(
    '/account/:uid/resetTokens',
    'db.resetAccountTokens'
  );
  DB.prototype.resetAccountTokens = async function(uid) {
    log.trace('DB.resetAccountTokens', { uid });

    return this.pool.post(SAFE_URLS.resetAccountTokens, { uid });
  };

  SAFE_URLS.createTotpToken = new SafeUrl('/totp/:uid', 'db.createTotpToken');
  DB.prototype.createTotpToken = async function(uid, sharedSecret, epoch) {
    log.trace('DB.createTotpToken', { uid });

    try {
      return await this.pool.put(
        SAFE_URLS.createTotpToken,
        { uid },
        {
          sharedSecret: sharedSecret,
          epoch: epoch,
        }
      );
    } catch (err) {
      if (isRecordAlreadyExistsError(err)) {
        throw error.totpTokenAlreadyExists();
      }
      throw err;
    }
  };

  SAFE_URLS.totpToken = new SafeUrl('/totp/:uid', 'db.totpToken');
  DB.prototype.totpToken = async function(uid) {
    log.trace('DB.totpToken', { uid });

    try {
      return await this.pool.get(SAFE_URLS.totpToken, { uid });
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.totpTokenNotFound();
      }
      throw err;
    }
  };

  SAFE_URLS.deleteTotpToken = new SafeUrl('/totp/:uid', 'db.deleteTotpToken');
  DB.prototype.deleteTotpToken = async function(uid) {
    log.trace('DB.deleteTotpToken', { uid });

    try {
      return await this.pool.del(SAFE_URLS.deleteTotpToken, { uid });
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.totpTokenNotFound();
      }
      throw err;
    }
  };

  SAFE_URLS.updateTotpToken = new SafeUrl(
    '/totp/:uid/update',
    'db.updateTotpToken'
  );
  DB.prototype.updateTotpToken = async function(uid, data) {
    log.trace('DB.updateTotpToken', { uid, data });

    try {
      return await this.pool.post(
        SAFE_URLS.updateTotpToken,
        { uid },
        {
          verified: data.verified,
          enabled: data.enabled,
        }
      );
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.totpTokenNotFound();
      }
      throw err;
    }
  };

  SAFE_URLS.replaceRecoveryCodes = new SafeUrl(
    '/account/:uid/recoveryCodes',
    'db.replaceRecoveryCodes'
  );
  DB.prototype.replaceRecoveryCodes = async function(uid, count) {
    log.trace('DB.replaceRecoveryCodes', { uid });

    return this.pool.post(SAFE_URLS.replaceRecoveryCodes, { uid }, { count });
  };

  SAFE_URLS.consumeRecoveryCode = new SafeUrl(
    '/account/:uid/recoveryCodes/:code',
    'db.consumeRecoveryCode'
  );
  DB.prototype.consumeRecoveryCode = async function(uid, code) {
    log.trace('DB.consumeRecoveryCode', { uid });

    try {
      return await this.pool.post(SAFE_URLS.consumeRecoveryCode, { uid, code });
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.recoveryCodeNotFound();
      }
      throw err;
    }
  };

  SAFE_URLS.createRecoveryKey = new SafeUrl(
    '/account/:uid/recoveryKey',
    'db.createRecoveryKey'
  );
  DB.prototype.createRecoveryKey = async function(
    uid,
    recoveryKeyId,
    recoveryData
  ) {
    log.trace('DB.createRecoveryKey', { uid });

    try {
      return await this.pool.post(
        SAFE_URLS.createRecoveryKey,
        { uid },
        { recoveryKeyId, recoveryData }
      );
    } catch (err) {
      if (isRecordAlreadyExistsError(err)) {
        throw error.recoveryKeyExists();
      }
      throw err;
    }
  };

  SAFE_URLS.getRecoveryKey = new SafeUrl(
    '/account/:uid/recoveryKey/:recoveryKeyId',
    'db.getRecoveryKey'
  );
  DB.prototype.getRecoveryKey = async function(uid, recoveryKeyId) {
    log.trace('DB.getRecoveryKey', { uid });

    try {
      return await this.pool.get(SAFE_URLS.getRecoveryKey, {
        uid,
        recoveryKeyId,
      });
    } catch (err) {
      if (isNotFoundError(err)) {
        throw error.recoveryKeyNotFound();
      }

      if (isInvalidRecoveryError(err)) {
        throw error.recoveryKeyInvalid();
      }
      throw err;
    }
  };

  SAFE_URLS.recoveryKeyExists = new SafeUrl(
    '/account/:uid/recoveryKey',
    'db.recoveryKeyExists'
  );
  DB.prototype.recoveryKeyExists = async function(uid) {
    log.trace('DB.recoveryKeyExists', { uid });

    return this.pool.get(SAFE_URLS.recoveryKeyExists, { uid });
  };

  SAFE_URLS.deleteRecoveryKey = new SafeUrl(
    '/account/:uid/recoveryKey',
    'db.deleteRecoveryKey'
  );
  DB.prototype.deleteRecoveryKey = async function(uid) {
    log.trace('DB.deleteRecoveryKey', { uid });

    return this.pool.del(SAFE_URLS.deleteRecoveryKey, { uid });
  };

  SAFE_URLS.createAccountSubscription = new SafeUrl(
    '/account/:uid/subscriptions/:subscriptionId',
    'db.createAccountSubscription'
  );
  DB.prototype.createAccountSubscription = async function(data) {
    const { uid, subscriptionId, productId, createdAt } = data;
    log.trace('DB.createAccountSubscription', data);
    return this.pool.put(
      SAFE_URLS.createAccountSubscription,
      { uid, subscriptionId },
      { productId, createdAt }
    );
  };

  SAFE_URLS.getAccountSubscription = new SafeUrl(
    '/account/:uid/subscriptions/:subscriptionId',
    'db.getAccountSubscription'
  );
  DB.prototype.getAccountSubscription = async function(uid, subscriptionId) {
    log.trace('DB.getAccountSubscription', { uid, subscriptionId });
    return this.pool.get(SAFE_URLS.getAccountSubscription, {
      uid,
      subscriptionId,
    });
  };

  SAFE_URLS.deleteAccountSubscription = new SafeUrl(
    '/account/:uid/subscriptions/:subscriptionId',
    'db.deleteAccountSubscription'
  );
  DB.prototype.deleteAccountSubscription = async function(uid, subscriptionId) {
    log.trace('DB.deleteAccountSubscription', { uid, subscriptionId });
    return this.pool.del(SAFE_URLS.deleteAccountSubscription, {
      uid,
      subscriptionId,
    });
  };

  SAFE_URLS.cancelAccountSubscription = new SafeUrl(
    '/account/:uid/subscriptions/:subscriptionId/cancel',
    'db.cancelAccountSubscription'
  );
  DB.prototype.cancelAccountSubscription = async function(
    uid,
    subscriptionId,
    cancelledAt
  ) {
    log.trace('DB.cancelAccountSubscription', {
      uid,
      subscriptionId,
      cancelledAt,
    });
    return this.pool.post(
      SAFE_URLS.cancelAccountSubscription,
      { uid, subscriptionId },
      { cancelledAt }
    );
  };

  SAFE_URLS.reactivateAccountSubscription = new SafeUrl(
    '/account/:uid/subscriptions/:subscriptionId/reactivate',
    'db.reactivateAccountSubscription'
  );
  DB.prototype.reactivateAccountSubscription = async function(
    uid,
    subscriptionId
  ) {
    log.trace('DB.reactivateAccountSubscription', { uid, subscriptionId });
    return this.pool.post(SAFE_URLS.reactivateAccountSubscription, {
      uid,
      subscriptionId,
    });
  };

  SAFE_URLS.fetchAccountSubscriptions = new SafeUrl(
    '/account/:uid/subscriptions',
    'db.fetchAccountSubscriptions'
  );
  DB.prototype.fetchAccountSubscriptions = async function(uid) {
    log.trace('DB.fetchAccountSubscriptions', { uid });
    return this.pool.get(SAFE_URLS.fetchAccountSubscriptions, { uid });
  };

  DB.prototype.deleteSessionTokenFromRedis = async function(uid, id) {
    if (!this.redis) {
      return;
    }

    return this.redis.pruneSessionTokens(uid, [id]);
  };

  function mergeDeviceInfoFromRedis(
    device,
    redisSessionTokens,
    lastAccessTimeEnabled
  ) {
    // If there's a matching sessionToken in redis, use the more up-to-date
    // location and access-time info from there rather than from the DB.
    const token = redisSessionTokens[device.sessionTokenId];
    const mergedInfo = Object.assign({}, device, token);
    return {
      id: mergedInfo.id,
      sessionTokenId: mergedInfo.sessionTokenId,
      refreshTokenId: mergedInfo.refreshTokenId,
      lastAccessTime: lastAccessTimeEnabled ? mergedInfo.lastAccessTime : null,
      location: mergedInfo.location,
      name: mergedInfo.name,
      type: mergedInfo.type,
      createdAt: mergedInfo.createdAt,
      pushCallback: mergedInfo.callbackURL,
      pushPublicKey: mergedInfo.callbackPublicKey,
      pushAuthKey: mergedInfo.callbackAuthKey,
      pushEndpointExpired: !!mergedInfo.callbackIsExpired,
      availableCommands: mergedInfo.availableCommands || {},
      uaBrowser: mergedInfo.uaBrowser,
      uaBrowserVersion: mergedInfo.uaBrowserVersion,
      uaOS: mergedInfo.uaOS,
      uaOSVersion: mergedInfo.uaOSVersion,
      uaDeviceType: mergedInfo.uaDeviceType,
      uaFormFactor: mergedInfo.uaFormFactor,
    };
  }

  function wrapTokenNotFoundError(err) {
    if (isNotFoundError(err)) {
      err = error.invalidToken('The authentication token could not be found');
    }
    return err;
  }

  function hexEncode(str) {
    return Buffer.from(str, 'utf8').toString('hex');
  }

  return DB;
};

// Note that these errno's are defined in the fxa-auth-db-mysql repo
// and don't necessarily match the errnos in this repo...

function isRecordAlreadyExistsError(err) {
  return err.statusCode === 409 && err.errno === 101;
}

function isIncorrectPasswordError(err) {
  return err.statusCode === 400 && err.errno === 103;
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

function isExpiredTokenVerificationCodeError(err) {
  return err.statusCode === 400 && err.errno === 137;
}

function isInvalidRecoveryError(err) {
  return err.statusCode === 400 && err.errno === 159;
}
