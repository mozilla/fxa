/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = (config) => {
  const otplib = require('otplib');
  const crypto = require('crypto');
  const ClientApi = require('./api')(config);
  const butil = require('../../lib/crypto/butil');
  const pbkdf2 = require('../../lib/crypto/pbkdf2');
  const hkdf = require('../../lib/crypto/hkdf');
  const tokens = require('../../lib/tokens')({ trace: function () {} }, config);

  function Client(origin, options) {
    this.uid = null;
    this.authAt = 0;
    this.api = new ClientApi(origin);
    this.email = null;
    this.emailVerified = false;
    this.authToken = null;
    this.sessionToken = null;
    this.accountResetToken = null;
    this.keyFetchToken = null;
    this.passwordForgotToken = null;
    this.kA = null;
    this.wrapKb = null;
    this.totpAuthenticator = null;
    this.options = options || {};

    if (!(this.options.version === '' || this.options.version === 'V2')) {
      throw new Error(
        'options.version must be provided! ' + JSON.stringify(this.options)
      );
    }
  }

  Client.Api = ClientApi;

  Client.prototype.setupCredentials = function (email, password) {
    return Promise.resolve().then(() => {
      this.email = email;
      return pbkdf2
        .derive(
          Buffer.from(password),
          hkdf.KWE('quickStretch', email),
          1000,
          32
        )
        .then((stretch) => {
          return hkdf(stretch, 'authPW', null, 32).then((authPW) => {
            this.authPW = authPW;
            return hkdf(stretch, 'unwrapBKey', null, 32);
          });
        })
        .then((unwrapBKey) => {
          this.unwrapBKey = unwrapBKey;
          return this;
        });
    });
  };

  Client.prototype.setupCredentialsV2 = async function (
    email,
    password,
    originalLoginEmail
  ) {
    this.email = email;

    // Note that using the originalLoginEmail is to main parity with V1. V2 actually no longer
    // requires the notion of an original email. In V2, the correct email should just be
    // supplied; however, there are handful of tests checking that the use of originalLoginEmail
    // is supported, so the convention is still supported for now.
    let clientSalt = await this.getClientSalt(originalLoginEmail || email);

    // If the client doesn't have a known salt, construct a new one.
    if (!clientSalt) {
      const saltValue = await crypto.randomBytes(32).toString('hex');
      clientSalt = `identity.mozilla.com/picl/v1/quickStretchV2:${saltValue}`;
    }

    const stretch = await pbkdf2.derive(
      Buffer.from(password),
      Buffer.from(clientSalt),
      650000,
      32
    );
    const authPWVersion2 = await hkdf(stretch, 'authPW', null, 32);
    const unwrapBKeyVersion2 = await hkdf(stretch, 'unwrapBKey', null, 32);

    // Passed through all derivations successfully apply state.
    this.clientSalt = clientSalt;
    this.authPWVersion2 = authPWVersion2;
    this.unwrapBKeyVersion2 = unwrapBKeyVersion2;
  };

  Client.create = async function (origin, email, password, options = {}) {
    const c = new Client(origin, options);

    if (options.version === 'V2') {
      await c.setupCredentials(email, password);
      await c.setupCredentialsV2(email, password);

      c.generateNewWrapKb();
      c.deriveWrapKbVersion2FromKb();

      const result = await c.createV2();
      return result;
    } else {
      await c.setupCredentials(email, password);
      const result = await c.create(options);
      return result;
    }
  };

  Client.login = function (origin, email, password, options) {
    const c = new Client(origin, options);

    if (c.options.version === 'V2') {
      return (async function () {
        await c.setupCredentials(email, password);
        await c.setupCredentialsV2(email, password, options.originalLoginEmail);
        await c.authV2(options);
        return c;
      })();
    }

    return c.setupCredentials(email, password).then((c) => {
      return c.auth(options);
    });
  };

  Client.upgradeCredentials = async function (
    origin,
    email,
    password,
    options
  ) {
    const c = new Client(origin, options);
    await c.setupCredentials(email, password);
    await c.auth(options);
    await c.upgradeCredentials(password);
    return c;
  };

  Client.changePassword = function (
    origin,
    email,
    oldPassword,
    newPassword,
    headers,
    options = {}
  ) {
    const c = new Client(origin, options);
    if (options.version === 'V2') {
      return (async function () {
        await c.setupCredentials(email, oldPassword);
        await c.setupCredentialsV2(email, oldPassword);
        await c.changePasswordV2(newPassword, headers);
        return c;
      })();
    }

    return c.setupCredentials(email, oldPassword).then(() => {
      return c.changePassword(newPassword, headers).then(() => {
        return c;
      });
    });
  };

  Client.createAndVerify = function (
    origin,
    email,
    password,
    mailbox,
    options
  ) {
    return Client.create(origin, email, password, options).then((client) => {
      return mailbox
        .waitForCode(email)
        .then((code) => {
          return client.verifyEmail(code, options);
        })
        .then(() => {
          // clear the post verified email, if one was sent
          if (options && options.service === 'sync') {
            return mailbox.waitForEmail(email);
          }
        })
        .then(() => {
          return client;
        });
    });
  };

  Client.createAndVerifyAndTOTP = function (
    origin,
    email,
    password,
    mailbox,
    options
  ) {
    return Client.createAndVerify(
      origin,
      email,
      password,
      mailbox,
      options
    ).then((client) => {
      client.totpAuthenticator = new otplib.authenticator.Authenticator();
      return client
        .createTotpToken()
        .then((result) => {
          client.totpAuthenticator.options = {
            secret: result.secret,
            crypto: crypto,
          };
          return client.verifyTotpCode(client.totpAuthenticator.generate());
        })
        .then(() => {
          return client;
        });
    });
  };

  Client.loginAndVerify = function (origin, email, password, mailbox, options) {
    if (!options) {
      options = {};
    }

    options.keys = options.keys || true;

    return Client.login(origin, email, password, options).then((client) => {
      return mailbox
        .waitForCode(email)
        .then((code) => {
          return client.verifyEmail(code, options);
        })
        .then(() => {
          return client;
        });
    });
  };

  Client.prototype.create = function () {
    return this.api
      .accountCreate(this.email, this.authPW, this.options)
      .then((a) => {
        this.uid = a.uid;
        this.authAt = a.authAt;
        this.sessionToken = a.sessionToken;
        this.keyFetchToken = a.keyFetchToken;
        this.device = a.device;
        return this;
      });
  };
  Client.prototype.createV2 = async function () {
    const account = await this.api.accountCreateV2(
      this.email,
      this.authPW,
      this.authPWVersion2,
      this.wrapKb,
      this.wrapKbVersion2,
      this.clientSalt,
      this.options
    );
    this.uid = account.uid;
    this.authAt = account.authAt;
    this.sessionToken = account.sessionToken;
    this.keyFetchToken = account.keyFetchToken;
    this.keyFetchTokenVersion2 = account.keyFetchTokenVersion2;
    this.device = account.device;
    return this;
  };

  Client.prototype._clear = function () {
    this.authToken = null;
    this.sessionToken = null;
    this.srpSession = null;
    this.accountResetToken = null;
    this.keyFetchToken = null;
    this.passwordForgotToken = null;
    this.kA = null;
    this.wrapKb = null;
    this.wrapKbVersion2 = null;
  };

  Client.prototype.stringify = function () {
    return JSON.stringify(this);
  };

  Client.prototype.auth = function (opts) {
    if (!this.authPW) {
      throw new Error('authPW not set');
    }
    return this.api.accountLogin(this.email, this.authPW, opts).then((data) => {
      this.uid = data.uid;
      this.sessionToken = data.sessionToken;
      this.keyFetchToken = data.keyFetchToken || null;
      this.emailVerified = data.verified;
      this.authAt = data.authAt;
      this.device = data.device;
      this.verificationReason = data.verificationReason;
      this.verificationMethod = data.verificationMethod;
      this.verified = data.verified;
      return this;
    });
  };
  Client.prototype.authV2 = async function (opts) {
    const data = await this.api.accountLogin(
      this.email,
      this.authPWVersion2,
      opts
    );
    this.uid = data.uid;
    this.sessionToken = data.sessionToken;
    this.emailVerified = data.verified;
    this.authAt = data.authAt;
    this.device = data.device;
    this.verificationReason = data.verificationReason;
    this.verificationMethod = data.verificationMethod;
    this.verified = data.verified;
    this.keyFetchTokenVersion2 = data.keyFetchTokenVersion2;
    return this;
  };

  Client.prototype.login = function (opts) {
    if (this.options.version === 'V2') {
      return this.authV2(opts);
    }
    return this.auth(opts);
  };

  Client.prototype.destroySession = function () {
    let p = Promise.resolve(null);
    if (this.sessionToken) {
      p = this.api.sessionDestroy(this.sessionToken).then(() => {
        this.sessionToken = null;
        return {};
      });
    }
    return p;
  };

  Client.prototype.createRecoveryPhoneNumber = async function (phoneNumber) {
    if (this.sessionToken) {
      const resp = await this.api.recoveryPhoneNumberCreate(
        this.sessionToken,
        phoneNumber
      );
      return resp;
    }
  };

  Client.prototype.reauth = function (opts) {
    return this.api
      .sessionReauth(
        this.sessionToken,
        this.email,
        this.authPWVersion2 || this.authPW,
        opts
      )
      .then((data) => {
        this.uid = data.uid;
        if (this.authPWVersion2) {
          this.keyFetchTokenVersion2 = data.keyFetchToken || null;
        } else {
          this.keyFetchToken = data.keyFetchToken || null;
        }

        this.emailVerified = data.verified;
        this.authAt = data.authAt;
        this.verificationReason = data.verificationReason;
        this.verificationMethod = data.verificationMethod;
        this.verified = data.verified;
        return this;
      });
  };

  Client.prototype.duplicate = function () {
    const c = new Client(this.api.origin, this.options);
    c.uid = this.uid;
    c.authAt = this.authAt;
    c.email = this.email;
    c.emailVerified = this.emailVerified;
    c.authToken = this.authToken;
    c.sessionToken = this.sessionToken;
    c.kA = this.kA;
    c.kB = this.kB;
    c.wrapKb = this.wrapKb;
    c.unwrapBKey = this.unwrapBKey;
    c.authPW = this.authPW;
    c.options = this.options;
    return Promise.resolve()
      .then(() => {
        if (this.sessionToken) {
          return this.api.sessionDuplicate(this.sessionToken).then((data) => {
            c.uid = data.uid;
            c.sessionToken = data.sessionToken;
            c.authAt = data.authAt;
            c.verified = data.verified;
            c.verificationReason = data.verificationReason;
            c.verificationMethod = data.verificationMethod;
          });
        }
      })
      .then(() => {
        return c;
      });
  };

  Client.prototype.verifyEmail = function (code, options) {
    return this.api.recoveryEmailVerifyCode(this.uid, code, options);
  };

  Client.prototype.verifyShortCodeEmail = async function (code, options = {}) {
    return this.api.accountCreateWithShortCode(
      this.sessionToken,
      code,
      options
    );
  };

  Client.prototype.resendVerifyShortCodeEmail = async function (code, options) {
    return this.api.resendAccountCreateWithShortCode(
      this.sessionToken,
      code,
      options
    );
  };

  Client.prototype.verifySecondaryEmailWithCode = async function (code, email) {
    return this.api.recoveryEmailSecondaryVerifyCode(
      this.sessionToken,
      code,
      email
    );
  };

  Client.prototype.resendVerifySecondaryEmailWithCode = async function (email) {
    return this.api.recoveryEmailSecondaryResendCode(this.sessionToken, email);
  };

  Client.prototype.emailStatus = function () {
    const o = this.sessionToken ? Promise.resolve(null) : this.login();
    return o.then(() => {
      return this.api.recoveryEmailStatus(this.sessionToken);
    });
  };

  Client.prototype.requestVerifyEmail = function () {
    const o = this.sessionToken ? Promise.resolve(null) : this.login();
    return o.then(() => {
      return this.api.recoveryEmailResendCode(this.sessionToken, this.options);
    });
  };

  Client.prototype.sign = function (publicKey, duration, locale, options) {
    const o = this.sessionToken ? Promise.resolve(null) : this.login();
    return o
      .then(() => {
        return this.api.certificateSign(
          this.sessionToken,
          publicKey,
          duration,
          locale,
          options
        );
      })
      .then((x) => {
        return x.cert;
      });
  };

  Client.prototype.changePassword = function (
    newPassword,
    headers,
    sessionToken
  ) {
    if (this.options.version === 'V2') {
      return this.changePasswordV2(newPassword, headers, sessionToken);
    }

    return this.api
      .passwordChangeStart(this.email, this.authPW, headers)
      .then((json) => {
        this.keyFetchToken = json.keyFetchToken;
        this.passwordChangeToken = json.passwordChangeToken;
        return this.keys();
      })
      .then((/* keys */) => {
        return this.setupCredentials(this.email, newPassword);
      })
      .then(() => {
        this.deriveWrapKbFromKb();
        return this.api.passwordChangeFinish(
          this.passwordChangeToken,
          this.authPW,
          this.wrapKb,
          headers,
          sessionToken
        );
      })
      .then((res) => {
        this._clear();

        // Update to new tokens if needed
        this.sessionToken = res.sessionToken
          ? res.sessionToken
          : this.sessionToken;
        this.authAt = res.authAt ? res.authAt : this.authAt;
        this.keyFetchToken = res.keyFetchToken
          ? res.keyFetchToken
          : this.keyFetchToken;

        return res;
      });
  };
  Client.prototype.changePasswordV2 = async function (
    newPassword,
    headers,
    sessionToken
  ) {
    const json = await this.api.passwordChangeStartV2(
      this.email,
      this.authPW,
      this.authPWVersion2,
      headers
    );
    this.keyFetchToken = json.keyFetchToken;
    this.keyFetchTokenVersion2 = json.keyFetchTokenVersion2;
    this.passwordChangeToken = json.passwordChangeToken;

    // Get the current V1 keys. This will also ensure the current kB is correct.
    await this.getKeysV1();

    // Create new credentials for the new password
    await this.setupCredentials(this.email, newPassword);
    await this.setupCredentialsV2(this.email, newPassword);

    // Derive wrapKb from the new unwrapBKey and th current kB. This ensures
    // kB will remain constant even after a password change.
    this.deriveWrapKbFromKb();
    this.deriveWrapKbVersion2FromKb();

    const res = await this.api.passwordChangeFinishV2(
      this.passwordChangeToken,
      this.authPW,
      this.authPWVersion2,
      this.wrapKb,
      this.wrapKbVersion2,
      this.clientSalt,
      headers,
      sessionToken
    );
    this._clear();

    this.sessionToken = res.sessionToken ? res.sessionToken : this.sessionToken;
    this.authAt = res.authAt ? res.authAt : this.authAt;
    this.keyFetchToken = res.keyFetchToken
      ? res.keyFetchToken
      : this.keyFetchToken;
    this.keyFetchTokenVersion2 = res.keyFetchTokenVersion2
      ? res.keyFetchTokenVersion2
      : this.keyFetchTokenVersion2;
    return res;
  };

  Client.prototype.keys = async function () {
    if (this.options.version === 'V2') {
      return await this.keysV2();
    }

    if (!this.keyFetchToken) {
      await this.auth();
    }
    return await this.getKeysV1();
  };
  Client.prototype.keysV2 = async function () {
    if (!this.keyFetchTokenVersion2) {
      await this.authV2();
    }

    return await this.getKeysV2();
  };

  Client.prototype.attachedClients = function () {
    const o = this.sessionToken ? Promise.resolve(null) : this.login();
    return o.then(() => {
      return this.api.attachedClients(this.sessionToken);
    });
  };

  Client.prototype.destroyAttachedClient = function (clientData) {
    const o = this.sessionToken ? Promise.resolve(null) : this.login();
    return o.then(() => {
      return this.api.attachedClientDestroy(this.sessionToken, clientData);
    });
  };

  Client.prototype.devices = function () {
    const o = this.sessionToken ? Promise.resolve(null) : this.login();
    return o.then(() => {
      return this.api.accountDevices(this.sessionToken);
    });
  };

  Client.prototype.devicesWithRefreshToken = function (refreshToken) {
    return this.api.accountDevicesWithRefreshToken(refreshToken);
  };

  Client.prototype.devicesNotifyWithRefreshToken = function (
    refreshToken,
    notifyDeviceId
  ) {
    return this.api.accountDevicesNotifyWithRefreshToken(
      refreshToken,
      notifyDeviceId
    );
  };

  Client.prototype.updateDevice = function (info) {
    const o = this.sessionToken ? Promise.resolve(null) : this.login();
    return o
      .then(() => {
        return this.api.accountDevice(this.sessionToken, info);
      })
      .then((device) => {
        if (!this.device || this.device.id === device.id) {
          this.device = device;
        }
        return device;
      });
  };

  Client.prototype.updateDeviceWithRefreshToken = function (
    refreshTokenId,
    info
  ) {
    return this.api
      .accountDeviceWithRefreshToken(refreshTokenId, info)
      .then((device) => {
        if (!this.device || this.device.id === device.id) {
          this.device = device;
        }
        return device;
      });
  };

  Client.prototype.destroyDevice = function (id) {
    const o = this.sessionToken ? Promise.resolve(null) : this.login();
    return o
      .then(() => {
        return this.api.deviceDestroy(this.sessionToken, id);
      })
      .then(() => {
        delete this.sessionToken;
      });
  };

  Client.prototype.destroyDeviceWithRefreshToken = function (
    refreshTokenId,
    id
  ) {
    return this.api.deviceDestroyWithRefreshToken(refreshTokenId, id);
  };

  Client.prototype.deviceCommandsWithRefreshToken = function (
    refreshTokenId,
    index,
    limit
  ) {
    return this.api.deviceCommandsWithRefreshToken(
      refreshTokenId,
      index,
      limit
    );
  };

  Client.prototype.devicesInvokeCommandWithRefreshToken = function (
    refreshTokenId,
    target,
    command,
    payload,
    ttl
  ) {
    return this.api.devicesInvokeCommandWithRefreshToken(
      refreshTokenId,
      target,
      command,
      payload,
      ttl
    );
  };

  Client.prototype.sessionStatus = function () {
    const o = this.sessionToken ? Promise.resolve(null) : this.login();
    return o.then(() => {
      return this.api.sessionStatus(this.sessionToken);
    });
  };

  Client.prototype.securityEvents = function () {
    const o = this.sessionToken ? Promise.resolve(null) : this.login();
    return o.then(() => {
      return this.api.securityEvents(this.sessionToken);
    });
  };

  Client.prototype.accountProfile = function (oauthToken) {
    if (oauthToken) {
      return this.api.accountProfile(null, {
        Authorization: `Bearer ${oauthToken}`,
      });
    } else {
      const o = this.sessionToken ? Promise.resolve(null) : this.login();
      return o.then(() => {
        return this.api.accountProfile(this.sessionToken);
      });
    }
  };

  Client.prototype.account = async function () {
    if (!this.sessionToken) {
      await this.login();
    }
    return this.api.account(this.sessionToken);
  };

  Client.prototype.destroyAccount = function () {
    const authPW =
      this.options.version === 'V2' && this.authPWVersion2
        ? this.authPWVersion2
        : this.authPW;

    if (this.sessionToken) {
      return this.api
        .accountDestroyWithSessionToken(this.email, authPW, this.sessionToken)
        .then(this._clear.bind(this));
    }
    return this.api
      .accountDestroy(this.email, authPW)
      .then(this._clear.bind(this));
  };

  Client.prototype.forgotPassword = function (lang) {
    return this.api
      .passwordForgotSendCode(this.email, this.options, lang)
      .then((x) => {
        this.passwordForgotToken = x.passwordForgotToken;
      });
  };

  Client.prototype.reforgotPassword = function () {
    return this.api.passwordForgotResendCode(
      this.passwordForgotToken,
      this.email
    );
  };

  Client.prototype.verifyPasswordResetCode = function (code, headers, options) {
    return this.api
      .passwordForgotVerifyCode(
        this.passwordForgotToken,
        code,
        headers,
        options
      )
      .then((result) => {
        this.accountResetToken = result.accountResetToken;
      });
  };

  Client.prototype.lockAccount = function () {
    return this.api.accountLock(this.email, this.authPWVersion2 || this.authPW);
  };

  Client.prototype.resendAccountUnlockCode = function (lang) {
    return this.api.accountUnlockResendCode(this.email, this.options, lang);
  };

  Client.prototype.verifyAccountUnlockCode = function (uid, code) {
    return this.api.accountUnlockVerifyCode(uid, code);
  };

  Client.prototype.accountEmails = function () {
    return this.api.accountEmails(this.sessionToken);
  };

  Client.prototype.createEmail = function (email, verificationMethod) {
    return this.api.createEmail(this.sessionToken, email, {
      verificationMethod,
    });
  };

  Client.prototype.deleteEmail = function (email) {
    return this.api.deleteEmail(this.sessionToken, email);
  };

  Client.prototype.setPrimaryEmail = function (email) {
    return this.api.setPrimaryEmail(this.sessionToken, email);
  };

  Client.prototype.sendUnblockCode = function (email) {
    return this.api.sendUnblockCode(email);
  };

  Client.prototype.createTotpToken = function (options = {}) {
    return this.api.createTotpToken(this.sessionToken, options);
  };

  Client.prototype.deleteTotpToken = function () {
    return this.api.deleteTotpToken(this.sessionToken);
  };

  Client.prototype.checkTotpTokenExists = function () {
    return this.api.checkTotpTokenExists(this.sessionToken);
  };

  Client.prototype.verifyTotpCode = function (code, options = {}) {
    return this.api.verifyTotpCode(this.sessionToken, code, options);
  };

  Client.prototype.replaceRecoveryCodes = function (options = {}) {
    return this.api.replaceRecoveryCodes(this.sessionToken, options);
  };

  Client.prototype.getRecoveryCodesExist = function () {
    return this.api.getRecoveryCodesExist(this.sessionToken);
  };

  Client.prototype.consumeRecoveryCode = function (code, options = {}) {
    return this.api.consumeRecoveryCode(this.sessionToken, code, options);
  };

  Client.prototype.createRecoveryKey = function (
    recoveryKeyId,
    recoveryData,
    enabled = true
  ) {
    return this.api.createRecoveryKey(
      this.sessionToken,
      recoveryKeyId,
      recoveryData,
      enabled
    );
  };

  Client.prototype.getRecoveryKey = function (recoveryKeyId) {
    if (!this.accountResetToken) {
      throw new Error(
        'call verifyPasswordResetCode before calling getRecoveryKey'
      );
    }

    return this.api.getRecoveryKey(this.accountResetToken, recoveryKeyId);
  };

  Client.prototype.getRecoveryKeyExists = function () {
    return this.api.getRecoveryKeyExistsWithSession(this.sessionToken);
  };

  Client.prototype.deleteRecoveryKey = function () {
    return this.api.deleteRecoveryKey(this.sessionToken);
  };

  Client.prototype.resetAccountWithRecoveryKey = function (
    newPassword,
    kB,
    recoveryKeyId,
    headers,
    options = {}
  ) {
    if (this.options.version === 'V2') {
      return this.resetAccountWithRecoveryKeyV2(
        newPassword,
        kB,
        recoveryKeyId,
        headers,
        options
      );
    }

    if (!this.accountResetToken) {
      throw new Error(
        'call verifyPasswordResetCode before calling resetAccountWithRecoveryKey'
      );
    }

    let email = this.email;
    if (options && options.emailToHashWith) {
      email = options.emailToHashWith;
    }

    return this.setupCredentials(email, newPassword).then((/* bundle */) => {
      const wrapKb = options.undefinedWrapKb
        ? undefined
        : butil.xorBuffers(kB, this.unwrapBKey).toString('hex');
      return this.api
        .accountResetWithRecoveryKey(
          this.accountResetToken,
          this.authPW,
          wrapKb,
          recoveryKeyId,
          headers,
          options
        )
        .then((response) => {
          // Update to the new verified tokens
          this.sessionToken = response.sessionToken;

          if (options.keys) {
            this.keyFetchToken = response.keyFetchToken;
          }

          return response;
        });
    });
  };
  Client.prototype.resetAccountWithRecoveryKeyV2 = async function (
    newPassword,
    kB,
    recoveryKeyId,
    headers,
    options = {}
  ) {
    if (!this.accountResetToken) {
      throw new Error(
        'call verifyPasswordResetCode before calling resetAccountWithRecoveryKey'
      );
    }

    let email = this.email;
    if (options && options.emailToHashWith) {
      email = options.emailToHashWith;
    }

    await this.setupCredentials(email, newPassword);
    await this.setupCredentialsV2(email, newPassword);

    this.deriveWrapKbFromKb();
    this.deriveWrapKbVersion2FromKb();

    const response = await this.api.accountResetWithRecoveryKeyV2(
      this.accountResetToken,
      this.authPW,
      this.authPWVersion2,
      this.wrapKb,
      this.wrapKbVersion2,
      this.clientSalt,
      recoveryKeyId,
      headers,
      options
    );

    // Update to the new verified tokens
    this.sessionToken = response.sessionToken;

    if (options.keys) {
      this.keyFetchToken = response.keyFetchToken;
      this.keyFetchTokenVersion2 = response.keyFetchTokenVersion2;
    }
    return response;
  };

  Client.prototype.resetPassword = async function (
    newPassword,
    headers,
    options
  ) {
    if (!this.accountResetToken) {
      throw new Error(
        'call verifyPasswordResetCode before calling resetPassword'
      );
    }

    // With introduction of change email, the client can choose what to hash the password with.
    // To keep consistency, we hash with the email used to originally create the account.
    // This will generate a new wrapKb on the server
    let email = this.email;

    if (options && options.emailToHashWith) {
      email = options.emailToHashWith;
    }

    await this.setupCredentials(email, newPassword);
    const response = await this.api.accountReset(
      this.accountResetToken,
      this.authPW,
      headers,
      options
    );

    // Update to the new verified tokens
    this.sessionToken = response.sessionToken;
    this.keyFetchToken = response.keyFetchToken;
    this.keyFetchTokenVersion2 = response.keyFetchTokenVersion2;
    return response;
  };
  Client.prototype.resetPasswordV2 = async function (
    newPassword,
    headers,
    options
  ) {
    if (!this.accountResetToken) {
      throw new Error(
        'call verifyPasswordResetCode before calling resetPassword'
      );
    }

    let email = this.email;

    if (options && options.emailToHashWith) {
      email = options.emailToHashWith;
    }

    await this.setupCredentials(email, newPassword);
    const response = await this.api.accountReset(
      this.accountResetToken,
      this.authPW,
      headers,
      options
    );

    // Update to the new verified tokens
    this.sessionToken = response.sessionToken;
    this.keyFetchToken = response.keyFetchToken;
    this.keyFetchTokenVersion2 = response.keyFetchTokenVersion2;

    if (!this.kB) {
      await this.getKeysV1();
    }

    await this.upgradeCredentials(newPassword);

    return response;
  };

  Client.prototype.consumeSigninCode = function (code, metricsContext) {
    return this.api.consumeSigninCode(code, metricsContext);
  };

  Client.prototype.createSigninCode = function (metricsContext) {
    return this.api.createSigninCode(this.sessionToken, metricsContext);
  };

  Client.prototype.createAuthorizationCode = function (oauthParams) {
    return this.api.createAuthorizationCode(this.sessionToken, oauthParams);
  };

  Client.prototype.grantOAuthTokensFromSessionToken = function (oauthParams) {
    return this.api.grantOAuthTokensFromSessionToken(
      this.sessionToken,
      oauthParams
    );
  };

  Client.prototype.grantOAuthTokens = function (oauthParams) {
    return this.api.grantOAuthTokens(oauthParams);
  };

  Client.prototype.revokeOAuthToken = function (oauthParams) {
    return this.api.revokeOAuthToken(oauthParams);
  };

  Client.prototype.getScopedKeyData = function (oauthParams) {
    return this.api.getScopedKeyData(this.sessionToken, oauthParams);
  };

  Client.prototype.getSubscriptionClients = function (secret) {
    return this.api.getSubscriptionClients(secret);
  };

  Client.prototype.getSubscriptionPlans = function (refreshToken) {
    return this.api.getSubscriptionPlans(refreshToken);
  };

  Client.prototype.getActiveSubscriptions = function (refreshToken) {
    return this.api.getActiveSubscriptions(refreshToken);
  };

  Client.prototype.updatePayment = function (refreshToken, paymentToken) {
    return this.api.updatePayment(refreshToken, paymentToken);
  };

  Client.prototype.cancelSubscription = function (
    refreshToken,
    subscriptionId
  ) {
    return this.api.cancelSubscription(refreshToken, subscriptionId);
  };

  Client.prototype.reactivateSubscription = function (
    refreshToken,
    subscriptionId
  ) {
    return this.api.reactivateSubscription(refreshToken, subscriptionId);
  };

  Client.prototype.upgradeCredentials = async function (newPassword, headers) {
    const resStart = await this.api.passwordChangeStart(
      this.email,
      this.authPW,
      headers || {}
    );

    this.keyFetchToken = resStart.keyFetchToken;
    this.passwordChangeToken = resStart.passwordChangeToken;

    if (!this.keyFetchToken) {
      throw new Error('New key fetch token not returned!');
    }

    if (!this.kB) {
      await this.getKeysV1();
    }

    await this.setupCredentialsV2(this.email, newPassword);
    await this.deriveWrapKbVersion2FromKb();

    const resFinish = await this.api.passwordChangeFinishV2(
      this.passwordChangeToken,
      this.authPW,
      this.authPWVersion2,
      this.wrapKb,
      this.wrapKbVersion2,
      this.clientSalt,
      headers || {},
      undefined
    );

    return resFinish;
  };

  Client.prototype.getClientSalt = async function (email) {
    const response = await this.getCredentialsStatus(email || this.email);
    return response?.clientSalt;
  };

  Client.prototype.getCredentialsStatus = async function (
    email,
    originalLoginEmail
  ) {
    try {
      const response = await this.api.getCredentialsStatus(
        originalLoginEmail || email
      );
      return response;
    } catch (error) {
      return {};
    }
  };

  Client.prototype.generateNewWrapKb = function () {
    if (!this.unwrapBKey) {
      throw new Error('unwrapBKey never determined. Aborting operation.');
    }

    // When creating new version 2 credentials, we can
    // create the wrapKb client side and provided it to
    // the server. This saves us a round trip during
    // account creation.
    //
    // Alternatively we can let the server-side generate the value, and
    // we can issue a second upgrade credentials call. See v2 account create
    // test for examples.
    //
    this.wrapKb = crypto.randomBytes(32).toString('hex');
    this.kB = butil.xorBuffers(this.wrapKb, this.unwrapBKey).toString('hex');
  };

  Client.prototype.deriveWrapKbFromKb = function () {
    if (!this.kB) {
      throw new Error('kB never determined! Aborting operation.');
    }

    if (!this.unwrapBKey) {
      throw new Error('unwrapBKey never determined. Aborting operation.');
    }

    // By deriving the value this way, we ensure a single kB value. Note that this relies on the
    // fact the server will be using the current wrapKb for the V1 password
    this.wrapKb = butil.xorBuffers(this.kB, this.unwrapBKey).toString('hex');
  };

  Client.prototype.deriveWrapKbVersion2FromKb = function () {
    if (!this.kB) {
      throw new Error('kB never set. Aborting operation.');
    }

    if (!this.unwrapBKeyVersion2) {
      throw new Error('unwrapBKeyVersion2 never set. Aborting operation.');
    }

    // By deriving the value this way, we ensure a single kB value. Note that this relies on the
    // fact the server will be using the current wrapKb for the V1 password
    this.wrapKbVersion2 = butil
      .xorBuffers(this.kB, this.unwrapBKeyVersion2)
      .toString('hex');
  };

  Client.prototype.getKeys = async function (keyFetchToken) {
    if (!keyFetchToken) {
      throw new Error('must supply key fetch token');
    }
    const data = await this.api.accountKeys(keyFetchToken);
    const token = await tokens.KeyFetchToken.fromHex(keyFetchToken);
    return await token.unbundleKeys(data.bundle);
  };
  Client.prototype.getKeysV1 = async function () {
    try {
      const keys = await this.getKeys(this.keyFetchToken);
      this.keyFetchToken = null;
      keys.kB = butil.xorBuffers(keys.wrapKb, this.unwrapBKey).toString('hex');

      this.kA = keys.kA;
      this.kB = keys.kB;
      this.wrapKb = keys.wrapKb;
      return keys;
    } catch (err) {
      if (err && err.errno !== 104) {
        this.keyFetchTokenVersion2 = null;
      }
      throw err;
    }
  };
  Client.prototype.getKeysV2 = async function () {
    try {
      const keys = await this.getKeys(this.keyFetchTokenVersion2, true);
      this.keyFetchTokenVersion2 = null;
      keys.kB = butil
        .xorBuffers(keys.wrapKb, this.unwrapBKeyVersion2)
        .toString('hex');

      this.kA = keys.kA;
      this.kB = keys.kB;
      this.wrapKbVersion2 = keys.wrapKb;
      this.keyFetchTokenVersion2 = null;

      return keys;
    } catch (err) {
      if (err && err.errno !== 104) {
        this.keyFetchTokenVersion2 = null;
      }
      throw err;
    }
  };

  Client.prototype.getState = function () {
    if (this.options.version === 'V2') {
      return {
        version: this.options.version,
        kB: this.kB,
        wrapKb: this.wrapKbVersion2,
        unwrapBKey: this.unwrapBKeyVersion2,
        authPW: this.authPWVersion2,
        keyFetchToken: this.keyFetchTokenVersion2,
      };
    }
    return {
      version: this.options.version,
      kB: this.kB,
      wrapKb: this.wrapKb,
      unwrapBKey: this.unwrapBKey,
      authPW: this.authPW,
      keyFetchToken: this.keyFetchToken,
    };
  };

  Client.prototype.stubAccount = async function (clientId) {
    return await this.api.stubAccount(this.email, clientId);
  };

  Client.prototype.finishAccountSetup = async function (token) {
    let response;
    if (this.options.version === 'V2') {
      await this.generateNewWrapKb();
      await this.deriveWrapKbVersion2FromKb();
      response = await this.api.finishAccountSetup(
        token,
        this.email,
        this.authPW.toString('hex'),
        this.wrapKb,
        this.authPWVersion2.toString('hex'),
        this.wrapKbVersion2,
        this.clientSalt
      );
    } else {
      response = await this.api.finishAccountSetup(
        token,
        this.email,
        this.authPW.toString('hex')
      );
    }

    const uid = response.uid;
    const sessionToken = response.sessionToken;
    const verified = response.verified;

    return { uid, sessionToken, verified };
  };

  return Client;
};
