/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import crypto from 'crypto';
import {
  filterExpiredTokens,
  mergeCachedSessionTokens,
  mergeDeviceAndSessionToken,
  mergeDevicesAndSessionTokens,
} from 'fxa-shared/connected-services';
import { setupAuthDatabase } from 'fxa-shared/db';
import {
  Account,
  BaseToken,
  Device,
  Email,
  EmailBounce,
  LinkedAccount,
  AccountResetToken as RawAccountResetToken,
  KeyFetchToken as RawKeyFetchToken,
  PasswordChangeToken as RawPasswordChangeToken,
  PasswordForgotToken as RawPasswordForgotToken,
  SessionToken as RawSessionToken,
  RecoveryKey,
  SecurityEvent,
  TotpToken,
} from 'fxa-shared/db/models/auth';
import { normalizeEmail } from 'fxa-shared/email/helpers';
import { StatsD } from 'hot-shots';
import { Container } from 'typedi';
import random, { base32 } from './crypto/random';
import error from './error';

function resolveMetrics(): StatsD | undefined {
  return Container.has(StatsD) ? Container.get(StatsD) : undefined;
}

// Note that these errno's were defined in the fxa-auth-db-mysql repo
// and don't necessarily match the errnos in this repo...

function isRecordAlreadyExistsError(err: any) {
  return err.statusCode === 409 && err.errno === 101;
}

function isNotFoundError(err: any) {
  return err.statusCode === 404 && err.errno === 116;
}

function isEmailAlreadyExistsError(err: any) {
  return err.statusCode === 409 && err.errno === 101;
}

function isEmailDeletePrimaryError(err: any) {
  return err.statusCode === 400 && err.errno === 136;
}

export const createDB = (
  config: any,
  log: any,
  Token: any,
  UnblockCode: any = null
) => {
  const scrypt = require('./crypto/scrypt')(log, config);
  const features = require('./features')(config);
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

  class DB {
    redis: any;
    metrics?: StatsD;

    constructor(options: { redis?: any; metrics?: StatsD }) {
      this.redis =
        options.redis ||
        require('./redis')(
          { ...config.redis, ...config.redis.sessionTokens },
          log
        );
      this.metrics = options.metrics || resolveMetrics();
    }

    static async connect(config: any, redis: any) {
      // Establish database connection and bind instance to Model using Knex
      const metrics = resolveMetrics();
      const knex = setupAuthDatabase(
        config.database?.mysql?.auth,
        log,
        metrics
      );
      if (['debug', 'verbose', 'trace'].includes(config.log?.level)) {
        knex.on('query', (data) => {
          console.dir(data);
        });
      }
      return new DB({ redis, metrics });
    }

    async close() {
      if (this.redis) {
        await this.redis.close();
      }
    }

    async ping() {
      await Account.query().limit(1);
      return true;
    }

    // CREATE

    async createAccount(data: any) {
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
    }

    async createSessionToken(authToken: any) {
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
    }

    async createKeyFetchToken(authToken: any) {
      log.trace('DB.createKeyFetchToken', { uid: authToken && authToken.uid });
      const keyFetchToken = await KeyFetchToken.create(authToken);
      await RawKeyFetchToken.create(keyFetchToken);
      return keyFetchToken;
    }

    async createPasswordForgotToken(emailRecord: any) {
      log.trace('DB.createPasswordForgotToken', {
        uid: emailRecord && emailRecord.uid,
      });
      const passwordForgotToken = await PasswordForgotToken.create(emailRecord);
      await RawPasswordForgotToken.create(passwordForgotToken);
      return passwordForgotToken;
    }

    async createPasswordChangeToken(data: any) {
      log.trace('DB.createPasswordChangeToken', { uid: data.uid });
      const passwordChangeToken = await PasswordChangeToken.create(data);
      await RawPasswordChangeToken.create(passwordChangeToken);
      return passwordChangeToken;
    }

    // READ

    async checkPassword(uid: string, verifyHash: string) {
      log.trace('DB.checkPassword', { uid, verifyHash });
      const result = await Account.checkPassword(uid, verifyHash);

      if (result.v1) {
        resolveMetrics()?.increment('check.password.v1.success');
      }
      if (result.v2) {
        resolveMetrics()?.increment('check.password.v2.success');
      }

      return result;
    }

    async accountExists(email: string) {
      log.trace('DB.accountExists', { email: email });
      // TODO this could be optimized with a new query
      const account = await Account.findByPrimaryEmail(email);
      return !!account;
    }

    async sessions(uid: string) {
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
      const lastAccessTimeEnabled =
        features.isLastAccessTimeEnabledForUser(uid);

      const sessions = mergeCachedSessionTokens(
        mysqlSessionTokens,
        redisSessionTokens,
        lastAccessTimeEnabled
      );
      log.debug('db.sessions.count', {
        lastAccessTimeEnabled,
        mysql: mysqlSessionTokens.length,
        redis: Object.keys(redisSessionTokens).length,
      });
      return sessions;
    }

    async keyFetchToken(id: string) {
      log.trace('DB.keyFetchToken', { id });
      const data = await RawKeyFetchToken.findByTokenId(id);
      if (!data) {
        throw error.invalidToken('The authentication token could not be found');
      }
      return KeyFetchToken.fromId(id, data);
    }

    async keyFetchTokenWithVerificationStatus(id: string) {
      log.trace('DB.keyFetchTokenWithVerificationStatus', { id });
      const data = await RawKeyFetchToken.findByTokenId(id, true);
      if (!data) {
        throw error.invalidToken('The authentication token could not be found');
      }
      return KeyFetchToken.fromId(id, data);
    }

    async accountResetToken(id: string) {
      log.trace('DB.accountResetToken', { id });
      const data = await RawAccountResetToken.findByTokenId(id);
      if (!data) {
        throw error.invalidToken('The authentication token could not be found');
      }
      return AccountResetToken.fromHex(data.tokenData, data);
    }

    async passwordForgotToken(id: string) {
      log.trace('DB.passwordForgotToken', { id });
      const data = await RawPasswordForgotToken.findByTokenId(id);
      if (!data) {
        throw error.invalidToken('The authentication token could not be found');
      }
      return PasswordForgotToken.fromHex(data.tokenData, data);
    }

    async passwordChangeToken(id: string) {
      log.trace('DB.passwordChangeToken', { id });
      const data = await RawPasswordChangeToken.findByTokenId(id);
      if (!data) {
        throw error.invalidToken('The authentication token could not be found');
      }
      return PasswordChangeToken.fromHex(data.tokenData, data);
    }

    async accountRecord(email: string, options?: { linkedAccounts?: boolean }) {
      log.trace('DB.accountRecord', { email });
      const account = await Account.findByPrimaryEmail(email, options);
      if (!account) {
        throw error.unknownAccount(email);
      }
      return account;
    }
    // Legacy alias
    // TODO delete me
    emailRecord = this.accountRecord;

    async account(uid: string): Promise<Account> {
      log.trace('DB.account', { uid });
      const account = await Account.findByUid(uid, { include: ['emails'] });
      if (!account) {
        throw error.unknownAccount();
      }
      return account;
    }

    async listAllUnverifiedAccounts() {
      log.trace('DB.listAllUnverifiedAccounts');
      return await Account.listAllUnverified({ include: ['emails'] });
    }

    async getEmailUnverifiedAccounts(options: any) {
      log.trace('DB.getEmailUnverifiedAccounts');
      return await Account.getEmailUnverifiedAccounts(options);
    }

    async devices(uid: string) {
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
    }

    async sessionToken(id: string) {
      log.trace('DB.sessionToken', { id });
      const data = await RawSessionToken.findByTokenId(id);
      if (!data) {
        throw error.invalidToken('The authentication token could not be found');
      }
      return SessionToken.fromHex(data.tokenData, data);
    }

    async accountEmails(uid: string) {
      log.trace('DB.accountEmails', { uid });
      return Email.findByUid(uid);
    }

    async device(uid: string, deviceId: string) {
      log.trace('DB.device', { uid: uid, id: deviceId });

      const promises = [Device.findByPrimaryKey(uid, deviceId)];

      if (this.redis) {
        promises.push(this.redis.getSessionTokens(uid));
      }
      const [device, redisSessionTokens = {}] = await Promise.all(promises);
      if (!device) {
        throw error.unknownDevice();
      }
      const lastAccessTimeEnabled =
        features.isLastAccessTimeEnabledForUser(uid);
      const token = (redisSessionTokens as any)[device.sessionTokenId];
      return mergeDeviceAndSessionToken(device, token, lastAccessTimeEnabled);
    }

    async getSecondaryEmail(email: string) {
      log.trace('DB.getSecondaryEmail', { email });
      const emailRecord = await Email.findByEmail(email);
      if (!emailRecord) {
        throw error.unknownSecondaryEmail();
      }
      return emailRecord;
    }

    async getLinkedAccounts(uid: string) {
      log.trace('DB.getLinkedAccounts', { uid });
      return LinkedAccount.findByUid(uid);
    }

    async createLinkedAccount(
      uid: string,
      id: string,
      provider: any
    ): Promise<LinkedAccount> {
      log.trace('DB.createLinkedAccount', { uid, id, provider });
      return LinkedAccount.createLinkedAccount(uid, id, provider);
    }

    async deleteLinkedAccount(uid: string, provider: any) {
      log.trace('DB.deleteLinkedAccount', { uid, provider });
      return LinkedAccount.deleteLinkedAccount(uid, provider);
    }

    async getLinkedAccount(id: string, provider: any) {
      log.trace('DB.getLinkedAccount', { id, provider });
      return LinkedAccount.findByLinkedAccount(id, provider);
    }

    async totpToken(uid: string) {
      log.trace('DB.totpToken', { uid });
      const totp = await TotpToken.findByUid(uid);
      if (!totp) {
        throw error.totpTokenNotFound();
      }
      return totp;
    }

    async getRecoveryKey(uid: string, recoveryKeyId: string) {
      log.trace('DB.getRecoveryKey', { uid });
      const data = await RecoveryKey.findByUid(uid);
      if (!data) {
        throw error.recoveryKeyNotFound();
      }
      const idHash = crypto
        .createHash('sha256')
        .update(Buffer.from(recoveryKeyId, 'hex') as any)
        .digest();
      if (
        !crypto.timingSafeEqual(
          idHash as any,
          Buffer.from(data.recoveryKeyIdHash, 'hex') as any
        )
      ) {
        throw error.recoveryKeyInvalid();
      }
      return data;
    }

    async recoveryKeyExists(uid: string) {
      log.trace('DB.recoveryKeyExists', { uid });
      return {
        exists: await RecoveryKey.exists(uid),
      };
    }

    async emailBounces(email: string) {
      log.trace('DB.emailBounces', { email });
      return EmailBounce.findByEmail(email);
    }

    async deviceFromTokenVerificationId(
      uid: string,
      tokenVerificationId: string
    ) {
      log.trace('DB.deviceFromTokenVerificationId', {
        uid,
        tokenVerificationId,
      });
      const device = await Device.findByUidAndTokenVerificationId(
        uid,
        tokenVerificationId
      );
      if (!device) {
        throw error.unknownDevice();
      }
      return device;
    }

    // UPDATE

    async setPrimaryEmail(uid: string, email: string) {
      log.trace('DB.setPrimaryEmail', { email });
      try {
        return await Account.setPrimaryEmail(uid, email);
      } catch (err) {
        if (isNotFoundError(err)) {
          throw error.unknownAccount(email);
        }
        throw err;
      }
    }

    async updatePasswordForgotToken(token: {
      id: string;
      uid: string;
      tries: number;
    }) {
      log.trace('DB.udatePasswordForgotToken', { uid: token && token.uid });
      const { id } = token;
      return RawPasswordForgotToken.update(id, token.tries);
    }

    /**
     * Update cached session-token data, such as timestamps
     * and device info.  This is a comparatively cheap call that
     * only writes to redis, not the underlying DB, and hence
     * can be safely used in frequently-called routes.
     *
     * To do a more expensive write that flushes to the underlying
     * DB, use updateSessionToken instead.
     */
    async touchSessionToken(
      token: any,
      geo: any,
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
    }

    /**
     * Persist updated session-token data to the database.
     * This is a comparatively expensive call that writes through
     * to the underlying DB and hence should not be used in
     * frequently-called routes.
     *
     * To do a cheaper write of transient metadata that only hits
     * redis, use touchSessionToken instead.
     */
    async updateSessionToken(sessionToken: any, geo: any) {
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
    }

    async pruneSessionTokens(uid: string, sessionTokens: any) {
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
        .filter(
          (token: any) => token.createdAt <= Date.now() - TOKEN_PRUNING_MAX_AGE
        )
        .map((token: any) => token.id);

      if (tokenIds.length === 0) {
        return;
      }

      return this.redis.pruneSessionTokens(uid, tokenIds);
    }

    async createDevice(uid: string, deviceInfo: any): Promise<any> {
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
          const duplicateDevice = devices.find(
            (device: any) => device.id === deviceInfo.id
          );
          if (duplicateDevice) {
            return this.createDevice(uid, deviceInfo);
          }

          const conflictingDevice = devices.find(
            (device: any) =>
              (sessionTokenId && device.sessionTokenId === sessionTokenId) ||
              (refreshTokenId && device.refreshTokenId === refreshTokenId)
          );
          throw error.deviceSessionConflict(conflictingDevice?.id);
        }
        throw err;
      }
      deviceInfo.pushEndpointExpired = false;
      return deviceInfo;
    }

    async updateDevice(uid: string, deviceInfo: any) {
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
          const conflictingDevice = devices.find(
            (device: any) => device.sessionTokenId === sessionTokenId
          );
          throw error.deviceSessionConflict(conflictingDevice?.id);
        }
        throw err;
      }
      return deviceInfo;
    }

    // DELETE

    async deleteAccount(authToken: { uid: string }) {
      const { uid } = authToken;

      log.trace('DB.deleteAccount', { uid });
      if (this.redis) {
        await this.redis.del(uid);
      }
      return Account.delete(uid);
    }

    async deleteSessionToken(sessionToken: { id: string; uid: string }) {
      const { id, uid } = sessionToken;

      log.trace('DB.deleteSessionToken', { id, uid });

      await this.deleteSessionTokenFromRedis(uid, id);
      return RawSessionToken.delete(id);
    }

    async deleteKeyFetchToken(keyFetchToken: { id: string; uid: string }) {
      const { id, uid } = keyFetchToken;
      log.trace('DB.deleteKeyFetchToken', { id, uid });
      return RawKeyFetchToken.delete(id);
    }

    async deleteAccountResetToken(accountResetToken: {
      id: string;
      uid: string;
    }) {
      const { id, uid } = accountResetToken;
      log.trace('DB.deleteAccountResetToken', { id, uid });
      return RawAccountResetToken.delete(id);
    }

    async deletePasswordForgotToken(passwordForgotToken: {
      id: string;
      uid: string;
    }) {
      const { id, uid } = passwordForgotToken;
      log.trace('DB.deletePasswordForgotToken', { id, uid });
      return RawPasswordForgotToken.delete(id);
    }

    async deletePasswordChangeToken(passwordChangeToken: {
      id: string;
      uid: string;
    }) {
      const { id, uid } = passwordChangeToken;
      log.trace('DB.deletePasswordChangeToken', { id, uid });
      return RawPasswordChangeToken.delete(id);
    }

    async deleteDevice(uid: string, deviceId: string) {
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
    }

    // BATCH

    async resetAccount(
      accountResetToken: any,
      data: any,
      keepSessions = false
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
    }

    async verifyEmail(account: { uid: string }, emailCode: string) {
      const { uid } = account;
      log.trace('DB.verifyEmail', { uid, emailCode });
      await Account.verifyEmail(uid, emailCode);
    }

    async verifyTokens(tokenVerificationId: string, accountData: any) {
      log.trace('DB.verifyTokens', { tokenVerificationId });
      try {
        await BaseToken.verifyToken(accountData.uid, tokenVerificationId);
      } catch (err) {
        if (isNotFoundError(err)) {
          throw error.invalidVerificationCode();
        }
        throw err;
      }
    }

    async verifyTokensWithMethod(tokenId: string, verificationMethod: any) {
      log.trace('DB.verifyTokensWithMethod', { tokenId, verificationMethod });
      await RawSessionToken.verify(tokenId, verificationMethod);
    }

    async forgotPasswordVerified(passwordForgotToken: {
      id: string;
      uid: string;
    }) {
      const { id, uid } = passwordForgotToken;
      log.trace('DB.forgotPasswordVerified', { uid });
      const accountResetToken = await AccountResetToken.create({ uid });
      await RawPasswordForgotToken.verify(id, accountResetToken);
      return accountResetToken;
    }

    async createPassword(
      uid: string,
      authSalt: string,
      clientSalt: string | undefined,
      verifyHash: string,
      verifyHashVersion2: string | undefined,
      wrapWrapKb: string,
      wrapWrapKbVersion2: string | undefined,
      verifierVersion: number
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
    }

    async updateLocale(uid: string, locale: string) {
      log.trace('DB.updateLocale', { uid, locale });
      return Account.updateLocale(uid, locale);
    }

    async securityEvent(event: any) {
      log.trace('DB.securityEvent', {
        securityEvent: event,
      });
      await SecurityEvent.create({
        ...event,
        ipHmacKey: config.securityHistory.ipHmacKey,
      });
    }

    async securityEvents(params: { uid: string; ipAddr: string }) {
      log.trace('DB.securityEvents', {
        params: params,
      });
      const { uid, ipAddr } = params;
      return SecurityEvent.findByUidAndIP(
        uid,
        ipAddr,
        config.securityHistory.ipHmacKey
      );
    }

    async securityEventsByUid(params: { uid: string }) {
      log.trace('DB.securityEventsByUid', {
        params: params,
      });
      const { uid } = params;
      return SecurityEvent.findByUid(uid);
    }

    async createUnblockCode(uid: string): Promise<any> {
      if (!UnblockCode) {
        throw new Error('Unblock has not been configured');
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
    }

    async consumeUnblockCode(uid: string, code: string) {
      log.trace('DB.consumeUnblockCode', { uid });
      try {
        return await Account.consumeUnblockCode(uid, code);
      } catch (err) {
        if (isNotFoundError(err)) {
          throw error.invalidUnblockCode();
        }
        throw err;
      }
    }

    async createEmailBounce(
      bounceData: Parameters<typeof EmailBounce.create>[0]
    ) {
      log.trace('DB.createEmailBounce', {
        bounceData: bounceData,
      });
      await EmailBounce.create(bounceData);
    }

    async createEmail(uid: string, emailData: any) {
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
    }

    async deleteEmail(uid: string, email: string) {
      log.trace('DB.deleteEmail', { uid });

      try {
        return await Account.deleteEmail(uid, email);
      } catch (err) {
        if (isEmailDeletePrimaryError(err)) {
          throw error.cannotDeletePrimaryEmail();
        }
        throw err;
      }
    }

    async createSigninCode(uid: string, flowId: string): Promise<any> {
      log.trace('DB.createSigninCode');

      const code = await random.hex(config.signinCodeSize);
      try {
        await Account.createSigninCode(uid, code, flowId);
      } catch (err) {
        if (isRecordAlreadyExistsError(err)) {
          log.warn('DB.createSigninCode.duplicate');
          return this.createSigninCode(uid, flowId);
        }
        throw err;
      }
      return code;
    }

    async consumeSigninCode(code: string) {
      log.trace('DB.consumeSigninCode', { code });
      try {
        return await Account.consumeSigninCode(code);
      } catch (err) {
        if (isNotFoundError(err)) {
          throw error.invalidSigninCode();
        }

        throw err;
      }
    }

    async resetAccountTokens(uid: string) {
      log.trace('DB.resetAccountTokens', { uid });

      await Account.resetTokens(uid);
    }

    async createTotpToken(uid: string, sharedSecret: string, epoch: number) {
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
    }

    async deleteTotpToken(uid: string) {
      log.trace('DB.deleteTotpToken', { uid });

      try {
        return await TotpToken.delete(uid);
      } catch (err) {
        if (isNotFoundError(err)) {
          throw error.totpTokenNotFound();
        }
        throw err;
      }
    }

    async updateTotpToken(
      uid: string,
      data: { verified: boolean; enabled: boolean }
    ) {
      log.trace('DB.updateTotpToken', { uid, data });

      try {
        await TotpToken.update(uid, data.verified, data.enabled);
      } catch (err) {
        if (isNotFoundError(err)) {
          throw error.totpTokenNotFound();
        }
        throw err;
      }
    }

    async replaceRecoveryCodes(uid: string, count: number) {
      log.trace('DB.replaceRecoveryCodes', { uid });
      const codes = await this.createRecoveryCodes(uid, count);
      await this.updateRecoveryCodes(uid, codes);
      return codes;
    }

    async createRecoveryCodes(uid: string, count: number) {
      log.trace('DB.createRecoveryCodes', { uid });
      const getCode = base32(config.totp.recoveryCodes.length);
      const codes = await Promise.all(
        Array.from({ length: count }, async () => {
          return (await getCode()).toLowerCase();
        })
      );
      return codes;
    }

    async updateRecoveryCodes(uid: string, codes: string[]) {
      log.trace('DB.updateRecoveryCodes', { uid, codes });

      // Convert codes into hashes
      const hashes = await Promise.all(
        codes.map(async (code: string) => {
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
    }

    async consumeRecoveryCode(uid: string, code: string) {
      log.trace('DB.consumeRecoveryCode', { uid });
      const codeBuffer = Buffer.from(code.toLowerCase());
      const codeChecker = async (hash: any, salt: any) => {
        return crypto.timingSafeEqual(
          hash,
          Buffer.from(
            await scrypt.hash(codeBuffer, salt, 65536, 8, 1, 32),
            'hex'
          ) as any
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
    }

    async createRecoveryKey(
      uid: string,
      recoveryKeyId: string,
      recoveryData: string,
      enabled: boolean
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
    }

    async deleteRecoveryKey(uid: string) {
      log.trace('DB.deleteRecoveryKey', { uid });

      return RecoveryKey.delete(uid);
    }

    async updateRecoveryKey(
      uid: string,
      recoveryKeyId: string,
      enabled: boolean
    ) {
      log.trace('DB.updateRecoveryKey', { uid });

      return RecoveryKey.update({ uid, recoveryKeyId, enabled });
    }

    async getRecoveryKeyRecordWithHint(uid: string) {
      log.trace('DB.getRecoveryKeyRecordWithHint', { uid });
      return await RecoveryKey.findRecordWithHintByUid(uid);
    }

    async updateRecoveryKeyHint(uid: string, hint: string) {
      log.trace('DB.updateRecoveryKeyHint', { uid, hint });

      return RecoveryKey.updateRecoveryKeyHint(uid, hint);
    }

    async deleteSessionTokenFromRedis(uid: string, id: string) {
      if (!this.redis) {
        return;
      }

      return this.redis.pruneSessionTokens(uid, [id]);
    }
  }

  return DB;
};

export type DB = InstanceType<ReturnType<typeof createDB>>;
